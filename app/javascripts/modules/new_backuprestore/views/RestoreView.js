/*global define*/
(function (window) {
    define([
        'jquery',
        'backbone',
        'underscore',
        'doT',
        'Log',
        'Device',
        'ui/TemplateFactory',
        'IO',
        'Internationalization',
        'Configuration',
        'WindowController',
        'main/collections/PIMCollection',
        'utilities/StringUtil',
        'new_backuprestore/views/ConfirmWindowView',
        'new_backuprestore/views/BaseView',
        'new_backuprestore/views/BackupRestoreProgressView',
        'new_backuprestore/views/RestoreFooterView',
        'new_backuprestore/views/LocalFileListView',
        'new_backuprestore/views/RemoteFileListView',
        'new_backuprestore/BackupRestoreService',
        'new_backuprestore/models/RestoreContextModel',
        'new_backuprestore/views/FileItemView',
        'new_backuprestore/views/LocalRestoreAdvanceView',
        'new_backuprestore/views/ErrorItemListView',
        'new_backuprestore/views/RestoreChooseAccountView'
    ], function (
        $,
        Backbone,
        _,
        doT,
        log,
        Device,
        TemplateFactory,
        IO,
        i18n,
        CONFIG,
        WindowController,
        PIMCollection,
        StringUtil,
        ConfirmWindowView,
        BaseView,
        BackupRestoreProgressView,
        RestoreFooterView,
        LocalFileListView,
        RemoteFileListView,
        BackupRestoreService,
        RestoreContextModel,
        FileItemView,
        LocalRestoreAdvanceView,
        ErrorItemListView,
        RestoreChooseAccountView
    ) {

        console.log('RestoreView - File loaded');

        var BR_ERROR_ITEM_FIELD = {
            1 : 'contact',
            3 : 'sms',
            5 : 'call_log'
        };

        var fileListView;
        var errorItemListView;
        var footerView;

        var confirm = ConfirmWindowView.confirm;
        var restoreChooseAccountView = RestoreChooseAccountView.getInstance();

        var downloadView;
        var DownloadView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('new_backuprestore', 'backup-restore-download')),
            className : 'w-backuprestore-download hbox',
            initialize : function () {
                DownloadView.__super__.initialize.apply(this, arguments);

                var $progress;
                Object.defineProperties(this, {
                    $progress : {
                        get : function () {
                            if (!$progress) {
                                $progress = this.$('progress');
                            }
                            return $progress;
                        },
                        set : function (value) {
                            $progress = value;
                        }
                    }
                });
            },
            render : function () {
                this.$el.html(this.template({}));
                return this;
            },
            updateProgress : function (value, max) {
                this.$progress.prop({
                    value : value,
                    max : max
                });
            },
            remove : function () {
                this.$progress = undefined;
                DownloadView.__super__.remove.call(this);
            },
            setProgressState : function (isRunning) {
                this.$progress.toggleClass('running', isRunning);
            }
        });

        var progressView;
        var ProgressView = BackupRestoreProgressView.extend({
            updateItem : function (type, status, currentValue, maxValue) {

                this.updateProgress(type, currentValue, maxValue);
                this.updateStatus(type, currentValue, maxValue);

                //var pattern;
                switch (status) {
                case BackupRestoreService.CONSTS.BR_PI_STATUS.FINISHED:
                    this.setContentState(type, true);
                    this.setProgressState(type, false);
                    this.updateStatus(type, currentValue, maxValue, true);
                    break;
                case BackupRestoreService.CONSTS.BR_PI_STATUS.ERROR:
                    //pattern = i18n.backup_restore.RESTORE_FAILED;

                    //TODO:
                    //var desc = StringUtil.format(pattern, i18n.new_backuprestore.BR_TYPE_WORD_ENUM[type]);
                    //content.find('.error').text(desc);
                    break;
                }
            }
        });

        var RestoreView = BaseView.extend({
            initialize : function () {

                RestoreView.__super__.initialize.apply(this, arguments);

                var isLocal = false;
                var appHandler;
                var downloadHandler;
                var resotreNonAppHandler;
                Object.defineProperties(this, {
                    isLocal : {
                        set : function (value) {
                            isLocal = value;
                        },
                        get : function () {
                            return isLocal;
                        }
                    },
                    appHandler : {
                        set : function (value) {
                            appHandler  = value;
                        },
                        get : function () {
                            return appHandler;
                        }
                    },
                    downloadHandler : {
                        set : function (value) {
                            downloadHandler = value;
                        },
                        get : function () {
                            return downloadHandler;
                        }
                    },
                    resotreNonAppHandler : {
                        set : function (value) {
                            resotreNonAppHandler = value;
                        },
                        get : function () {
                            return resotreNonAppHandler;
                        }
                    }
                });
            },
            render : function () {
                _.extend(this.events, RestoreView.__super__.events);
                this.delegateEvents();
                RestoreView.__super__.render.call(this);

                if (this.isLocal) {
                    fileListView = LocalFileListView.getInstance();
                } else {
                    fileListView = RemoteFileListView.getInstance();
                    downloadView = new DownloadView();
                    this.$el.append(downloadView.render().$el.hide());
                }
                this.$el.append(fileListView.render().$el);

                progressView = new ProgressView();
                progressView.isBackup = false;
                this.$el.append(progressView.render().$el.hide());

                footerView = new RestoreFooterView();
                footerView.isLocal = this.isLocal;
                this.$el.append(footerView.render().$el);

                return this;
            },
            initState : function () {
                this.bindEvent();
                this.initAttrsState();

                this.bigTitle = StringUtil.format(i18n.new_backuprestore.RESTORE_DEVICE_TITLE, Device.get('deviceName'));
                this.stateTitle = i18n.new_backuprestore.RESTORE_CHOOSE_DESC;

                fileListView.buildList();

                footerView.setButtonState('selectFile');

                this.listenTo(fileListView, 'selected', function (isSelected) {
                    footerView.enableConfirmButton = isSelected;
                });

                this.listenTo(RestoreContextModel, 'change:dataIDList', function (resp) {

                    BackupRestoreService.getSupportAppDataAsync().done(function (resp) {
                        if (resp.body.value) {
                            progressView.selectAppData = RestoreContextModel.isAppDataSelected;
                        }
                    });
                });
            },
            offMessageHandler : function () {
                if (this.appHandler) {
                    window.clearInterval(this.appHandler);
                    this.appHandler = undefined;
                }

                if (this.downloadHandler) {
                    window.clearTimeout(this.downloadHandler);
                    this.downloadHandler = undefined;
                }

                if (this.resotreSmsAndContact) {
                    IO.Backend.Device.offmessage(this.resotreSmsAndContact);
                    this.resotreSmsAndContact = undefined;
                }

                if (this.progressHanlder) {
                    IO.Backend.Device.offmessage(this.progressHanlder);
                    this.progressHanlder = undefined;
                }
            },
            cancel : function () {
                this.userCancelled = true;
                if (this.isProgressing) {

                    confirm(i18n.new_backuprestore.CANCEL_RESTORE, function () {

                        BackupRestoreService.restoreCancelAsync(this.sessionId).done(function () {

                            log({
                                event : 'ui.new_backuprestore.restore_time',
                                timeStamp : new Date().getTime() - RestoreContextModel.get('startTime'),
                                isLocal : this.isLocal,
                                restoreResult : 'cancel'
                            });

                            this.isProgressing = false;
                            this.offMessageHandler();
                            this.releaseWindow();
                            this.trigger('__CANCEL');

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
            bindEvent : function () {
                this.listenTo(footerView, '__CANCEL', this.cancel);

                this.listenTo(footerView, '__START_RESTORE', function () {

                    var battery = RestoreContextModel.get('battery');
                    if (battery > 0 && battery < 20) {
                        confirm(i18n.new_backuprestore.RESTORE_BATTERY_TIP, this.tryToStartRestore, this);
                    } else {
                        this.tryToStartRestore();
                    }

                    RestoreContextModel.set('startTime', new Date().getTime());
                });

                this.listenTo(restoreChooseAccountView, '__START_RESTORE', this.startRestore);

                this.listenTo(footerView, '__SHOW_FILE', function () {

                    BackupRestoreService.selectRestoreFileAsync().done(function (resp) {

                        if (resp.state_code === 402) {
                            return;
                        }

                        var name = resp.body.value;
                        BackupRestoreService.readRestoreFileAsync(name).done(function (resp) {

                            fileListView.setRestoreData({
                                info : resp.body.item,
                                path : name
                            });
                            this.showRestoreView();

                        }.bind(this)).fail(function (resp) {
                            var message;
                            if (this.isCsvFile(name)) {
                                message = i18n.backup_restore.RESTORE_INVLID_CONTACTS_FILE;
                            } else {
                                message = BackupRestoreService.getErrorMessage(resp.state_code);
                            }
                            alert(message);

                            BackupRestoreService.recordError('debug.restore.progress.error', resp, 5);
                            BackupRestoreService.logRestoreContextModel(RestoreContextModel, false);
                        }.bind(this));

                    }.bind(this)).fail(function () {
                        alert(i18n.new_backuprestore.SET_RESTORE_FILE_FAILED);
                    });
                });

                this.listenTo(footerView, '__CONFIRM', function () {
                    this.showRestoreView();
                });

                this.listenTo(footerView, '__DONE', function () {
                    this.trigger('__DONE');
                });

                this.listenTo(footerView, '__TASK_MANAGER', function () {
                    this.trigger('__TASK_MANAGER');
                });

                this.listenTo(fileListView, '__CANCEL', function () {
                    this.trigger('__CANCEL');
                });

                this.listenTo(footerView, '__SHOW_MORE', function () {
                    fileListView.update();
                });
                this.listenTo(fileListView, '__HIDE_SHOW_MORE', function () {
                    footerView.hideShowMoreBtn();
                });
                this.listenTo(fileListView, '__DISPLAY_SHOW_MORE', function () {
                    footerView.displayShowMoreBtn();
                });
            },
            startRestore : function () {

                if (this.isLocal) {
                    footerView.setButtonState('progressing');
                    if (RestoreContextModel.isNoneAppSelected) {
                        this.startRestoreSmsAndContact();
                    } else if (RestoreContextModel.isAppSelected || RestoreContextModel.isAppDataSelected) {
                        this.startRestoreApps();
                    }
                } else {
                    footerView.setButtonState('downloading');
                    this.showDownloadView();
                    this.download();
                }
                $('.w-menu-pim .w-ui-syncing').data('title', i18n.new_backuprestore.NAV_RESTORING);
                PIMCollection.getInstance().get(20).set('syncing', true);

            },
            tryToStartRestore : function () {

                if (RestoreContextModel.isContactSelected && !RestoreContextModel.get('isAccountReady')) {
                    restoreChooseAccountView.show();
                } else {
                    this.startRestore();
                }

            },
            isCsvFile : function (fileName) {
                if (!fileName) {
                    return false;
                }

                var csvExt = ".csv";
                var index = fileName.lastIndexOf(".csv");
                return (index > 0) && (index + csvExt.length === fileName.length);
            },
            startRestoreSmsAndContact : function () {

                WindowController.blockWindowAsync();
                this.sessionId = _.uniqueId('restore.nonapps_');
                this.isProgressing = true;
                footerView.setButtonState('progressing');
                this.stateTitle = this.isLocal ? i18n.new_backuprestore.RESTORING_FROM_LOCAL : i18n.new_backuprestore.RESTORING_FROM_REMOTE;

                var filePath = RestoreContextModel.get('fileName');
                var accountType = RestoreContextModel.get('accountType');
                var accountName = RestoreContextModel.get('accountName');
                var brSpec = RestoreContextModel.brSpec;

                this.initProgressItems(RestoreContextModel.allBrSpec);

                BackupRestoreService.restoreStartNonAppsAsync(filePath, this.sessionId, accountType, accountName, brSpec).done(function (resp) {
                    RestoreContextModel.set('appPath', resp.body.value);
                }.bind(this)).fail(function (resp) {

                    BackupRestoreService.showAndRecordError('debug.restore.progress.error', resp, 1);
                    BackupRestoreService.logRestoreContextModel(RestoreContextModel, false, fileListView.getAll().length);
                    BackupRestoreService.restoreCancelAsync(this.sessionId);

                    if (this.userCancelled) {
                        return;
                    }

                    this.isProgressing = false;
                    this.cancel();

                }.bind(this));

                var smsHandler = IO.Backend.Device.onmessage({
                    'data.channel' : this.sessionId + 'sms'
                }, function (data) {
                    var smsDupCount = parseInt(data, 10);
                    RestoreContextModel.set('smsDupCount', smsDupCount);
                    progressView.updateProgress(CONFIG.enums.CONTACT, smsDupCount, RestoreContextModel.get('restoreData')[CONFIG.enums.CONTACT]);
                    IO.Backend.Device.offmessage(smsHandler);
                }, this);

                var contactHandler = IO.Backend.Device.onmessage({
                    'data.channel' : this.sessionId + 'contacts'
                }, function (data) {
                    var contactsDupCount = parseInt(data, 10);
                    RestoreContextModel.set('contactsDupCount', contactsDupCount);
                    progressView.updateProgress(CONFIG.enums.SMS, contactsDupCount, RestoreContextModel.get('restoreData')[CONFIG.enums.SMS]);
                    IO.Backend.Device.offmessage(contactHandler);
                }, this);

                this.resotreSmsAndContact = IO.Backend.Device.onmessage({
                    'data.channel' : this.sessionId
                }, function (data) {
                    this.handleProgress(data);
                }, this);
            },
            initProgressItems : function (brSpec) {

                _.each(brSpec.item, function (item) {
                    progressView.showProgress(item.type);
                }, this);
            },
            handleProgress : function (progress) {
                switch (progress.status) {
                case BackupRestoreService.CONSTS.BR_STATUS.RUNNING:
                case BackupRestoreService.CONSTS.BR_STATUS.PAUSED:
                    this.updateNonAppItems(progress.item);
                    break;
                case BackupRestoreService.CONSTS.BR_STATUS.FINISHED:
                    this.updateNonAppItems(progress.item);

                    this.isProgressing = false;
                    this.offMessageHandler();

                    if (RestoreContextModel.isAppSelected || RestoreContextModel.isAppDataSelected) {
                        this.startRestoreApps();
                    } else {
                        this.restoreAllFinish();
                    }

                    break;
                case BackupRestoreService.CONSTS.BR_STATUS.ERROR:
                    this.updateNonAppItems(progress.item);

                    this.isProgressing = false;
                    this.showErrorItem(progress);
                    break;
                case BackupRestoreService.CONSTS.BR_STATUS.READY:
                case BackupRestoreService.CONSTS.BR_STATUS.STOPPED:
                    break;
                case BackupRestoreService.CONSTS.BR_STATUS.ABORT:

                    BackupRestoreService.logRestoreContextModel(RestoreContextModel, false, fileListView.getAll().length);
                    this.isProgressing = false;
                    alert(i18n.new_backuprestore.RESTORE_ABORT_TIP, this.cancel, this);

                    break;
                default:

                    BackupRestoreService.logRestoreContextModel(RestoreContextModel, false, fileListView.getAll().length);
                    this.isProgressing = false;
                    alert(i18n.new_backuprestore.RESTORE_FAILED_TIP + progress.status, this.cancel, this);

                    break;
                }
            },
            startRestoreApps : function () {

                if (this.userCancelled) {
                    return;
                }

                WindowController.blockWindowAsync();

                this.stateTitle = this.isLocal ? i18n.new_backuprestore.RESTORING_FROM_LOCAL : i18n.new_backuprestore.RESTORING_FROM_REMOTE;
                this.isProgressing = true;
                progressView.showProgress(CONFIG.enums.BR_TYPE_APP);

                var update = function () {
                    var value = 0;

                    this.appHandler = setInterval(function () {
                        progressView.updateProgress(CONFIG.enums.BR_TYPE_APP, value, 100);

                        if (value === 100) {
                            window.clearInterval(this.appHandler);

                            var filePath = RestoreContextModel.get('fileName');
                            BackupRestoreService.restoreStartAppsAsync(filePath, RestoreContextModel.isAppDataSelected).done(function () {
                                this.restoreAllFinish();
                                progressView.setContentState(CONFIG.enums.BR_TYPE_APP, true);
                                progressView.setProgressState(CONFIG.enums.BR_TYPE_APP, false);
                                progressView.updateStatus(CONFIG.enums.BR_TYPE_APP, 100, 100, true);
                            }.bind(this)).fail(function (resp) {
                                BackupRestoreService.showAndRecordError('debug.restore.progress.error', resp, 7, this.userCancelled);
                                BackupRestoreService.logRestoreContextModel(RestoreContextModel, false, fileListView.getAll().length);

                                this.isProgressing = false;
                                this.cancel();
                            });
                        }
                        value++;

                    }.bind(this), 20);

                }.bind(this);
                update();
            },
            showErrorItem : function (progress) {

                if (!progress.error_item || progress.error_item.length === 0) {

                    BackupRestoreService.logRestoreContextModel(RestoreContextModel, false, fileListView.getAll().length);
                    alert(i18n.new_backuprestore.RESTORE_FAILED_TIP + progress.status, this.cancel, this);
                    return;
                }

                var errorItem = progress.error_item[0];
                var list = errorItem[BR_ERROR_ITEM_FIELD[errorItem.type]];
                RestoreContextModel.set('errorItemList', list);

                switch (errorItem.type) {
                case CONFIG.enums.BR_TYPE_CONTACT:
                case CONFIG.enums.BR_TYPE_SMS:
                    this.showErrorList(errorItem.type);
                    break;
                default:

                    BackupRestoreService.logRestoreContextModel(RestoreContextModel, false, fileListView.getAll().length);
                    alert(i18n.new_backuprestore.RESTORE_FAILED_TIP + progress.status, this.cancel, this);

                    break;
                }
            },
            showErrorList : function (type) {

                if (!errorItemListView) {
                    errorItemListView = ErrorItemListView.getInstance();

                    this.listenTo(errorItemListView, '__RETRY', function () {
                        this.userCancelled = false;
                        this.retryRestore();
                    });

                    this.listenTo(errorItemListView, '__IGNORE', function () {
                        this.userCancelled = false;
                        this.resumeRestore();
                    });
                }

                errorItemListView.itemType = type;
                errorItemListView.show();
            },
            retryRestore : function () {

                this.isProgressing = true;
                BackupRestoreService.restoreRetryAsync(this.sessionId).done(function (resp) {
                    var progress = resp.body;

                    if (progress.status === BackupRestoreService.CONSTS.BR_STATUS.PAUSED) {
                        this.resumeRestore();
                    } else {
                        this.handleProgress(progress);
                    }
                }.bind(this)).fail(function (resp) {

                    BackupRestoreService.showAndRecordError('debug.restore.progress.error', resp, 3);
                    BackupRestoreService.logRestoreContextModel(RestoreContextModel, false, fileListView.getAll().length);

                    this.isProgressing  = false;
                    this.cancel();

                }.bind(this));
            },
            resumeRestore : function () {
                BackupRestoreService.restoreResumeAsync(this.sessionId,
                                                        RestoreContextModel.get('smsDupCount'),
                                                        RestoreContextModel.get('contactsDupCount')).fail(function (resp) {

                    BackupRestoreService.showAndRecordError('debug.restore.progress.error', resp, 4);
                    BackupRestoreService.logRestoreContextModel(RestoreContextModel, false, fileListView.getAll().length);

                    this.isProgressing  = false;
                    this.cancel();

                }.bind(this));
            },

            restoreAllFinish : function () {

                BackupRestoreService.restoreFinishAsync(RestoreContextModel.get('fileName')).done(function (resp) {

                    this.BigTitle = i18n.new_backuprestore.RESTORE_FINISH_LABEL;
                    if (RestoreContextModel.isSmsSelected && RestoreContextModel.isContactSelected) {
                        this.stateTitle = i18n.new_backuprestore.RESTORE_NONAPP_COMPLATE;
                    } else if (RestoreContextModel.isContactSelected) {
                        this.stateTitle = i18n.new_backuprestore.RESTORE_CONTACT_COMPLATE;

                    } else if (RestoreContextModel.isSmsSelected) {
                        this.stateTitle = i18n.new_backuprestore.RESTORE_SMS_COMPLATE;
                    }

                    if (RestoreContextModel.isAppSelected) {
                        this.stateTitle.append(i18n.new_backuprestore.RESTORE_APP_COMPLATE);
                    }
                    footerView.setButtonState('done');

                    BackupRestoreService.logRestoreContextModel(RestoreContextModel, true, fileListView.getAll().length);


                    log({
                        event : 'ui.new_backuprestore.restore_time',
                        timeStamp : new Date().getTime() - RestoreContextModel.get('startTime'),
                        isLocal : this.isLocal,
                        restoreResult : 'finish'
                    });

                }.bind(this)).fail(function (resp) {

                    BackupRestoreService.showAndRecordError('debug.restore.progress.error', resp, 2, this.userCancelled);
                    BackupRestoreService.logRestoreContextModel(RestoreContextModel, false, fileListView.getAll().length);

                    log({
                        event : 'ui.new_backuprestore.restore_time',
                        timeStamp : new Date().getTime() - RestoreContextModel.get('startTime'),
                        isLocal : this.isLocal,
                        restoreResult : 'finish_fail'
                    });

                }.bind(this));

                this.isProgressing = false;
                this.releaseWindow();
            },

            updateNonAppItems : function (items) {
                _.each(items, function (item) {
                    if (item.status !== BackupRestoreService.CONSTS.BR_PI_STATUS.READY) {
                        progressView.updateItem(item.type, item.status, item.finished_count, item.all_count);
                    }
                }, this);
            },
            showRestoreView : function () {
                this.stateTitle = i18n.new_backuprestore.RESTORE_DEVICE_LOCAL_DESC;

                fileListView.$el.hide();
                if (downloadView) {
                    downloadView.$el.hide();
                }

                var data = RestoreContextModel.get('restoreData');
                progressView.contact = data[CONFIG.enums.BR_TYPE_CONTACT];
                progressView.sms = data[CONFIG.enums.BR_TYPE_SMS];
                progressView.app = data[CONFIG.enums.BR_TYPE_APP];
                progressView.$el.show();

                progressView.selectAppData = RestoreContextModel.isAppDataSelected;

                footerView.setButtonState('ready');
            },
            showDownloadView : function () {
                this.stateTitle = i18n.new_backuprestore.RESTORE_DOWNLOAD_PROGRESSING;
                progressView.$el.hide();
                downloadView.$el.show();
                footerView.setButtonState('downloading');
            },
            download : function () {

                if (this.userCancelled) {
                    return;
                }

                this.isProgressing = true;
                this.sessionId = _.uniqueId('restore.download_file_');

                var version = RestoreContextModel.get('remoteVersion');
                var udid = RestoreContextModel.get('udid');
                var types = RestoreContextModel.serverTypes;

                log({ 'event' : 'debug.restore.remote.download.start' });

                var timeBegin = new Date();
                BackupRestoreService.remoteSnapshotFileAsync(version, udid, types, this.sessionId).done(function (resp) {

                    var path = resp.body.value;
                    var sessionId = resp.body.key;

                    if (this.sessionId !== sessionId || this.userCancelled) {
                        return;
                    }

                    RestoreContextModel.set('fileName', path);

                    var now = new Date();
                    var time = now - timeBegin;
                    var handler = function () {
                        this.isProgressing = false;
                        this.offMessageHandler();
                        downloadView.setProgressState(false);

                        this.showRestoreView();
                        footerView.setButtonState('progressing');

                        if (RestoreContextModel.isNoneAppSelected) {
                            this.startRestoreSmsAndContact();
                        } else {
                            this.startRestoreApps();
                        }
                    }.bind(this);

                    if (time  < 5000) {
                        this.downloadHandler = setTimeout(handler, 5000 - time);
                        downloadView.setProgressState(true);
                    } else {
                        handler();
                    }

                    log({ 'event' : 'debug.restore.remote.download.success' });
                    BackupRestoreService.logRestoreContextModel(RestoreContextModel, true);

                }.bind(this)).fail(function (resp) {

                    log({ 'event' : 'debug.restore.remote.download.failed' });

                    BackupRestoreService.showAndRecordError('debug.restore.progress.error', resp, 0, this.userCancelled);
                    BackupRestoreService.logRestoreContextModel(RestoreContextModel, false);

                    this.isProgressing = false;
                    this.cancel();

                }.bind(this));

                this.progressHanlder = IO.Backend.Device.onmessage({
                    'data.channel' : this.sessionId
                }, function (data) {

                    if (this.userCancelled) {
                        return;
                    }
                    downloadView.updateProgress(data, 100);

                }.bind(this));
            },
            remove : function () {

                footerView.remove();
                footerView = undefined;

                restoreChooseAccountView.remove();

                if (progressView) {
                    progressView.remove();
                    progressView = undefined;
                }

                if (downloadView) {
                    downloadView.remove();
                    downloadView = undefined;
                }

                if (fileListView) {
                    fileListView.remove();
                    fileListView = undefined;
                }

                RestoreView.__super__.remove.apply(this, arguments);

            },
            releaseWindow : function () {
                WindowController.releaseWindowAsync();
                PIMCollection.getInstance().get(20).set('syncing', false);
            }

        });

        var restoreView;
        var factory = _.extend({
            getInstance : function () {
                if (!restoreView) {
                    restoreView = new RestoreView();
                }

                return restoreView;
            }
        });

        return factory;
    });
}(this));
