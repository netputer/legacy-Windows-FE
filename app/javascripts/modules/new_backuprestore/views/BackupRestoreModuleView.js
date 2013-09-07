/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'Log',
        'Device',
        'task/views/TaskMonitorView',
        'new_backuprestore/BackupRestoreService',
        'new_backuprestore/views/StartView',
        'new_backuprestore/views/LocalBackupView',
        'new_backuprestore/views/RemoteBackupView',
        'new_backuprestore/views/RestoreView',
        'new_backuprestore/models/BackupContextModel',
        'new_backuprestore/models/RestoreContextModel'
    ], function (
        Backbone,
        _,
        doT,
        log,
        Device,
        TaskMonitorView,
        BackupRestoreService,
        StartView,
        LocalBackupView,
        RemoteBackupView,
        RestoreView,
        BackupContextModel,
        RestoreContextModel
    ) {
        console.log('BackupRestoreModuleView - File loaded');

        var BackupRestoreModuleView = Backbone.View.extend({
            className : 'w-backuprestore-module-main module-main vbox',
            initialize : function () {

                var rendered = false;
                var views = {};
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
                    }
                });
            },
            render : function () {

                this.rendered = true;
                return this;
            },
            removeViews : function () {

                _.map(this.views, function (view) {
                    view.remove();
                });
                this.views = {};
                this.stopListening();
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
                        break;
                    case 'RESTORE_LOCAL':
                    case 'RESTORE_REMOTE':
                        this.syncContactAccounts();
                        this.queryBatteryInfo();
                        this.showRestoreView(type === 'RESTORE_LOCAL');
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

                this.listenTo(localBackupView, '__TIME_OUT', function () {
                    localBackupView.remove();
                    this.showStartView();
                });

                this.listenTo(localBackupView, '__CANCEL __DONE', function () {
                    localBackupView.remove();
                    this.showStartView();
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

                this.listenTo(remoteBackupView, '__TIME_OUT', function () {
                    remoteBackupView.remove();
                    this.showStartView();
                });

                this.listenTo(remoteBackupView, '__CANCEL __DONE', function () {
                    remoteBackupView.remove();
                    this.showStartView();
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

                    Backbone.on('showModule', function (name) {
                        if (name === 'backup-restore') {
                            backupRestoreModuleView.showStartView();
                        }
                    });

                    Backbone.on('hideModule', function (name) {
                        if (name === 'backup-restore') {
                            backupRestoreModuleView.removeViews();
                        }
                    });
                }

                return backupRestoreModuleView;
            }
        });

        return factory;
    });
}(this));
