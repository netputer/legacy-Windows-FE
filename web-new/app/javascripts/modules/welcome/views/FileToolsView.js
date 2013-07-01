/*global define*/
(function (window, document, undefined) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'Log',
        'ui/TemplateFactory',
        'ui/AlertWindow',
        'ui/PopupTip',
        'ui/PopupPanel',
        'FunctionSwitch',
        'Internationalization',
        'utilities/StringUtil',
        'Configuration',
        'Device',
        'IO',
        'backuprestore/BackupController',
        'backuprestore/RestoreController',
        'welcome/WelcomeService',
        'sync/views/AccountGuideView'
    ], function (
        Backbone,
        _,
        doT,
        $,
        log,
        TemplateFactory,
        AlertWindow,
        PopupTip,
        PopupPanel,
        FunctionSwitch,
        i18n,
        StringUtil,
        CONFIG,
        Device,
        IO,
        BackupController,
        RestoreController,
        WelcomeService,
        AccountGuideView
    ) {
        console.log('FileToolsView - File loaded.');

        var alert = window.alert;
        var flashPanel;

        var closedByUser = false;

        var addPanel = function () {
            if (Device.get('isConnected') && Device.get('isFlashed')) {
                this.addFlashPanel();
            }
        };

        var FileToolsView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('welcome', 'file-tools')),
            className : 'w-welcome-filetools-ctn',
            initialize : function () {
                this.listenTo(Device, 'change', function (Device) {
                    this.$el.toggle(Device.get('isConnected'));
                    this.$('.button-open-sd').prop({
                        disabled : !(Device.get('hasSDCard') || Device.get('hasEmulatedSD'))
                    });
                    if (!Device.get('isAutoBackup')) {
                        this.toggleAutoBackuoCtn(false);
                    }
                });

                this.listenTo(Device, 'change:isConnected change:isFlashed', _.debounce(addPanel));

                IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.AUTO_BACKUP_START
                }, function () {
                    // ignore the message if it's not an offline device
                    // the "Device.isAutoBackup" is not trustable at this time
                    Device.isDeviceAutoBackupAsync().done(function (resp) {
                        console.log('FileToolsView - Auto-backup start. ');
                        var is_auto_backup = JSON.parse(resp.body.value);
                        if (is_auto_backup) {
                            this.toggleAutoBackuoCtn(true);
                            this.setAutoBackupStatusAsInProcess();
                        }
                    }.bind(this));
                }, this);

                IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.AUTO_BACKUP_COMPLETE
                }, function () {
                    Device.isDeviceAutoBackupAsync().done(function (resp) {
                        console.log('FileToolsView - Auto-backup finish. ');
                        var is_auto_backup = JSON.parse(resp.body.value);
                        if (is_auto_backup) {
                            this.toggleAutoBackuoCtn(true);
                            this.setAutoBackupStatusAsComplete();
                            this.fillAutoBackupData();
                        }
                    }.bind(this));
                }, this);
            },
            render : function () {
                this.$el.html(this.template({}));

                setTimeout(function () {
                    this.$el.toggle(Device.get('isConnected'));
                    this.toggleAutoBackuoCtn(Device.get('isAutoBackup'));
                }.bind(this), 0);

                this.toggleAutoBackuoCtn(false);
                this.fillAutoBackupData();

                var tip = new PopupTip({
                    $host : this.$('.button-auto-backup')
                });

                this.addFlashPanel();

                this.$('.button-open-sd').prop({
                    disabled : !(Device.get('hasSDCard') || Device.get('hasEmulatedSD'))
                });

                return this;
            },
            addFlashPanel : function () {
                // Don't show again if closed by user or already showed
                if (closedByUser ||
                        !Device.get('isConnected') || !Device.get('isFlashed') ||
                        Device.get('isMounted') || !Device.get('isAutoBackup') ||
                        window.SnapPea.CurrentModule !== 'welcome') {
                    return;
                }

                flashPanel = new PopupPanel({
                    $content : $(doT.template(TemplateFactory.get('welcome', 'flash-tip'))({})),
                    $host : this.$('.button-restore')
                });

                flashPanel.once('show', function () {
                    flashPanel.$content.one('click', '.button-close', function () {
                        closedByUser = true;
                        flashPanel.remove();
                        flashPanel.destoryBlurToHideMixin();
                        this.stopListening(Device, 'change:isConnected change:isFlashed');
                    }.bind(this));

                    flashPanel.listenTo(Backbone, 'switchModule', function (data) {
                        flashPanel.$el.toggle(data.module === 'welcome' && !closedByUser);
                    });

                    flashPanel.listenTo(Device, 'change:isConnected', function (Device, isConnected) {
                        if (!isConnected) {
                            flashPanel.remove();
                            flashPanel.destoryBlurToHideMixin();
                        }
                    });
                }, this);

                setTimeout(function () {
                    flashPanel.show();
                }, 0);

                log({
                    'event' : 'debug.flash.popup.show'
                });
            },
            fillAutoBackupData : function () {
                WelcomeService.getAutoBackupDateAsync().done(function (resp) {
                    var ms = parseInt(resp.body.value, 10);
                    var date = StringUtil.formatDate("yyyy-MM-dd", ms);
                    var tip = StringUtil.format(i18n.welcome.AUTO_BACKUP_TIP_COMPLETE, date);
                    this.$('.button-auto-backup').data({
                        title : tip
                    });
                    this.toggleAutoBackuoCtn(true);
                }.bind(this)).fail(function () {
                    this.toggleAutoBackuoCtn(false);
                }.bind(this));
            },
            toggleAutoBackuoCtn : function (toggle) {
                this.$('.auto-backup-ctn').toggle(toggle);
                this.$('.button-backup').toggle(!toggle);
            },
            setAutoBackupStatusAsInProcess : function () {
                this.$('.icon').removeClass('open-folder-black').addClass('in-process');
                this.$('.button-auto-backup').data({
                    title : i18n.welcome.AUTO_BACKUP_TIP_IN_PROGRESS
                });
            },
            setAutoBackupStatusAsComplete : function () {
                this.$('.icon').addClass('open-folder-black').removeClass('in-process');
            },
            showTipForOpenAutoBackupFile : function () {
                var $tip = $('<div>').append($('<p>').html(i18n.welcome.TIP_IN_OPEN_FILE1)).
                                      append($('<p>').html(i18n.welcome.TIP_IN_OPEN_FILE2));
                alert($tip);
            },
            clickButtonOpenSD : function () {
                // Disable the button for 2 seconds
                var $btn = this.$('.button-open-sd').prop('disabled', true);
                setTimeout(function () {
                    $btn.prop('disabled', false);
                }.bind(this), 2000);

                Device.manageSDCardAsync();

                log({
                    'event' : 'ui.click.welcome.button.manage.sd'
                });
            },
            clickButtonBackup : function () {
                // Disable backup restore with wifi in i18n version
                if (!FunctionSwitch.ENABLE_CLOUD_BACKUP_RESTORE && !Device.get('isUSB')) {
                    alert(i18n.backup_restore.TIP_IN_WIFI);
                    return;
                }

                BackupController.start();

                log({
                    'event' : 'ui.click.welcome.button.backup',
                    'isUSB' : Device.get('isUSB')
                });
            },
            clickButtonRestore : function () {
                // Disable backup restore with wifi in i18n version
                if (!FunctionSwitch.ENABLE_CLOUD_BACKUP_RESTORE && !Device.get('isUSB')) {
                    alert(i18n.backup_restore.TIP_IN_WIFI);
                    return;
                }

                var from = '';
                if (flashPanel) {
                    from = 'flashPanel';
                    flashPanel.remove();
                    flashPanel.destoryBlurToHideMixin();
                }
                RestoreController.start();

                log({
                    'event' : 'ui.click.welcome.button.restore',
                    'isUSB' : Device.get('isUSB'),
                    'from' : from
                });
            },
            clickButtonAutoBackup : function () {
                if (!this.$('.button-auto-backup .icon').hasClass('in-process')) {
                    WelcomeService.openAutobackupFileAsync().fail(function () {
                        this.toggleAutoBackuoCtn(false);
                        this.showTipForOpenAutoBackupFile();
                    }.bind(this));

                    // Disable the button for 2 seconds
                    var $btn = this.$('.button-auto-backup').prop('disabled', true);
                    setTimeout(function () {
                        $btn.prop('disabled', false);
                    }, 2000);

                    log({
                        'event' : 'ui.click.welcome.button.open.auto.backup'
                    });
                }
            },
            events : {
                'click .button-open-sd' : 'clickButtonOpenSD',
                'click .button-backup' : 'clickButtonBackup',
                'click .button-group-backup' : 'clickButtonBackup',
                'click .button-restore' : 'clickButtonRestore',
                'click .button-auto-backup' : 'clickButtonAutoBackup'
            }
        });

        var fileToolsView;

        var factory = _.extend({
            getInstance : function (args) {
                if (!fileToolsView) {
                    fileToolsView = new FileToolsView(args);
                }
                return fileToolsView;
            }
        });

        return factory;
    });
}(this, this.document));
