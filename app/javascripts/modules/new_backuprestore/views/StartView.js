/*global define*/
(function (window) {
    define([
        'jquery',
        'backbone',
        'underscore',
        'doT',
        'Log',
        'Device',
        'utilities/StringUtil',
        'ui/TemplateFactory',
        'main/views/BindingDeviceWindowView',
        'new_backuprestore/BackupRestoreService',
        'Account',
        'IO',
        'Configuration.js',
        'Internationalization'
    ], function (
        $,
        Backbone,
        _,
        doT,
        log,
        Device,
        StringUtil,
        TemplateFactory,
        BindingDeviceWindowView,
        BackupRestoreService,
        Account,
        IO,
        CONFIG,
        i18n
    ) {
        console.log('StartView - File loaded.');

        var loginHandler;
        var changeStateHandler;
        var restoreLoginHandler;
        var backupLoginHandler;

        var localAction;
        var remoteAction;

        var StartView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('new_backuprestore', 'start')),
            className : "w-backuprestore-start vbox",
            remove : function () {
                StartView.__super__.remove.apply(this, arguments);

                _.map([loginHandler, changeStateHandler, backupLoginHandler, restoreLoginHandler], function (handler) {

                    if (handler) {
                        IO.Backend.Device.offmessage(handler);
                        handler = undefined;
                    }
                });
            },
            render : function () {

                _.extend(this.events, StartView.__super__.events);
                this.delegateEvents();

                this.$el.html(this.template({}));

                setTimeout(function () {
                    this.initState();
                }.bind(this), 0);

                return this;
            },
            initState : function () {

                BackupRestoreService.getLastBackupTimeAsync().done(function (resp) {
                    var date = parseInt(resp.body.value, 10);
                    date = StringUtil.formatDate('yyyy/MM/dd HH:mm', date);

                    this.$('.last-time').html(date);
                }.bind(this));

                this.setLocalState();
                this.listenTo(Device, 'change:isAutoBackup', function () {
                    this.setLocalState();
                });

                this.setRemoteState();
                changeStateHandler = IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.SYNC_CLOUD_SETTING_CHANGE
                }, function () {
                    this.setRemoteState();
                    this.setLocalState();
                }, this);

            },
            setRemoteState : function () {

                var isLogin = Account.get('isLogin');
                var title = this.$('.is-auto-backup-remote');
                var action = this.$('.do-action.remote');

                if (!isLogin) {
                    title.html(i18n.new_backuprestore.DISABLE);
                    action.html(i18n.new_backuprestore.DO_ENABLE);
                    remoteAction = 0;
                    return;
                }

                BackupRestoreService.getRemoteAutoBackupSwitchAsync().done(function (resp) {

                    if (resp.body.value) {
                        title.html(i18n.new_backuprestore.ENABLE);
                        action.html(i18n.new_backuprestore.DO_SETTING);
                        remoteAction = 1;
                    } else {
                        title.html(i18n.new_backuprestore.DISABLE);
                        action.html(i18n.new_backuprestore.DO_ENABLE);
                        remoteAction = 2;
                    }

                }.bind(this));

            },
            setLocalState : function () {

                var title = this.$('.is-auto-backup-local');
                var action = this.$('.do-action.local');
                var isAutoBackup = Device.get('isAutoBackup');

                if (!isAutoBackup) {
                    title.html(i18n.new_backuprestore.DISABLE);
                    action.html(i18n.new_backuprestore.DO_ENABLE);
                    localAction = 0;
                    return;
                }

                BackupRestoreService.checkLocalSwitchAsync().done(function (resp) {

                    if (resp.body.value) {
                        title.html(i18n.new_backuprestore.ENABLE);
                        action.html(i18n.new_backuprestore.DO_SETTING);
                        localAction = 1;
                    } else {
                        title.html(i18n.new_backuprestore.DISABLE);
                        action.html(i18n.new_backuprestore.DO_ENABLE);
                        localAction = 2;
                    }

                }.bind(this));
            },
            clickActionLocal : function () {

                switch (localAction) {
                case 0:
                    if (!this.bindingDeviceWindowView) {
                        this.bindingDeviceWindowView = BindingDeviceWindowView.getInstance();
                    }
                    this.bindingDeviceWindowView.loadContentAndShow();
                    break;
                case 1:
                    BackupRestoreService.openWindowSettingsAsync();
                    break;
                case 2:
                    BackupRestoreService.setLocalAutoBackupSwitchAsync().done(function () {
                        this.setLocalState();
                    }.bind(this));
                    break;

                }
            },
            clickActionRemote : function () {

                switch (remoteAction) {
                case 0:
                    Account.loginAsync('', 'backup-restore');
                    loginHandler = IO.Backend.Device.onmessage({
                        'data.channel' : CONFIG.events.ACCOUNT_STATE_CHANGE
                    }, function (message) {
                        if (message.auth) {
                            BackupRestoreService.setRemoteAutoBackupSwitchAsync().done(function () {
                                this.setRemoteState();
                            }.bind(this));
                        }

                        IO.Backend.Device.offmessage(loginHandler);
                        loginHandler = undefined;

                    }, this);
                    break;
                case 1:
                    BackupRestoreService.openWindowSettingsAsync();
                    break;
                case 2:
                    BackupRestoreService.setRemoteAutoBackupSwitchAsync().done(function () {
                        this.setRemoteState();
                    }.bind(this));

                    break;
                }
            },
            clickBackupLocal : function () {
                this.trigger('__DO_ACTION', 'BACKUP_LOCAL');
            },
            clickBackupRemote : function () {

                if (Account.get('isLogin')) {
                    this.trigger('__DO_ACTION', 'BACKUP_REMOTE');
                    return;
                }

                Account.loginAsync('', 'backup-restore');
                backupLoginHandler = IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.ACCOUNT_STATE_CHANGE
                }, function (message) {
                    if (message.auth) {
                        this.trigger('__DO_ACTION', 'BACKUP_REMOTE');
                    }

                    IO.Backend.Device.offmessage(backupLoginHandler);
                    backupLoginHandler = undefined;

                }, this);
            },
            clickRestoreLocal : function () {
                this.trigger('__DO_ACTION', 'RESTORE_LOCAL');
            },
            clickRestoreRemote : function () {

                if (Account.get('isLogin')) {
                    this.trigger('__DO_ACTION', 'RESTORE_REMOTE');
                    return;
                }

                Account.loginAsync('', 'backup-restore');
                restoreLoginHandler = IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.ACCOUNT_STATE_CHANGE
                }, function (message) {
                    if (message.auth) {
                        this.trigger('__DO_ACTION', 'RESTORE_REMOTE');
                    }

                    IO.Backend.Device.offmessage(restoreLoginHandler);
                    restoreLoginHandler = undefined;

                }, this);
            },
            events: {
                'click .do-action.local': 'clickActionLocal',
                'click .do-action.remote': 'clickActionRemote',
                'click .action-backup-local': 'clickBackupLocal',
                'click .action-backup-remote': 'clickBackupRemote',
                'click .action-restore-local': 'clickRestoreLocal',
                'click .action-restore-remote': 'clickRestoreRemote'
            }
        });

        var startView;
        var factory = _.extend({
            getInstance : function () {
                if (!startView) {
                    startView = new StartView();
                }
                return startView;
            }
        });

        return factory;
    });
}(this));
