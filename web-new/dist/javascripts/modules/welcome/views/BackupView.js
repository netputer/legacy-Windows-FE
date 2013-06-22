/*global define, console*/
(function (window, undefined) {
    define([
        'backbone',
        'underscore',
        'jquery',
        'doT',
        'Log',
        'ui/TemplateFactory',
        'ui/AlertWindow',
        'Internationalization',
        'utilities/StringUtil',
        'Configuration',
        'Device',
        'IO'
    ], function (
        Backbone,
        _,
        $,
        doT,
        log,
        TemplateFactory,
        AlertWindow,
        i18n,
        StringUtil,
        CONFIG,
        Device,
        IO
    ) {
        console.log('BackupView - File loaded.');

        var alert = window.alert;

        var BackupView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('welcome', 'auto-backup')),
            className : 'w-welcome-autobackup-ctn vbox',
            initialize : function () {
                Device.on('change:isConnected', function (Device, isConnected) {
                    if (isConnected) {
                        this.fillAutoBackupDate();
                    } else {
                        this.$el.hide();
                    }
                }, this);

                IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.AUTO_BACKUP_START
                }, function (message) {
                    this.setDescriptionMessage(i18n.welcome.START_AUTO_BACKUP);
                    this.$el.show();
                }, this);

                IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.AUTO_BACKUP_CHANGE
                }, function (message) {
                    // sync finished
                    if (message.progress !== CONFIG.enums.SYNC_PROGRESS_START) {
                        switch (message.data_type) {
                        case CONFIG.enums.SYNC_DATA_TYPE_CONTACTS:
                            this.setDescriptionMessage(i18n.welcome.AUTO_BACKUP_CONTACTS_COMPLETE);
                            break;
                        case CONFIG.enums.SYNC_DATA_TYPE_SMS:
                            this.setDescriptionMessage(i18n.welcome.AUTO_BACKUP_SMS_COMPLETE);
                            break;
                        case CONFIG.enums.SYNC_DATA_TYPE_PHOTO:
                            this.setDescriptionMessage(i18n.welcome.AUTO_BACKUP_PHOTO_COMPLETE);
                            break;
                        case CONFIG.enums.SYNC_DATA_TYPE_APP:
                            this.setDescriptionMessage(i18n.welcome.AUTO_BACKUP_APP_COMPLETE);
                            break;
                        default:
                            break;
                        }
                        this.$el.show();
                    }
                }, this);

                IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.AUTO_BACKUP_COMPLETE
                }, function (message) {
                    this.setDescriptionMessage(i18n.welcome.AUTO_BACKUP_COMPLETE);
                    this.$el.show();
                    setTimeout(function () {
                        this.fillAutoBackupDate();
                    }.bind(this), 60 * 1000); // 1 minute
                }, this);
            },
            render : function () {
                this.$el.html(this.template({}));
                this.$el.hide();

                this.fillAutoBackupDate();
                return this;
            },
            setDescriptionMessage : function (content) {
                this.$('.auto-backup').html(content);
            },
            fillAutoBackupDate : function () {
                this.getAutoBackupDateAsync().done(function (resp) {
                    var ms = parseInt(resp.body.value, 10);
                    var date = StringUtil.formatDate("yyyy-MM-dd", ms);
                    this.setDescriptionMessage(StringUtil.format(i18n.welcome.AUTO_BACKUP, date));
                    this.$el.show();
                }.bind(this)).fail(function () {
                    this.$el.hide();
                }.bind(this));
            },
            getAutoBackupDateAsync : function () {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.GET_LATEST_AUTO_BACKUP,
                    success : function (resp) {
                        if (resp.state_line === 200) {
                            deferred.resolve(resp);
                        } else {
                            deferred.reject(resp);
                        }
                    }
                });

                return deferred.promise();
            },
            clickButtonOpenAutoBackupFile : function () {
                this.openAutobackupFileAsync().fail(function () {
                    this.$el.hide();
                    this.showTipForOpenAutoBackupFile();
                }.bind(this));

                // disable the button for 2 seconds
                var $btn = this.$('.button-open-file').prop('disabled', true);
                setTimeout(function () {
                    $btn.prop('disabled', false);
                }.bind(this), 2000);

                log({
                    'event' : 'ui.click.welcome.button.open.auto.backup'
                });
            },
            openAutobackupFileAsync : function () {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.OPEN_AUTO_BACKUP_FILE,
                    success : function (resp) {
                        if (resp.state_line === 200) {
                            deferred.resolve(resp);
                        } else {
                            deferred.reject(resp);
                        }
                    }
                });

                return deferred.promise();
            },
            showTipForOpenAutoBackupFile : function () {
                var $tip = $('<div>').append($('<p>').html(i18n.welcome.TIP_IN_OPEN_FILE1)).
                                      append($('<p>').html(i18n.welcome.TIP_IN_OPEN_FILE2));
                alert($tip);
            },
            events : {
                'click .button-open-file' : 'clickButtonOpenAutoBackupFile'
            }
        });

        var backupView;

        var factory = _.extend({
            getInstance : function (args) {
                if (!backupView) {
                    backupView = new BackupView(args);
                }
                return backupView;
            }
        });

        return factory;
    });
}(this));