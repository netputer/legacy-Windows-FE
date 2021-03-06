/*global define*/
(function (window) {
    define([
        'jquery',
        'backbone',
        'underscore',
        'doT',
        'Log',
        'Device',
        'FunctionSwitch',
        'task/views/TaskMonitorView',
        'new_backuprestore/BackupRestoreService',
        'new_backuprestore/views/StartView',
        'new_backuprestore/views/LocalBackupView',
        'new_backuprestore/views/RemoteBackupView',
        'new_backuprestore/views/RestoreView',
        'new_backuprestore/models/BackupContextModel',
        'new_backuprestore/models/RestoreContextModel',
        'new_backuprestore/views/BackupAutoTipView',
        'main/views/BindingDeviceWindowView'
    ], function (
        $,
        Backbone,
        _,
        doT,
        log,
        Device,
        FunctionSwitch,
        TaskMonitorView,
        BackupRestoreService,
        StartView,
        LocalBackupView,
        RemoteBackupView,
        RestoreView,
        BackupContextModel,
        RestoreContextModel,
        BackupAutoTipView,
        BindingDeviceWindowView
    ) {
        console.log('BackupRestoreModuleView - File loaded');

        var backupAutoTipLocalView;
        var backupAutoTipRemoteView;

        var BackupRestoreModuleView = Backbone.View.extend({
            className : 'w-backuprestore-module-main module-main vbox',
            initialize : function () {

                var rendered = false;
                var views = {};
                var hasShowStartView = false;
                Object.defineProperties(this, {
                    rendered : {
                        set : function (value) {
                            rendered = Boolean(value);
                        },
                        get : function () {
                            return rendered;
                        }
                    },
                    views : {
                        set : function (value) {
                            views = value;
                        },
                        get : function () {
                            return views;
                        }
                    },
                    hasShowStartView : {
                        set : function (value) {
                            hasShowStartView = value;
                        },
                        get : function () {
                            return hasShowStartView;
                        }
                    }
                });
            },
            render : function () {

                this.rendered = true;
                this.showStartView();

                return this;
            },
            appendView : function (view) {
                this.$el.append(view.render().$el);
                view.initState();
            },
            showStartView : function () {

                if (this.views.start) {
                    this.appendView(this.views.start);
                    return;
                }

                var startView = StartView.getInstance();
                this.appendView(startView);
                this.views.start = startView;

                this.listenTo(startView, '__DO_ACTION', function (type) {

                    BackupContextModel.clearCache();
                    RestoreContextModel.clearCache();

                    startView.remove();
                    switch (type) {
                    case 'BACKUP_LOCAL':
                        this.showLocalBackupView();
                        BackupRestoreService.recordCurrentBackupAsync();
                        break;
                    case 'BACKUP_REMOTE':
                        this.showRemoteBackupView();
                        BackupRestoreService.recordCurrentBackupAsync();
                        BackupContextModel.set('backupType', 1);
                        break;
                    case 'RESTORE_LOCAL':
                    case 'RESTORE_REMOTE':
                        this.syncContactAccounts();
                        this.queryBatteryInfo();

                        var isLocal = (type === 'RESTORE_LOCAL');
                        this.showRestoreView(isLocal);

                        if (!isLocal) {
                            RestoreContextModel.set('backupType', 1);
                        }
                        break;
                    }
                });
            },
            showLocalBackupView : function () {

                if (this.views.localBackup) {
                    this.appendView(this.views.localBackup);
                    return;
                }

                var localBackupView = LocalBackupView.getInstance();
                this.appendView(localBackupView);
                this.views.localBackup = localBackupView;

                this.listenTo(localBackupView, '__CANCEL __DONE', function () {
                    localBackupView.remove();
                    this.showStartView();
                });

                this.listenTo(localBackupView, '__DONE', function () {
                    if (!backupAutoTipLocalView) {
                        backupAutoTipLocalView = BackupAutoTipView.getLocalInstance();

                        this.listenTo(backupAutoTipLocalView, '__YES', function () {
                            BindingDeviceWindowView.getInstance().show();
                        });
                    }

                    if (!Device.get('isAutoBackup')) {
                        if (FunctionSwitch.ENABLE_AUTOBACKUP_POPUP) {
                            backupAutoTipLocalView.show();
                        }
                    }
                });
            },
            showRemoteBackupView : function () {
                if (this.views.remoteBackup) {
                    this.appendView(this.views.remoteBackup);
                    return;
                }

                var remoteBackupView = RemoteBackupView.getInstance();
                this.appendView(remoteBackupView);
                this.views.remoteBackup = remoteBackupView;

                this.listenTo(remoteBackupView, '__CANCEL __DONE', function () {
                    remoteBackupView.remove();
                    this.showStartView();
                });

                this.listenTo(remoteBackupView, '__DONE', function () {

                    if (!backupAutoTipRemoteView) {
                        backupAutoTipRemoteView = BackupAutoTipView.getRemoteInstance();

                        this.listenTo(backupAutoTipRemoteView, '__YES', function () {
                            BackupRestoreService.setRemoteAutoBackupSwitchAsync().done(function () {

                                this.views.start.setRemoteState();

                            }.bind(this));
                        });
                    }

                    BackupRestoreService.getRemoteAutoBackupSwitchAsync().done(function (resp) {
                        if (!resp.body.value) {
                            backupAutoTipRemoteView.show();
                        }
                    });
                });
            },
            showRestoreView : function (isLocal) {
                var view;
                if (this.views.restore) {
                    view = this.views.restore;
                    view.isLocal = isLocal;
                    this.appendView(view);
                    return;
                }

                view = RestoreView.getInstance();
                view.isLocal = isLocal;
                this.appendView(view);
                this.views.restore = view;

                this.listenTo(view, '__CANCEL __DONE', function () {
                    view.remove();
                    this.showStartView();
                });

                this.listenTo(view, '__TASK_MANAGER', function () {
                    TaskMonitorView.getInstance().toggleListView(true);
                    view.remove();
                    this.showStartView();
                });
            },
            syncContactAccounts : function () {
                BackupRestoreService.syncContactAccountsAsync().done(function (resp) {
                    var accounts = (resp.body && resp.body.account) ? resp.body.account : [];
                    var writable_accounts = _.filter(accounts, function (item) {
                        return !item.read_only;
                    });

                    if (writable_accounts.length > 1) {
                        return;
                    }

                    RestoreContextModel.set('isAccountReady', true);
                    RestoreContextModel.set('accountType', writable_accounts[0].type || '');
                    RestoreContextModel.set('accountName', writable_accounts[0].name || '');
                });
            },
            queryBatteryInfo : function () {
                Device.getBatteryInfoAsync().done(function (resp) {
                    var battery = parseInt(resp.body.level, 10);
                    RestoreContextModel.set('battery', battery);
                });
            }
        });

        var backupRestoreModuleView;
        var factory = _.extend({
            enablePreload : false,
            getInstance : function (tab) {
                if (!backupRestoreModuleView) {
                    backupRestoreModuleView = new BackupRestoreModuleView();

                    if (tab !== undefined && tab !== 'normal') {
                        setTimeout(function () {
                            Backbone.trigger('switchModule', {
                                module : 'backup-restore',
                                tab : tab
                            });
                        }, 0);
                    }
                }

                return backupRestoreModuleView;
            }
        });

        return factory;
    });
}(this));
