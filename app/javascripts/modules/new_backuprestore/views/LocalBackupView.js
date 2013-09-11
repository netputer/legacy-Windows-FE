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
                switch (type) {
                case 'progressing':
                    this.$('.startbackup').hide();
                    this.$('.advanced').hide();
                    break;
                case 'done':
                    this.$('.done').show();
                    this.$('.cancel').hide();
                    this.$('.showfile').show();
                    break;
                }
            }
        });

        var progressView;
        var ProgressView = BackupRestoreProgressView.extend({
            updateProgressStatus : function (type, status, current_count, all_count, errorMsg) {

                switch (type) {
                case CONFIG.enums.BR_TYPE_APP:
                    if (BackupContextModel.IsAppDataSelected) {
                        current_count = current_count / all_count * 100 / 2;
                        all_count = 100;
                    }
                    break;
                case CONFIG.enums.BR_TYPE_APP_DATA:
                    current_count = current_count / all_count * 100 / 2 + 50;
                    all_count = 100;
                    break;
                }

                if (type === CONFIG.enums.BR_TYPE_APP || type === CONFIG.enums.BR_TYPE_APP_DATA) {
                    if (current_count >= 0 && all_count >= 0) {
                        this.updateProgress(type, current_count, all_count);
                    }
                }

                //var pattern;
                switch (status) {
                case BackupRestoreService.CONSTS.BR_PI_STATUS.FINISHED:

                    if (type !== CONFIG.enums.BR_TYPE_APP) {

                        var temp = function (type) {
                            var max = 100;
                            var value = 1;
                            var handle = setInterval(function () {
                                this.updateProgress(type, value += 2, max);
                            }.bind(this), 20);

                            setTimeout(function () {
                                this.setContentState(type, true);
                                window.clearInterval(handle);
                            }.bind(this), 2000);
                        }.bind(this);
                        temp(type);

                    } else if ((type === CONFIG.enums.BR_TYPE_APP && !BackupContextModel.IsAppDataSelected) || type === CONFIG.enums.BR_TYPE_APP_DATA) {
                        this.setContentState(type, true);
                        this.setProgressState(type, false);
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
            render : function () {

                _.extend(this.events, LocalBackupView.__super__.events);
                this.delegateEvents();
                LocalBackupView.__super__.render.call(this);

                progressView = new ProgressView();
                this.$el.append(progressView.render().$el);

                footerView = new FooterView();
                this.$el.append(footerView.render().$el);

                return this;
            },
            bindEvent : function () {
                this.listenTo(footerView, '__DONE', function () {
                    this.trigger('__DONE');
                });

                this.listenTo(footerView, '__CANCEL', function () {

                    this.userCancelled = true;
                    if (this.isProgressing) {

                        confirm(i18n.new_backuprestore.CANCEL_BACKUP, function () {
                            this.isProgressing = false;
                            this.offMessageHandler();

                            BackupRestoreService.backupCancelAsync(this.sessionId).done(function () {
                                this.trigger('__CANCEL');
                            }.bind(this));
                        }, this);
                    } else {
                        this.trigger('__CANCEL');
                    }
                });

                this.listenTo(footerView, '__START_BACKUP', function () {
                    this.setDomState(false);
                    this.startBackup();
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

                    alert(i18n.new_backuprestore.PERMISSION_TIP);
                    log({
                        'event' : 'debug.backup.progress.error',
                        'type' : 4
                    });
                    this.trigger('__TIME_OUT');

                }.bind(this)));

                initDone.push(BackupRestoreService.getSettingPathAsync().done(function (resp) {

                    var path = resp.body.value;
                    BackupContextModel.set('filePath', path);

                }.bind(this)).fail(function () {

                    BackupRestoreService.showAndRecordError(i18n.new_backuprestore.GET_FILE_PATH_FAILED, 0);
                    this.trigger('__TIME_OUT');

                }.bind(this)));

                $.when.apply(this, initDone).done(function () {
                    footerView.enableBackupButton = true;
                });


                if (deviceName !== undefined && deviceName.length > 0) {
                    deviceName = deviceName.replace(/ /g, '_').replace(new RegExp(this.invalidPattern, "g"), '_');
                }
                var curDate = StringUtil.formatDate('yyyy-MM-dd-HH-mm-ss', new Date().valueOf());
                var fileName = curDate + deviceName;
                BackupContextModel.set('fileName', fileName);

                this.listenTo(BackupContextModel, 'change:dataIDList', function (value) {
                    progressView.selectAppData = BackupContextModel.IsAppDataSelected;
                });
            },
            remove: function () {
                LocalBackupView.__super__.remove.apply(this, arguments);

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
                var brSpec = BackupContextModel.GetBRSpec;
                var finishedNum = 0;

                this.isProgressing = true;
                this.sessionId = _.uniqueId('backup.session_id_');
                this.setDomState(false);

                this.progressHandler = IO.Backend.Device.onmessage({
                    'data.channel' : this.sessionId
                }, function (data) {

                    //do nothing when
                    //BackupRestoreService.CONSTS.BR_STATUS.READY
                    //BackupRestoreService.CONSTS.BR_STATUS.PAUSED
                    //BackupRestoreService.CONSTS.BR_STATUS.STOPPED:
                    switch (data.status) {
                    case BackupRestoreService.CONSTS.BR_STATUS.RUNNING:
                        this.updateContactAndSms(data.item);
                        break;
                    case BackupRestoreService.CONSTS.BR_STATUS.FINISHED:
                        finishedNum++;
                        this.backupSmsAndContactFinish(finishedNum);
                        break;
                    case BackupRestoreService.CONSTS.BR_STATUS.ABORT:
                        this.offMessageHandler();
                        BackupRestoreService.logBackupContextModel(BackupContextModel, false);
                        alert(i18n.new_backuprestore.BACKUP_ABORT_TIP);
                        WindowController.releaseWindowAsync();
                        break;
                    default:
                        this.offMessageHandler();
                        BackupRestoreService.logBackupContextModel(BackupContextModel, false);
                        alert(i18n.new_backuprestore.BACKUP_FAILED_TIP + data.status);
                        WindowController.releaseWindowAsync();
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

                    BackupRestoreService.showAndRecordError('debug.backup.progress.error', resp, 0, this.userCancelled);
                    BackupRestoreService.logBackupContextModel(BackupContextModel, false);
                    WindowController.releaseWindowAsync();

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

                this.progressHandler = IO.Backend.Device.onmessage({
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
                        if (BackupContextModel.IsAppDataSelected) {
                            this.startBackupAppData();
                        } else {
                            this.backupAllFinish();
                        }
                    }
                }.bind(this)).fail(function (resp) {

                    this.isProgressing = false;
                    this.offMessageHandler();
                    //this.setDomState(true);

                    BackupRestoreService.showAndRecordError('debug.backup.progress.error', resp, 1, this.userCancelled);
                    BackupRestoreService.logBackupContextModel(BackupContextModel, false);
                    WindowController.releaseWindowAsync();

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

                this.progressHandler = IO.Backend.Device.onmessage({
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

                this.offMessageHandler();
                this.isProgressing = false;

                if (BackupContextModel.IsAppSelected) {
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
                    BackupRestoreService.logBackupContextModel(BackupContextModel, true);

                    this.trigger('__SHOW_NOTIFIER', 'LOCAL_BACKUP_COMPLETE');

                }.bind(this)).fail(function (resp) {
                    BackupRestoreService.showAndRecordError('debug.backup.progress.error', resp, 2, this.userCancelled);
                    BackupRestoreService.logBackupContextModel(BackupContextModel, false);
                }.bind(this));

                WindowController.releaseWindowAsync();
            },
            showErrorListView : function (type) {
                if (!errorItemListView) {
                    errorItemListView = ErrorItemListView.getInstance();

                    errorItemListView.on('__RETYR', function () {
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
                        //var desc = '';
                        if (type === CONFIG.enums.BR_TYPE_APP_DATA) {
                            length = BackupContextModel.get('appDataErrorList').length;
                        //    desc = length + '个应用程序数据备份失败';
                        } else {
                            length = BackupContextModel.get('appErrorList').length;
                            progressView.app = BackupContextModel.get('dataNumList')[CONFIG.enums.BR_TYPE_APP] - length;
                         //   desc = length + '个应用程序备份失败';
                        }
                        progressView.updateProgress(CONFIG.enums.BR_TYPE_APP_DATA, 100, 100);
                        progressView.setContentState(CONFIG.enums.BR_TYPE_APP_DATA, true);
                        //var error = this.$('.app-error').html(desc);
                    }, this);
                }

                errorItemListView.itemType = type;
                errorItemListView.show();
            },
            showRetryView : function () {

                if (!retryView) {
                    retryView = ErrorRetryView.getBackupInstance();

                    retryView.on('__RETYR', function () {

                        this.userCancelled = false;
                        this.startBackupAppData();

                    }, this);

                    retryView.on('__IGNORE', function () {
                        this.backupAllFinish();
                    }, this);
                }

                retryView.content = BackupContextModel.get('appDataErrorMessage');
                retryView.show();
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