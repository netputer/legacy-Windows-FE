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
        'new_backuprestore/views/ErrorItemListView'
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
        ErrorItemListView
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

                //var pattern;
                switch (status) {
                case BackupRestoreService.CONSTS.BR_PI_STATUS.FINISHED:
                    this.setContentState(type, true);
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
                            progressView.selectAppData = RestoreContextModel.IsAppDataSelected;
                        }
                    });
                });
            },
            bindEvent : function () {
                this.listenTo(footerView, '__CANCEL', function () {
                    this.userCancelled = true;
                    if (this.isProgressing) {

                        confirm(i18n.new_backuprestore.CANCEL_RESTORE, function () {

                            BackupRestoreService.restoreCancelAsync(this.sessionId).done(function () {

                                this.isProgressing = false;
                                this.offMessageHandler();

                                if (this.appHandler) {
                                    window.clearInterval(this.appHandler);
                                    this.appHandler = undefined;
                                }

                                if (this.downloadHandler) {
                                    window.clearTimeout(this.downloadHandler);
                                    this.downloadHandler = undefined;
                                }

                                this.releaseWindow();
                                this.trigger('__CANCEL');
                            }.bind(this));

                        }, this);
                    } else {
                        this.releaseWindow();
                        this.trigger('__CANCEL');
                    }
                });

                this.listenTo(footerView, '__START_RESTORE', function () {

                    if (this.isLocal) {
                        footerView.setButtonState('progressing');
                        if (RestoreContextModel.IsNoneAppSelected) {
                            this.startRestoreSmsAndContact();
                        } else if (RestoreContextModel.IsAppSelected || RestoreContextModel.IsAppDataSelected) {
                            this.startRestoreApps();
                        }
                    } else {
                        footerView.setButtonState('downloading');
                        this.showDownloadView();
                        this.download();
                    }
                    PIMCollection.getInstance().get(20).set('loading', true);
                });

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

                this.listenTo(footerView, '__SHOW_MORE', function () {
                    fileListView.update();
                });

                this.listenTo(fileListView, '__CANCEL', function () {
                    this.trigger('__CANCEL');
                });

                this.listenTo(fileListView, '__HIDE_SHOW_MORE', function () {
                    footerView.hideShowMoreBtn();
                });

                this.listenTo(fileListView, '__DISPLAY_SHOW_MORE', function () {
                    footerView.displayShowMoreBtn();
                });
            },
            startRestoreSmsAndContact : function () {

                WindowController.blockWindowAsync();
                this.sessionId = _.uniqueId('restore.nonapps_');
                this.isProgressing = true;
                footerView.setButtonState('progressing');
                this.stateTitle = i18n.new_backuprestore.RESTORING;

                var filePath = RestoreContextModel.get('fileName');
                var accountType = RestoreContextModel.get('accountType');
                var accountName = RestoreContextModel.get('accountName');
                var brSpec = RestoreContextModel.BrSpec;

                this.initProgressItems(brSpec);

                BackupRestoreService.restoreStartNonAppsAsync(filePath, this.sessionId, accountType, accountName, brSpec).done(function (resp) {
                    RestoreContextModel.set('appPath', resp.body.value);
                }.bind(this)).fail(function (resp) {
                    BackupRestoreService.showAndRecordError('debug.restore.progress.error', resp, 1, !this.IsAppDataSelected);
                    BackupRestoreService.logRestoreContextModel(RestoreContextModel, false, fileListView.getAll().length);
                    BackupRestoreService.restoreCancelAsync(this.sessionId);
                    this.releaseWindow();
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

                this.progressHandler = IO.Backend.Device.onmessage({
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

                    if (RestoreContextModel.IsAppSelected || RestoreContextModel.IsAppDataSelected) {
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
                //case BackupRestoreService.CONSTS.BR_STATUS.READY:
                //case BackupRestoreService.CONSTS.BR_STATUS.STOPPED:
                //    break;
                case BackupRestoreService.CONSTS.BR_STATUS.ABORT:

                    BackupRestoreService.logRestoreContextModel(RestoreContextModel, false, fileListView.getAll().length);
                    alert(i18n.new_backuprestore.RESTORE_ABORT_TIP);
                    this.releaseWindow();
                    break;
                default:
                    BackupRestoreService.logRestoreContextModel(RestoreContextModel, false, fileListView.getAll().length);
                    alert(i18n.new_backuprestore.RESTORE_FAILED_TIP + progress.status);
                    this.releaseWindow();
                    break;
                }
            },
            startRestoreApps : function () {

                if (this.userCancelled) {
                    return;
                }

                WindowController.blockWindowAsync();

                this.stateTitle = i18n.new_backuprestore.RESTORING;
                this.isProgressing = true;
                progressView.showProgress(CONFIG.enums.BR_TYPE_APP);

                var update = function () {
                    var value = 0;

                    this.appHandler = setInterval(function () {
                        progressView.updateProgress(CONFIG.enums.BR_TYPE_APP, value, 100);

                        if (value === 100) {
                            window.clearInterval(this.appHandler);

                            var filePath = RestoreContextModel.get('fileName');
                            BackupRestoreService.restoreStartAppsAsync(filePath, RestoreContextModel.IsAppDataSelected).done(function () {
                                this.restoreAllFinish();
                                progressView.setContentState(CONFIG.enums.BR_TYPE_APP, true);
                            }.bind(this)).fail(function (resp) {
                                BackupRestoreService.showAndRecordError('debug.restore.progress.error', resp, 7, this.userCancelled);
                                BackupRestoreService.logRestoreContextModel(RestoreContextModel, false, fileListView.getAll().length);
                                this.releaseWindow();
                            });
                        }
                        value++;

                    }.bind(this), 20);

                }.bind(this);
                update();
            },
            showErrorItem : function (progress) {

                if (!progress.error_item || progress.error_item.length === 0) {

                    alert(i18n.new_backuprestore.RESTORE_FAILED_TIP + progress.status);
                    BackupRestoreService.logRestoreContextModel(RestoreContextModel, false, fileListView.getAll().length);
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

                    alert(i18n.new_backuprestore.RESTORE_FAILED_TIP + progress.status);
                    BackupRestoreService.logRestoreContextModel(RestoreContextModel, false, fileListView.getAll().length);
                    this.releaseWindow();
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

                    this.isProgressing  = false;
                    this.offMessageHandler();

                    BackupRestoreService.showAndRecordError('debug.restore.progress.error', resp, 3);
                    BackupRestoreService.logRestoreContextModel(RestoreContextModel, false, fileListView.getAll().length);
                    this.releaseWindow();
                }.bind(this));
            },
            resumeRestore : function () {
                BackupRestoreService.restoreResumeAsync(this.sessionId,
                                                        RestoreContextModel.get('smsDupCount'),
                                                        RestoreContextModel.get('contactsDupCount')).fail(function (resp) {

                    this.isProgressing  = false;
                    this.offMessageHandler();

                    BackupRestoreService.showAndRecordError('debug.restore.progress.error', resp, 4);
                    BackupRestoreService.logRestoreContextModel(RestoreContextModel, false, fileListView.getAll().length);
                    this.releaseWindow();
                }.bind(this));
            },

            restoreAllFinish : function () {

                BackupRestoreService.restoreFinishAsync(RestoreContextModel.get('fileName')).done(function (resp) {

                    this.BigTitle = i18n.new_backuprestore.RESTORE_FINISH_LABEL;
                    if (RestoreContextModel.IsSmsSelected && RestoreContextModel.IsContactSelected) {
                        this.stateTitle = i18n.new_backuprestore.RESTORE_NONAPP_COMPLATE;
                    } else if (RestoreContextModel.IsContactSelected) {
                        this.stateTitle = i18n.new_backuprestore.RESTORE_CONTACT_COMPLATE;

                    } else if (RestoreContextModel.IsSmsSelected) {
                        this.stateTitle = i18n.new_backuprestore.RESTORE_SMS_COMPLATE;
                    }

                    if (RestoreContextModel.IsAppSelected) {
                        this.stateTitle.append(i18n.new_backuprestore.RESTORE_APP_COMPLATE);
                    }
                    footerView.setButtonState('done');

                    BackupRestoreService.logRestoreContextModel(RestoreContextModel, true, fileListView.getAll().length);
                }.bind(this)).fail(function (resp) {

                    BackupRestoreService.showAndRecordError('debug.restore.progress.error', resp, 2, this.userCancelled);
                    BackupRestoreService.logRestoreContextModel(RestoreContextModel, false, fileListView.getAll().length);
                }.bind(this));

                this.isProgressing = false;
                this.releaseWindow();
            },

            updateNonAppItems : function (items) {
                _.map(items, function (item) {
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

                progressView.selectAppData = RestoreContextModel.IsAppDataSelected;

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
                var types = RestoreContextModel.GetServerTypes;

                log({ 'event' : 'debug.restore.remote.download.start' });

                var timeBegin = new Date();
                BackupRestoreService.remoteSnapshotFileAsync(version, udid, types, this.sessionId).done(function (resp) {

                    RestoreContextModel.set('fileName', resp.body.value);

                    var now = new Date();
                    var time = now - timeBegin;
                    var handler = function () {
                        this.isProgressing = false;
                        this.offMessageHandler();
                        downloadView.setProgressState(false);

                        this.showRestoreView();
                        footerView.setButtonState('progressing');

                        if (RestoreContextModel.IsNoneAppSelected) {
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

                    this.isProgressing = false;
                    this.offMessageHandler();

                    BackupRestoreService.showAndRecordError('debug.restore.progress.error', resp, 0, this.userCancelled);
                    BackupRestoreService.logRestoreContextModel(RestoreContextModel, false);
                    this.releaseWindow();
                }.bind(this));

                this.progressHanlder = IO.Backend.Device.onmessage({
                    'data.channel' : this.sessionId
                }, function (data) {
                    downloadView.updateProgress(data, 100);
                });
            },
            remove : function () {
                RestoreView.__super__.remove.apply(this, arguments);

                footerView.remove();
                footerView = undefined;

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
            },
            releaseWindow : function () {
                WindowController.releaseWindowAsync();
                PIMCollection.getInstance().get(20).set('loading', false);
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
