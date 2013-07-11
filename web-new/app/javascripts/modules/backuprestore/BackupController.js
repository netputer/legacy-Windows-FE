/*global define*/
(function (window) {
    define([
        'backbone',
        'Account',
        'Device',
        'Internationalization',
        'FunctionSwitch',
        'Configuration',
        'main/views/BindingDeviceWindowView',
        'welcome/WelcomeService',
        'ui/AlertWindow',
        'IOBackendDevice',
        'backuprestore/BackupRestoreService',
        'backuprestore/models/BackupContextModel',
        'backuprestore/views/BackupRestoreChooseTypeView',
        'backuprestore/views/BackupRestoreChooseDataView',
        'backuprestore/views/BackupChooseAppTypeView',
        'backuprestore/views/BackupChooseLocationView',
        'backuprestore/views/BackupProgressView',
        'backuprestore/views/ErrorItemListView',
        'backuprestore/views/ErrorRetryView',
        'backuprestore/views/BackupRemoteProgressView',
        'backuprestore/views/BackupAutoTipView',
        'backuprestore/views/BackupRemoteErrorView'
    ], function (
        Backbone,
        Account,
        Device,
        i18n,
        FunctionSwitch,
        CONFIG,
        BindingDeviceWindowView,
        WelcomeService,
        AlertWindow,
        IO,
        BackupRestoreService,
        BackupContextModel,
        BackupRestoreChooseTypeView,
        BackupChooseRestoreDataView,
        BackupChooseAppTypeView,
        BackupChooseLocationView,
        BackupProgressView,
        ErrorItemListView,
        ErrorRetryView,
        BackupRemoteProgressView,
        BackupAutoTipView,
        BackupRemoteErrorView
    ) {
        console.log('BackupController - File loaded. ');

        var alert = window.alert;
        var confirm = window.confirm;

        var backupChooseTypeView;
        var backupChooseDataView;
        var backupChooseAppTypeView;
        var backupChooseLocationView;
        var backupProgressView;
        var errorItemListAppView;
        var errorItemListAppDataView;
        var errorRetryView;
        var backupRemoteProgressView;
        var backupAutoTipLocalView;
        var backupAutoTipRemoteView;
        var backupRemoteErrorView;

        var loginHandler;

        var BackupController = Backbone.View.extend({
            initialize : function () {
                backupChooseTypeView = BackupRestoreChooseTypeView.getBackupInstance();
                backupChooseDataView = BackupChooseRestoreDataView.getBackupInstance();
                backupChooseAppTypeView = BackupChooseAppTypeView.getInstance();
                backupChooseLocationView = BackupChooseLocationView.getInstance();
                backupProgressView = BackupProgressView.getInstance();
                errorItemListAppView = ErrorItemListView.getInstance();
                errorItemListAppDataView = ErrorItemListView.getInstance();
                errorRetryView = ErrorRetryView.getBackupInstance();
                backupRemoteProgressView = BackupRemoteProgressView.getInstance();
                backupAutoTipLocalView = BackupAutoTipView.getLocalInstance();
                backupAutoTipRemoteView = BackupAutoTipView.getRemoteInstance();
                backupRemoteErrorView = BackupRemoteErrorView.getInstance();

                this.buildEvents();
            },
            buildEvents : function () {
                backupChooseTypeView.off('_NEXT_STEP');
                backupChooseDataView.off('_LAST_STEP');
                backupChooseDataView.off('_NEXT_STEP');
                backupChooseAppTypeView.off('_NEXT_STEP');
                backupChooseLocationView.off('_NEXT_STEP');
                errorItemListAppView.off('_NEXT_STEP');
                errorItemListAppDataView.off('_NEXT_STEP');
                errorRetryView.off('_NEXT_STEP');
                backupRemoteProgressView.off('_NEXT_STEP');
                backupAutoTipLocalView.off('_NEXT_STEP');
                backupAutoTipRemoteView.off('_NEXT_STEP');

                backupChooseTypeView.on('_NEXT_STEP', function () {
                    BackupRestoreService.recordCurrentBackupAsync();

                    if (BackupContextModel.IsLocal || Account.get('isLogin')) {
                        this.showNextAndRemoveCurrent(backupChooseTypeView, backupChooseDataView);
                    } else {
                        // need to login
                        Account.loginAsync('', 'backup-restore');

                        loginHandler = IO.Backend.Device.onmessage({
                            'data.channel' : CONFIG.events.ACCOUNT_STATE_CHANGE
                        }, function (message) {
                            if (message.auth) {
                                this.showNextAndRemoveCurrent(backupChooseTypeView, backupChooseDataView);
                            } else {
                                alert(i18n.backup_restore.LOGIN_FAILED_TIP);
                            }

                            IO.Backend.Device.offmessage(loginHandler);
                            loginHandler = undefined;
                        }, this);
                    }
                }, this);

                backupChooseTypeView.on('button_cancel', function () {
                    if (loginHandler) {
                        IO.Backend.Device.offmessage(loginHandler);
                    }
                });

                backupChooseDataView.on('_LAST_STEP', function () {
                    this.showNextAndRemoveCurrent(backupChooseDataView, backupChooseTypeView);
                }, this);

                backupChooseDataView.on('_NEXT_STEP', function () {
                    if (BackupContextModel.IsLocal) {
                        this.startBackupLocal();
                    } else {
                        this.startBackupRemote();
                    }
                }, this);

                backupChooseDataView.on('_TIME_OUT', function () {
                    backupChooseTypeView.show();
                }, this);

                backupChooseAppTypeView.on('_NEXT_STEP', function () {
                    backupChooseAppTypeView.remove();
                    this.showNextAndRemoveCurrent(backupChooseDataView, backupChooseLocationView);
                }, this);

                backupChooseLocationView.on('_LAST_STEP', function () {
                    this.showNextAndRemoveCurrent(backupChooseLocationView, backupChooseDataView);
                }, this);

                backupChooseLocationView.on('_NEXT_STEP', function () {
                    // check connect status
                    if (!Device.get('isConnected')) {
                        alert(i18n.backup_restore.CONNECT_LOST);
                        return;
                    }

                    // check file path
                    if (!BackupContextModel.IsFileNameReady) {
                        alert(i18n.backup_restore.FILE_PATH_INVALID);
                        return;
                    }
                    BackupRestoreService.checkFileAsync(BackupContextModel.GetFullFilePath).done(function (resp) {
                        var status_code = parseInt(resp.body.value, 10);
                        // file path exist
                        if (status_code === 1) {
                            confirm(i18n.backup_restore.OVERWIRTE_EXISTS_FILE_TIP, this.startBackupSmsAndContact, this);
                            return;
                        }
                        // file path ok
                        this.startBackupSmsAndContact();
                    }.bind(this)).fail(function () {
                        alert(i18n.backup_restore.FILE_PATH_INVALID);
                    });
                }, this);

                backupProgressView.on('_APP_ERROR_LIST', function () {
                    errorItemListAppView.setItemType(CONFIG.enums.BR_TYPE_APP);
                    errorItemListAppView.show();
                }, this);

                backupProgressView.on('_APP_DATA_ERROR_LIST', function () {
                    errorItemListAppDataView.setItemType(CONFIG.enums.BR_TYPE_APP_DATA);
                    errorItemListAppDataView.show();
                }, this);

                backupProgressView.on('_APP_DATA_ERROR_ALL', function () {
                    errorRetryView.setContent(BackupContextModel.get('appDataErrorMessage'));
                    errorRetryView.show();
                }, this);

                backupProgressView.on('_NEED_USER_CONFIRM', function () {
                }, this);

                backupProgressView.on('_BACKUP_FINISH', function () {
                    backupProgressView.remove();

                    if (!Device.get('isAutoBackup')) {
                        if (FunctionSwitch.ENABLE_AUTOBACKUP_POPUP) {
                            backupAutoTipLocalView.show();
                        }
                    }
                }, this);

                backupAutoTipLocalView.on('_NEXT_STEP', function () {
                    backupAutoTipLocalView.remove();
                    BindingDeviceWindowView.getInstance().loadContentAndShow();
                }, this);

                backupRemoteProgressView.on('_BACKUP_FINISH', function () {
                    backupRemoteProgressView.remove();

                    BackupRestoreService.getRemoteAutoBackupSwitchAsync().done(function (resp) {
                        if (!resp.body.value) {
                            backupAutoTipRemoteView.show();
                        }
                    });
                }, this);

                backupRemoteProgressView.on('_ERROR', function () {
                    backupRemoteErrorView.show();
                }, this);

                backupRemoteErrorView.on('_RETRY', function () {
                    backupRemoteProgressView.startBackupRemote();
                    backupRemoteErrorView.remove();
                }, this);

                backupRemoteErrorView.on('_CANCEL', function () {
                    backupRemoteErrorView.remove();
                    backupRemoteProgressView.remove();
                }, this);

                backupAutoTipRemoteView.on('_NEXT_STEP', function () {
                    backupAutoTipRemoteView.remove();
                    BackupRestoreService.setRemoteAutoBackupSwitchAsync();
                }, this);

                errorItemListAppView.on('_RETYR', function () {
                    backupProgressView.startBackupApps();
                    errorItemListAppView.remove();
                }, this);

                errorItemListAppView.on('_IGNORE', function () {
                    if (BackupContextModel.IsAppDataSelected) {
                        backupProgressView.startBackupAppData();
                    } else {
                        backupProgressView.backupAllFinish();
                    }
                    errorItemListAppView.remove();
                }, this);

                errorItemListAppDataView.on('_RETYR', function () {
                    backupProgressView.startBackupAppData();
                    errorItemListAppDataView.remove();
                }, this);

                errorItemListAppDataView.on('_IGNORE', function () {
                    backupProgressView.backupAllFinish();
                    errorItemListAppDataView.remove();
                }, this);

                errorRetryView.on('_RETYR', function () {
                    backupProgressView.startBackupAppData();
                    errorRetryView.remove();
                }, this);

                errorRetryView.on('_IGNORE', function () {
                    backupProgressView.backupAllFinish();
                    errorRetryView.remove();
                }, this);
            },
            startBackupLocal : function () {
                if (BackupContextModel.IsAppSelected &&
                        BackupContextModel.get('dataNumList')[CONFIG.enums.BR_TYPE_APP] > 0 && FunctionSwitch.ENABLE_CLOUD_BACKUP_RESTORE) {
                    backupChooseAppTypeView.show();
                } else {
                    this.showNextAndRemoveCurrent(backupChooseDataView, backupChooseLocationView);
                }
            },
            startBackupRemote : function () {
                this.showNextAndRemoveCurrent(backupChooseDataView, backupRemoteProgressView);
            },
            startBackupSmsAndContact : function () {
                this.showNextAndRemoveCurrent(backupChooseLocationView, backupProgressView);
            },
            showNextAndRemoveCurrent : function (currentView, targetView) {
                var showHandler = function () {
                    currentView.remove();
                    targetView.off('show', showHandler);
                };
                targetView.on('show', showHandler, this);
                targetView.show();
            },
            start : function (isCloud) {
                loginHandler = undefined;
                BackupContextModel.clearCache();
                if (isCloud) {
                    BackupContextModel.set('backupType', 1);
                    backupChooseDataView.show();
                    return;
                }

                if (FunctionSwitch.ENABLE_CLOUD_BACKUP_RESTORE) {
                    backupChooseTypeView.show();
                } else {
                    BackupContextModel.set({
                        backupType : 0
                    });
                    backupChooseDataView.show();
                }
            }
        });

        var backupController = new BackupController();
        return backupController;
    });
}(this));
