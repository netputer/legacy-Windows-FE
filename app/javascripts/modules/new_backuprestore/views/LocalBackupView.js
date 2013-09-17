/*global define*/
(function (window) {
    define([
        'jquery',
        'backbone',
        'underscore',
        'doT',
        'Device',
        'Log',
        'IO',
        'Configuration',
        'Internationalization',
        'utilities/StringUtil',
        'WindowController',
        'main/collections/PIMCollection',
        'new_backuprestore/BackupRestoreService',
        'new_backuprestore/views/ConfirmWindowView',
        'new_backuprestore/views/BaseView',
        'new_backuprestore/views/BackupRestoreProgressView',
        'new_backuprestore/views/BackupFooterView',
        'new_backuprestore/views/LocalBackupAdvanceView',
        'new_backuprestore/views/BackupAppDataTipView',
        'new_backuprestore/models/BackupContextModel',
        'new_backuprestore/views/ErrorItemListView',
        'new_backuprestore/views/ErrorRetryView'
    ], function (
        $,
        Backbone,
        _,
        doT,
        Device,
        log,
        IO,
        CONFIG,
        i18n,
        StringUtil,
        WindowController,
        PIMCollection,
        BackupRestoreService,
        ConfirmWindowView,
        BaseView,
        BackupRestoreProgressView,
        BackupFooterView,
        LocalBackupAdvanceView,
        BackupAppDataTipView,
        BackupContextModel,
        ErrorItemListView,
        ErrorRetryView
    ) {

        console.log('LocalBackupView - File loaded');

        var confirm = ConfirmWindowView.confirm;
        var errorItemListView;
        var retryView;

        var footerView;
        var FooterView = BackupFooterView.extend({
            setButtonState : function (type) {
                this.$('.startbackup').hide();
                this.$('.advanced').hide();
                var $done = this.$('.done').hide();
                var $cancel = this.$('.cancel').hide();
                var $showfile = this.$('.showfile').hide();

                switch (type) {
                case 'progressing':
                    $cancel.show();
                    break;
                case 'done':
                    $done.show();
                    $showfile.show();
                    break;
                }
            }
        });

        var progressView;
        var ProgressView = BackupRestoreProgressView.extend({
            updateProgressStatus : function (type, status, current_count, all_count, errorMsg) {

                switch (type) {
                case CONFIG.enums.BR_TYPE_APP:
                    if (BackupContextModel.isAppDataSelected) {
                        //current_count = current_count / all_count * 100 / 2;
                        //all_count = 100;
                        all_count = BackupContextModel.get('dataNumList')[CONFIG.enums.BR_TYPE_APP_DATA] + BackupContextModel.get('dataNumList')[CONFIG.enums.BR_TYPE_APP];
                    }
                    break;
                case CONFIG.enums.BR_TYPE_APP_DATA:
                    //current_count = current_count / all_count * 100 / 2 + 50;
                    //all_count = 100;
                    current_count += BackupContextModel.get('dataNumList')[CONFIG.enums.BR_TYPE_APP];
                    all_count = BackupContextModel.get('dataNumList')[CONFIG.enums.BR_TYPE_APP] + BackupContextModel.get('dataNumList')[CONFIG.enums.BR_TYPE_APP_DATA];
                    break;
                }

                if (type === CONFIG.enums.BR_TYPE_APP || type === CONFIG.enums.BR_TYPE_APP_DATA) {
                    if (current_count >= 0 && all_count >= 0) {
                        this.updateProgress(type, current_count, all_count);
                        this.updateStatus(type, current_count, all_count);
                    }
                }

                //var pattern;
                switch (status) {
                case BackupRestoreService.CONSTS.BR_PI_STATUS.FINISHED:

                    if ((type !== CONFIG.enums.BR_TYPE_APP) && (type !== CONFIG.enums.BR_TYPE_APP_DATA)) {

                        var temp = function (type) {
                            var value = 0;
                            var all = all_count;
                            var step = parseInt(all / 100, 10) || 2;
                            var handle = setInterval(function () {
                                if (value >= all) {
                                    this.setContentState(type, true);
                                    this.setProgressState(type, false);
                                    this.updateStatus(type, value, all, true);
                                    window.clearInterval(handle);
                                    return;
                                }
                                value += step;
                                this.updateProgress(type, value, all);
                                this.updateStatus(type, value, all);

                            }.bind(this), 20);

                        }.bind(this);
                        temp(type);

                    } else if ((type === CONFIG.enums.BR_TYPE_APP && !BackupContextModel.isAppDataSelected) || type === CONFIG.enums.BR_TYPE_APP_DATA) {
                        this.setContentState(type, true);
                        this.setProgressState(type, false);
                        this.updateStatus(type, current_count, all_count, true);
                    }
                    break;
                case BackupRestoreService.CONSTS.BR_PI_STATUS.ERROR:

                    //pattern = i18n.new_backuprestore.BACKUP_FAILED;
                    //pattern += errorMsg || '';
                    //var desc = StringUtil.format(pattern, i18n.new_backuprestore.BR_TYPE_WORD_ENUM[type]);


                    //TODO:
                    //error = content.find('.error').text(desc);

                    this.setProgressState(type, false);
                    break;
                }
            }
        });

        var LocalBackupView = BaseView.extend({
            invalidPattern : '[/\\\\:?*"<>|]',
            initialize : function () {
                LocalBackupView.__super__.initialize.apply(this, arguments);

                var nonAppHandler;
                var appHandler;
                var appDataHandler;
                Object.defineProperties(this, {
                    nonAppHandler : {
                        set : function (value) {
                            nonAppHandler = value;
                        },
                        get : function () {
                            return nonAppHandler;
                        }
                    },
                    appHandler : {
                        set : function (value) {
                            appHandler = value;
                        },
                        get : function () {
                            return appHandler;
                        }
                    },
                    appDataHandler : {
                        set : function (value) {
                            appDataHandler = value;
                        },
                        get : function () {
                            return appDataHandler;
                        }
                    }
                });
            },
            render : function () {

                LocalBackupView.__super__.render.call(this);

                progressView = new ProgressView();
                this.$el.append(progressView.render().$el);

                footerView = new FooterView();
                this.$el.append(footerView.render().$el);

                return this;
            },
            cancel : function () {
                this.userCancelled = true;
                if (this.isProgressing) {

                    confirm(i18n.new_backuprestore.CANCEL_BACKUP, function () {

                        BackupRestoreService.backupCancelAsync(this.sessionId).done(function () {

                            this.isProgressing = false;
                            this.offMessageHandler();
                            this.releaseWindow();
                            this.trigger('__CANCEL');

                            log({
                                event : 'ui.new_backuprestore.backup_time',
                                timeStamp : new Date().getTime() - BackupContextModel.get('startTime'),
                                isLocal : true,
                                backupResult : 'cancel'
                            });

                        }.bind(this));
                    }, function () {
                        this.userCancelled = false;
                        footerView.toggleCancel(true);
                    }, this);

                    footerView.toggleCancel(false);
                } else {
                    this.releaseWindow();
                    this.trigger('__CANCEL');
                }
            },
            offMessageHandler : function () {
                if (this.nonAppHandler) {
                    IO.Backend.Device.offmessage(this.nonAppHandler);
                    this.nonAppHandler = undefined;
                }

                if (this.appHandler) {
                    IO.Backend.Device.offmessage(this.appHandler);
                    this.appHandler = undefined;
                }

                if (this.appDataHandler) {
                    IO.Backend.Device.offmessage(this.appDataHandler);
                    this.appDataHandler = undefined;
                }
            },
            bindEvent : function () {
                this.listenTo(footerView, '__DONE', function () {
                    this.trigger('__DONE');
                });

                this.listenTo(footerView, '__CANCEL', this.cancel);

                this.listenTo(footerView, '__START_BACKUP', function () {
                    this.setDomState(false);
                    this.startBackup();

                    $('.w-menu-pim .w-ui-syncing').data('title', i18n.new_backuprestore.NAV_BACKUPING);
                    PIMCollection.getInstance().get(20).set('syncing', true);

                    BackupContextModel.set('startTime', new Date().getTime());
                });
            },
            initState : function () {

                this.bindEvent();
                this.initAttrsState();
                var deviceName =  Device.get('deviceName');
                this.bigTitle = StringUtil.format(i18n.new_backuprestore.BACKUP_DEVICE_TITLE, deviceName);
                this.stateTitle = i18n.new_backuprestore.BACKUP_DEVICE_LOCAL_DESC;

                var initDone = [];
                initDone.push(BackupRestoreService.prepareBackupAsync().done(function (resp) {

                    var dataNumList = {};
                    _.each(resp.body.item, function (item) {
                        dataNumList[item.type] = item.count;
                    });
                    BackupContextModel.set('dataNumList', dataNumList);

                    progressView.contact = dataNumList[CONFIG.enums.BR_TYPE_CONTACT];
                    progressView.sms = dataNumList[CONFIG.enums.BR_TYPE_SMS];
                    progressView.app = dataNumList[CONFIG.enums.BR_TYPE_APP];

                }.bind(this)).fail(function (resp) {

                    log({
                        'event' : 'debug.backup.progress.error',
                        'type' : 4
                    });
                    alert(i18n.new_backuprestore.PERMISSION_TIP, this.cancel, this);

                }.bind(this)));

                initDone.push(BackupRestoreService.getSettingPathAsync().done(function (resp) {

                    var path = resp.body.value;
                    BackupContextModel.set('filePath', path);

                }.bind(this)).fail(function () {

                    BackupRestoreService.showAndRecordError(i18n.new_backuprestore.GET_FILE_PATH_FAILED, 0);
                    this.cancel();

                }.bind(this)));

                $.when.apply(this, initDone).done(function () {
                    footerView.enableBackupButton = true;
                });


                if (deviceName !== undefined && deviceName.length > 0) {
                    deviceName = deviceName.replace(/ /g, '_').replace(new RegExp(this.invalidPattern, "g"), '_');
                }
                var curDate = StringUtil.formatDate('yyyy-MM-dd-HH-mm-ss-', new Date().valueOf());
                var fileName = curDate + deviceName;
                BackupContextModel.set('fileName', fileName);

                this.listenTo(BackupContextModel, 'change:dataIDList', function (value) {
                    progressView.selectAppData = BackupContextModel.isAppDataSelected;
                });
            },
            remove: function () {

                progressView.remove();
                progressView = undefined;

                footerView.remove();
                footerView = undefined;

                if (errorItemListView) {
                    errorItemListView.remove();
                    errorItemListView = undefined;
                }

                if (retryView) {
                    retryView.remove();
                    retryView = undefined;
                }

                LocalBackupView.__super__.remove.apply(this, arguments);
            },
            setDomState : function (isDone) {
                footerView.setButtonState(isDone ? 'done' : 'progressing');
                this.stateTitle = isDone ? i18n.new_backuprestore.BACKUP_LOCAL_COMPLATE_TITLE : i18n.new_backuprestore.BACKUPING;

                if (isDone) {
                    this.bigTitle = i18n.new_backuprestore.BACKUP_FINISH_LABEL;
                }
            },
            startBackup : function () {

                WindowController.blockWindowAsync();

                var filePath = BackupContextModel.fileFullPath;
                var brSpec = BackupContextModel.brSpec;
                var finishedNum = 0;

                this.isProgressing = true;
                this.sessionId = _.uniqueId('backup.session_id_');
                this.setDomState(false);

                this.nonAppHandler = IO.Backend.Device.onmessage({
                    'data.channel' : this.sessionId
                }, function (data) {

                    //do nothing when
                    switch (data.status) {
                    case BackupRestoreService.CONSTS.BR_STATUS.RUNNING:
                        this.updateContactAndSms(data.item);
                        break;
                    case BackupRestoreService.CONSTS.BR_STATUS.FINISHED:
                        finishedNum++;
                        this.backupSmsAndContactFinish(finishedNum);
                        break;
                    case BackupRestoreService.CONSTS.BR_STATUS.ABORT:
                        this.isProgressing = false;
                        BackupRestoreService.logBackupContextModel(BackupContextModel, false);
                        alert(i18n.new_backuprestore.BACKUP_ABORT_TIP, this.cancel, this);
                        break;
                    case BackupRestoreService.CONSTS.BR_STATUS.READY:
                    case BackupRestoreService.CONSTS.BR_STATUS.PAUSED:
                    case BackupRestoreService.CONSTS.BR_STATUS.STOPPED:
                        break;
                    default:
                        this.isProgressing = false;
                        BackupRestoreService.logBackupContextModel(BackupContextModel, false);
                        alert(i18n.new_backuprestore.BACKUP_FAILED_TIP + data.status, this.cancel, this);
                        break;
                    }
                }, this);

                // TODO:
                //把获取APPPath的接口单独提出来，减少逻辑依赖， 需要后端支持
                BackupRestoreService.backupStartNonAppsAsync(filePath, this.sessionId, brSpec).done(function (resp) {

                    finishedNum++;
                    BackupContextModel.set('appPath', resp.body.value);
                    this.backupSmsAndContactFinish(finishedNum);

                }.bind(this)).fail(function (resp) {

                    if (this.userCancelled) {
                        return;
                    }

                    BackupRestoreService.showAndRecordError('debug.backup.progress.error', resp, 0, this.userCancelled);
                    BackupRestoreService.logBackupContextModel(BackupContextModel, false);

                    this.isProgressing = false;
                    this.cancel();

                }.bind(this));
            },
            startBackupApps : function () {

                if (this.userCancelled) {
                    return;
                }
                WindowController.blockWindowAsync();

                progressView.showProgress(CONFIG.enums.BR_TYPE_APP);
                if (BackupContextModel.get('dataNumList')[CONFIG.enums.BR_TYPE_APP] === 0) {
                    progressView.updateProgressStatus(CONFIG.enums.BR_TYPE_APP, BackupRestoreService.CONSTS.BR_PI_STATUS.FINISHED, 100, 100);
                    this.backupAllFinish();
                    return;
                }

                this.isProgressing = true;
                this.sessionId = _.uniqueId('backup.session_id_');

                var exportDir = BackupContextModel.get('appPath');
                var fileType = BackupContextModel.get('appType');

                this.appHandler = IO.Backend.Device.onmessage({
                    'data.channel' : this.sessionId
                }, function (data) {
                    progressView.updateProgressStatus(CONFIG.enums.BR_TYPE_APP, BackupRestoreService.CONSTS.BR_PI_STATUS.RUNNING, data.current, data.total);
                }, this);

                BackupRestoreService.backupStartAppsAsync(exportDir, this.sessionId, fileType).done(function (resp) {

                    var data = resp.body;
                    var success = data && data.success && data.success.length ? data.success.length : 0;
                    var failed = data && data.failed && data.failed.length ? data.failed.length : 0;

                    this.offMessageHandler();
                    this.isProgressing = false;

                    if (failed > 0) {
                        progressView.updateProgressStatus(CONFIG.enums.BR_TYPE_APP, BackupRestoreService.CONSTS.BR_PI_STATUS.ERROR, success, data.total);
                        BackupContextModel.set('appErrorList', data.failed);
                        this.showErrorListView(CONFIG.enums.BR_TYPE_APP);
                    } else {
                        progressView.updateProgressStatus(CONFIG.enums.BR_TYPE_APP, BackupRestoreService.CONSTS.BR_PI_STATUS.FINISHED, success, data.total);
                        if (BackupContextModel.isAppDataSelected) {
                            this.startBackupAppData();
                        } else {
                            this.backupAllFinish();
                        }
                    }
                }.bind(this)).fail(function (resp) {

                    if (this.userCancelled) {
                        return;
                    }

                    BackupRestoreService.showAndRecordError('debug.backup.progress.error', resp, 1, this.userCancelled);
                    BackupRestoreService.logBackupContextModel(BackupContextModel, false);

                    this.isProgressing = false;
                    this.cancel();

                }.bind(this));
            },
            startBackupAppData : function () {
                if (this.userCancelled) {
                    return;
                }
                WindowController.blockWindowAsync();

                this.isProgressing = true;
                this.sessionId = _.uniqueId('backup.session_id_');
                progressView.setProgressState(CONFIG.enums.BR_TYPE_APP_DATA, true);

                var exportDir = BackupContextModel.get('appPath');
                var tipView = BackupAppDataTipView.getInstance();

                this.appDataHandler = IO.Backend.Device.onmessage({
                    'data.channel' : this.sessionId
                }, function (data) {
                    if (data.message === CONFIG.enums.BACKUP_APP_DATA_MESSAGE_NEED_USER) {
                        tipView.show();
                        return;
                    }

                    tipView.remove();
                    progressView.updateProgressStatus(CONFIG.enums.BR_TYPE_APP_DATA, BackupRestoreService.CONSTS.BR_PI_STATUS.RUNNING, data.current, data.total);
                }, this);

                tipView.on('__OK', function () {
                    this.stateTitle = i18n.new_backuprestore.BACKUP_APP_DATA_WAITING;
                }.bind(this));

                BackupRestoreService.backupStartAppDataAsync(exportDir, this.sessionId).done(function (resp) {

                    var data = resp.body;
                    var success = data && data.success && data.success.length ? data.success.length : 0;
                    var failed = data && data.failed && data.failed.length ? data.failed.length : 0;

                    this.isProgressing = false;
                    this.offMessageHandler();

                    if (failed > 0) {
                        progressView.updateProgressStatus(CONFIG.enums.BR_TYPE_APP_DATA, BackupRestoreService.CONSTS.BR_PI_STATUS.ERROR, success, data.total);
                        BackupContextModel.set('appDataErrorList', data.failed);
                        this.showErrorListView(CONFIG.enums.BR_TYPE_APP_DATA);
                    } else {
                        progressView.updateProgressStatus(CONFIG.enums.BR_TYPE_APP_DATA, BackupRestoreService.CONSTS.BR_PI_STATUS.FINISHED, success, data.total);
                        this.backupAllFinish();
                    }
                }.bind(this)).fail(function (resp) {

                    if (this.userCancelled) {
                        return;
                    }

                    this.isProgressing = false;
                    this.offMessageHandler();

                    var errorList = [735, 736, 739];
                    var appNum = BackupContextModel.get('dataNumList')[CONFIG.enums.BR_TYPE_APP];
                    if (errorList.indexOf(resp.state_code) >= 0) {
                        var msg = BackupRestoreService.CONSTS.ErrorCodeToMessage[resp.state_code];
                        progressView.updateProgressStatus(CONFIG.enums.BR_TYPE_APP_DATA, BackupRestoreService.CONSTS.BR_PI_STATUS.ERROR, 0, appNum, msg);
                        this.backupAllFinish();
                        return;
                    }

                    var errorMsg = BackupRestoreService.CONSTS.ErrorCodeToMessage[resp.state_code] || '';
                    progressView.updateProgressStatus(CONFIG.enums.BR_TYPE_APP_DATA, BackupRestoreService.CONSTS.BR_PI_STATUS.ERROR, 0, appNum, errorMsg);
                    BackupContextModel.set('appDataErrorMessage', errorMsg);
                    this.showRetryView();

                }.bind(this)).always(function () {
                    tipView.remove();
                    tipView = undefined;
                });
            },
            backupSmsAndContactFinish : function (finishedNum) {

                if (finishedNum < 2) {
                    return;
                }

                if (BackupContextModel.isAppSelected) {
                    this.startBackupApps();
                } else {
                    this.backupAllFinish();
                }
            },
            updateContactAndSms : function (item) {

                item = item[0];
                if (item && item.status !== BackupRestoreService.CONSTS.BR_PI_STATUS.READY) {
                    progressView.showProgress(item.type);
                    progressView.updateProgressStatus(item.type, item.status, item.finished_count, item.all_count);
                }
            },
            backupAllFinish : function () {

                this.stateTitle = i18n.new_backuprestore.BACKUP_COMPRESSING;
                BackupRestoreService.backupFinishAsync(BackupContextModel.fileFullPath).done(function (resp) {

                    this.setDomState(true);
                    this.releaseWindow();
                    BackupRestoreService.logBackupContextModel(BackupContextModel, true);

                    log({
                        event : 'ui.new_backuprestore.backup_time',
                        timeStamp : new Date().getTime() - BackupContextModel.get('startTime'),
                        isLocal : true,
                        backupResult : 'finish'
                    });

                }.bind(this)).fail(function (resp) {

                    if (this.userCancelled) {
                        return;
                    }

                    BackupRestoreService.showAndRecordError('debug.backup.progress.error', resp, 2, this.userCancelled);
                    BackupRestoreService.logBackupContextModel(BackupContextModel, false);

                    log({
                        event : 'ui.new_backuprestore.backup_time',
                        timeStamp : new Date().getTime() - BackupContextModel.get('startTime'),
                        isLocal : true,
                        backupResult : 'finish_fail'
                    });

                    this.isProgressing = false;
                    this.cancel();

                }.bind(this));
            },
            showErrorListView : function (type) {
                if (!errorItemListView) {
                    errorItemListView = ErrorItemListView.getInstance();

                    errorItemListView.on('__RETRY', function () {
                        this.userCancelled = false;

                        if (type === CONFIG.enums.BR_TYPE_APP) {
                            this.startBackupApps();
                        } else if (type === CONFIG.enums.BR_TYPE_APP_DATA) {
                            this.startBackupAppData();
                        }

                    }, this);

                    errorItemListView.on('__IGNORE', function () {
                        this.backupAllFinish();

                        var length = 0;
                        if (type === CONFIG.enums.BR_TYPE_APP_DATA) {
                            length = BackupContextModel.get('appDataErrorList').length;
                        } else {
                            length = BackupContextModel.get('appErrorList').length;
                            progressView.app = BackupContextModel.get('dataNumList')[CONFIG.enums.BR_TYPE_APP] - length;
                        }
                        progressView.updateProgress(CONFIG.enums.BR_TYPE_APP_DATA, 100, 100);
                        progressView.setContentState(CONFIG.enums.BR_TYPE_APP_DATA, true);
                        progressView.updateStatus(CONFIG.enums.BR_TYPE_APP, 100, 100, true);
                        //var error = this.$('.app-error').html(desc);
                    }, this);
                }

                errorItemListView.itemType = type;
                errorItemListView.show();
            },
            showRetryView : function () {

                if (!retryView) {
                    retryView = ErrorRetryView.getBackupInstance();

                    retryView.on('__RETRY', function () {

                        this.userCancelled = false;
                        this.startBackupAppData();

                    }, this);

                    retryView.on('__IGNORE', function () {
                        this.backupAllFinish();
                    }, this);
                }

                retryView.content = BackupContextModel.get('appDataErrorMessage');
                retryView.show();
            },
            releaseWindow : function () {
                WindowController.releaseWindowAsync();
                PIMCollection.getInstance().get(20).set('syncing', false);
            }
        });

        var localBackupView;
        var factory = _.extend({
            getInstance : function () {
                if (!localBackupView) {
                    localBackupView = new LocalBackupView();
                }
                return localBackupView;
            }
        });

        return factory;
    });
}(this));
