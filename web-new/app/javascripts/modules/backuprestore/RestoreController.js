/*global define*/
(function (window) {
    define([
        'backbone',
        'Account',
        'Device',
        'underscore',
        'IOBackendDevice',
        'Configuration',
        'ui/AlertWindow',
        'Internationalization',
        'FunctionSwitch',
        'backuprestore/BackupRestoreService',
        'backuprestore/models/RestoreContextModel',
        'backuprestore/views/BackupRestoreChooseTypeView',
        'backuprestore/views/RestoreChooseFileView',
        'backuprestore/views/RestoreSelectFileFolderView',
        'backuprestore/views/BackupRestoreChooseDataView',
        'backuprestore/views/RestoreChooseAccountView',
        'backuprestore/views/RestoreProgressView',
        'backuprestore/views/ErrorItemListView',
        'backuprestore/views/RestoreDeleteDataView',
        'backuprestore/views/RestoreAppTipView',
        'backuprestore/views/RestoreRemoteListSnapshotView'
    ], function (
        Backbone,
        Account,
        Device,
        _,
        IO,
        CONFIG,
        AlertWindow,
        i18n,
        FunctionSwitch,
        BackupRestoreService,
        RestoreContextModel,
        BackupRestoreChooseTypeView,
        RestoreChooseFileView,
        RestoreSelectFileFolderView,
        BackupChooseRestoreDataView,
        RestoreChooseAccountView,
        RestoreProgressView,
        ErrorItemListView,
        RestoreDeleteDataView,
        RestoreAppTipView,
        RestoreRemoteListSnapshotView
    ) {
        console.log('BackupController - File loaded. ');

        var confirm = window.confirm;
        var alert = window.alert;
        var restoreChooseTypeView;
        var restoreChooseFileView;
        var restoreSelectFileFolderView;
        var restoreChooseDataViewLocal;
        var restoreChooseAccountView;
        var restoreProgressView;
        var errorItemListView;
        var restoreDeleteDataView;
        var restoreAppTipView;

        var restoreRemoteListSnapshotView;
        var restoreChooseDataViewRemote;

        var loginHandler;

        var RestoreController = Backbone.View.extend({
            initialize : function () {
                restoreChooseTypeView = BackupRestoreChooseTypeView.getRestoreInstance();
                restoreChooseFileView = RestoreChooseFileView.getInstance();
                restoreSelectFileFolderView = RestoreSelectFileFolderView.getInstance();
                restoreChooseDataViewLocal = BackupChooseRestoreDataView.getRestoreLocalInstance();
                restoreChooseAccountView = RestoreChooseAccountView.getInstance();
                restoreProgressView = RestoreProgressView.getInstance();
                errorItemListView = ErrorItemListView.getInstance();
                restoreDeleteDataView = RestoreDeleteDataView.getInstance();
                restoreAppTipView = RestoreAppTipView.getInstance();

                restoreRemoteListSnapshotView = RestoreRemoteListSnapshotView.getInstance();
                restoreChooseDataViewRemote = BackupChooseRestoreDataView.getRestoreRemoteInstance();

                this.buildEvents();
            },
            buildEvents : function () {
                restoreChooseTypeView.off('_NEXT_STEP');
                restoreChooseFileView.off('_LAST_STEP');
                restoreChooseFileView.off('_NEXT_STEP');
                restoreSelectFileFolderView.off('_NEXT_STEP');
                restoreChooseDataViewLocal.off('_LAST_STEP');
                restoreChooseDataViewLocal.off('_NEXT_STEP');
                restoreChooseAccountView.off('_NEXT_STEP');
                restoreProgressView.off('_NEXT_STEP');
                restoreAppTipView.off('_NEXT_STEP');
                restoreDeleteDataView.off('_NEXT_STEP');
                errorItemListView.off('_NEXT_STEP');

                restoreRemoteListSnapshotView.off('_LAST_STEP');
                restoreRemoteListSnapshotView.off('_NEXT_STEP');
                restoreChooseDataViewRemote.off('_LAST_STEP');
                restoreChooseDataViewRemote.off('_NEXT_STEP');

                restoreChooseTypeView.on('_NEXT_STEP', function () {
                    // restore local
                    if (RestoreContextModel.IsLocal) {
                        this.startRestoreLocal(restoreChooseTypeView);
                        return;
                    }

                    // restore mote
                    if (Account.get('isLogin')) {
                        this.startRestoreRemote();
                    } else {
                        // need to login
                        Account.loginAsync('', 'backup-restore');

                        loginHandler = IO.Backend.Device.onmessage({
                            'data.channel' : CONFIG.events.ACCOUNT_STATE_CHANGE
                        }, function (message) {
                            if (message.auth) {
                                this.startRestoreRemote();
                            } else {
                                alert(i18n.backup_restore.LOGIN_FAILED_TIP);
                            }

                            IO.Backend.Device.offmessage(loginHandler);
                        }, this);
                    }
                }, this);

                restoreChooseTypeView.on('button_cancel', function () {
                    IO.Backend.Device.offmessage(loginHandler);
                });

                restoreChooseFileView.on('_LAST_STEP', function () {
                    this.showNextAndRemoveCurrent(restoreChooseFileView, restoreChooseTypeView);
                }, this);

                restoreChooseFileView.on('_NEXT_STEP', function () {
                    this.showNextAndRemoveCurrent(restoreChooseFileView, restoreChooseDataViewLocal);
                }, this);

                restoreChooseFileView.on('_SELECT_FILE', function () {
                    this.showNextAndRemoveCurrent(restoreChooseFileView, restoreChooseDataViewLocal);
                }, this);

                restoreSelectFileFolderView.on('_SELECT_FOLDER', function () {
                    RestoreContextModel.set('backupFileList', []);
                    BackupRestoreService.listRestoreFileAsync().done(function (resp) {
                        RestoreContextModel.set('backupFileList', resp.body.back_file || []);
                        this.startRestoreLocal(restoreSelectFileFolderView);
                    }.bind(this));
                }, this);

                restoreSelectFileFolderView.on('_SELECT_FILE', function () {
                    this.showNextAndRemoveCurrent(restoreSelectFileFolderView, restoreChooseDataViewLocal);
                }, this);

                restoreChooseDataViewLocal.on('_LAST_STEP', function () {
                    this.startRestoreLocal(restoreChooseDataViewLocal);
                }, this);

                restoreChooseDataViewLocal.on('_NEXT_STEP', function () {
                    var battery = RestoreContextModel.get('battery');
                    if (battery > 0 && battery < 20) {
                        confirm(i18n.backup_restore.RESTORE_BATTERY_TIP, this.tryToStartRestore, this);
                    } else {
                        this.tryToStartRestore();
                    }
                }, this);

                restoreChooseAccountView.on('_NEXT_STEP', function () {
                    restoreChooseAccountView.remove();
                    if (RestoreContextModel.IsLocal) {
                        this.startRestoreSmsAndContact();
                    } else {
                        this.startDownloadRemoteFile();
                    }
                }, this);

                restoreProgressView.on('_NEXT_STEP', function () {
                    if (RestoreContextModel.IsNoneAppSelected) {
                        this.showNextAndRemoveCurrent(restoreProgressView, restoreDeleteDataView);
                    } else {
                        this.showNextAndRemoveCurrent(restoreProgressView, restoreAppTipView);
                    }
                }, this);

                restoreProgressView.on('_CONTACT_ERROR_LIST', function () {
                    errorItemListView.setItemType(CONFIG.enums.BR_TYPE_CONTACT);
                    errorItemListView.show();
                }, this);

                restoreProgressView.on('_SMS_ERROR_LIST', function () {
                    errorItemListView.setItemType(CONFIG.enums.BR_TYPE_SMS);
                    errorItemListView.show();
                }, this);

                errorItemListView.on('_RETYR', function () {
                    restoreProgressView.retryRestore();
                    errorItemListView.remove();
                }, this);

                errorItemListView.on('_IGNORE', function () {
                    restoreProgressView.resumeRestore();
                    errorItemListView.remove();
                }, this);

                restoreDeleteDataView.on('_NEXT_STEP', function () {
                    if (RestoreContextModel.IsAppSelected) {
                        this.showNextAndRemoveCurrent(restoreDeleteDataView, restoreAppTipView);
                    } else {
                        restoreDeleteDataView.remove();
                    }
                }, this);

                restoreAppTipView.on('_NEXT_STEP', function () {
                    restoreAppTipView.remove();
                }, this);

                // remote
                restoreRemoteListSnapshotView.on('_LAST_STEP', function () {
                    this.showNextAndRemoveCurrent(restoreRemoteListSnapshotView, restoreChooseTypeView);
                }, this);

                restoreRemoteListSnapshotView.on('_EMPTY_LIST', function () {
                    restoreRemoteListSnapshotView.remove();
                    RestoreContextModel.set('backupType', 0);
                    alert(i18n.backup_restore.RESTORE_REMOTE_EMPTY_LIST, function () {
                        restoreChooseTypeView.show();
                    }, this);
                }, this);

                restoreRemoteListSnapshotView.on('_NEXT_STEP', function () {
                    this.showNextAndRemoveCurrent(restoreRemoteListSnapshotView, restoreChooseDataViewRemote);
                }, this);

                restoreChooseDataViewRemote.on('_LAST_STEP', function () {
                    this.showNextAndRemoveCurrent(restoreChooseDataViewRemote, restoreRemoteListSnapshotView);
                }, this);

                restoreChooseDataViewRemote.on('_NEXT_STEP', function () {
                    if (RestoreContextModel.IsContactSelected && !RestoreContextModel.get('isAccountReady')) {
                        restoreChooseAccountView.show();
                    } else {
                        this.startDownloadRemoteFile();
                    }
                }, this);
            },
            startRestoreLocal : function (currentView) {
                var is_folder_empty = (RestoreContextModel.get('backupFileList').length === 0);
                var targetView = is_folder_empty ? restoreSelectFileFolderView : restoreChooseFileView;
                this.showNextAndRemoveCurrent(currentView, targetView);
            },
            tryToStartRestore : function () {
                if (RestoreContextModel.IsContactSelected && !RestoreContextModel.get('isAccountReady')) {
                    restoreChooseAccountView.show();
                } else {
                    this.startRestoreSmsAndContact();
                }
            },
            startRestoreRemote : function () {
                this.showNextAndRemoveCurrent(restoreChooseTypeView, restoreRemoteListSnapshotView);
            },
            startDownloadRemoteFile : function () {
                this.showNextAndRemoveCurrent(restoreChooseDataViewRemote, restoreProgressView);
            },
            startRestoreSmsAndContact : function () {
                if (RestoreContextModel.IsNoneAppSelected) {
                    this.showNextAndRemoveCurrent(restoreChooseDataViewLocal, restoreProgressView);
                } else {
                    restoreProgressView.startRestoreSmsAndContact();
                    this.showNextAndRemoveCurrent(restoreChooseDataViewLocal, restoreAppTipView);
                }
            },
            showNextAndRemoveCurrent : function (currentView, targetView) {
                if (currentView === targetView) {
                    return;
                }

                var showHandler = function () {
                    if (currentView !== undefined) {
                        currentView.remove();
                    }
                    targetView.off('show', showHandler);
                };
                targetView.on('show', showHandler, this);
                targetView.show();
            },
            listRestoreFile : function (callback) {
                RestoreContextModel.set('backupFileList', []);
                BackupRestoreService.listRestoreFileAsync().done(function (resp) {
                    RestoreContextModel.set('backupFileList', resp.body.back_file || []);
                    if (callback) {
                        callback();
                    }
                }.bind(this));
            },
            syncContactAccounts : function () {
                BackupRestoreService.syncContactAccountsAsync().done(function (resp) {
                    var accounts = (resp.body && resp.body.account) ? resp.body.account : [];
                    var writable_accounts = _.filter(accounts, function (item) {
                        return !item.read_only;
                    });

                    // has more than one writable accounts, should show the account select view
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
            },
            start : function () {
                RestoreContextModel.clearCache();
                this.syncContactAccounts();
                this.queryBatteryInfo();

                if (FunctionSwitch.ENABLE_CLOUD_BACKUP_RESTORE) {
                    restoreChooseTypeView.show();
                    this.listRestoreFile();
                } else {
                    RestoreContextModel.set({
                        backupType : 0
                    });
                    this.listRestoreFile(function () {
                        var is_folder_empty = (RestoreContextModel.get('backupFileList').length === 0);
                        var targetView = is_folder_empty ? restoreSelectFileFolderView : restoreChooseFileView;
                        targetView.show();
                    });
                }
            }
        });

        var restoreController = new RestoreController();
        return restoreController;
    });
}(this));
