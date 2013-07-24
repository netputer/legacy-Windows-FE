/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'Device',
        'Internationalization',
        'Configuration',
        'ui/Panel',
        'ui/UIHelper',
        'ui/AlertWindow',
        'ui/TemplateFactory',
        'IOBackendDevice',
        'utilities/StringUtil',
        'backuprestore/BackupRestoreService',
        'backuprestore/models/BackupContextModel',
        'backuprestore/views/BackupAppDataTipView'
    ], function (
        Backbone,
        _,
        doT,
        $,
        Device,
        i18n,
        CONFIG,
        Panel,
        UIHelper,
        AlertWindow,
        TemplateFactory,
        IO,
        StringUtil,
        BackupRestoreService,
        BackupContextModel,
        BackupAppDataTipView
    ) {
        console.log('BackupProgressView - File loaded. ');

        var alert = window.alert;

        var bodyView;
        var backupSessionID;
        var userCancelled;
        var isAppDataRunning;

        var BackupProgressBodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('backup', 'backup-progress')),
            className : 'w-backup-progress',
            initialize : function () {
            },
            render : function () {
                this.$el.html(this.template({}));
                this.resetContent();
                return this;
            },
            resetContent : function () {
                this.$('.privacy-tip').hide();
                this.$('.title').text(i18n.backup_restore.BACKUPING);
                this.$('.progress-ctn').html('');
                isAppDataRunning = false;
            }
        });

        var smsProgressHandler;
        var appProgressHandler;
        var appDataProgressHandler;

        var BackupProgressView = Panel.extend({
            initialize : function () {
                BackupProgressView.__super__.initialize.apply(this, arguments);

                this.on(UIHelper.EventsMapping.SHOW, function () {
                    userCancelled = false;
                    bodyView = new BackupProgressBodyView();
                    this.$bodyContent = bodyView.render().$el;
                    this.startBackupSmsAndContact();
                    this.center();
                }, this);

                this.buttons = [{
                    $button : $('<button>').html(i18n.ui.FINISH).addClass('button-finish primary'),
                    eventName : 'button_finish'
                }, {
                    $button : $('<button>').html(i18n.ui.CANCEL).addClass('button-cancel'),
                    eventName : 'button_cancel'
                }];
            },
            render : function () {
                _.extend(this.events, BackupProgressView.__super__.events);
                this.delegateEvents();
                BackupProgressView.__super__.render.apply(this, arguments);

                var $buttonShowFile = $('<button>').html(i18n.backup_restore.OPEN_BACKUP_FILE).addClass('button-show-file');
                this.$('.w-ui-window-footer-monitor').append($buttonShowFile);

                if (bodyView !== undefined) {
                    bodyView.resetContent();
                }

                this.setButtnState(true);

                return this;
            },
            setButtnState : function (inProgress) {
                this.$('.button-show-file, .button-finish').toggle(!inProgress);
                this.$('.button-cancel').toggle(inProgress);
            },
            initProgressItems : function (brSpec) {
                _.each(brSpec.item, function (item) {
                    this.updateItem(item.type, BackupRestoreService.CONSTS.BR_PI_STATUS.WAITING, 0, item.count, '');
                }, this);
            },
            updateNonAppItems : function (items) {
                var i;
                for (i in items) {
                    if (items.hasOwnProperty(i)) {
                        var item = items[i];
                        if (i === 0 || item.status !== BackupRestoreService.CONSTS.BR_PI_STATUS.READY) {
                            this.updateItem(item.type, item.status, item.finished_count, item.all_count);
                        }
                    }
                }
            },
            findOrCreateProgressItem : function (type) {
                var className = 'progress-item-' + type;
                var $item = this.$('.' + className);
                if ($item.length === 0) {
                    // create a new item node
                    var templateStr = doT.template(TemplateFactory.get('backup', 'backup-progress-item'))({});
                    $item = $('<div>').html(templateStr);
                    $item.addClass(className).addClass('item hbox');
                    $item.find('.icon-ctn').addClass('icon-type-' + type);

                    this.$('.progress-ctn').append($item);
                }
                return $item;
            },
            updateItem : function (type, status, currentValue, maxValue, errorMsg) {
                var $item = this.findOrCreateProgressItem(type);
                $item.removeClass('error');

                // set the progress as running for app data
                if (type === CONFIG.enums.BR_TYPE_APP_DATA && isAppDataRunning && status === BackupRestoreService.CONSTS.BR_STATUS.RUNNING) {
                    $item.find('.progress-desc').text(i18n.backup_restore.BACKUP_PROCESS_APP_DATA);
                    $item.find('progress').addClass('running').prop({
                        max : 100,
                        value : 100
                    });
                    return;
                }

                $item.find('progress').removeClass('running');

                var pattern;
                switch (status) {
                case BackupRestoreService.CONSTS.BR_PI_STATUS.WAITING:
                    pattern = i18n.backup_restore.BACKUP_WAITING;
                    break;
                case BackupRestoreService.CONSTS.BR_PI_STATUS.FINISHED:
                    pattern = i18n.backup_restore.BACKUP_FINISH;
                    break;
                case BackupRestoreService.CONSTS.BR_PI_STATUS.ERROR:
                    $item.addClass('error');
                    pattern = i18n.backup_restore.BACKUP_FAILED;
                    pattern += errorMsg || '';
                    break;
                default:
                    pattern = i18n.backup_restore.BACKUP_PROCESS;
                    break;
                }
                var desc = StringUtil.format(pattern, i18n.backup_restore.BR_TYPE_WORD_ENUM[type]);
                $item.find('.progress-desc').text(desc);

                if (currentValue >= 0 && maxValue >= 0) {
                    var numStr = StringUtil.format('{1} / {2}', currentValue, maxValue);
                    $item.find('.progress-num').text(numStr);
                    if (currentValue === 0 && maxValue === 0) {
                        currentValue = maxValue = 1;
                    }
                    $item.find('progress').prop({
                        max : maxValue,
                        value : currentValue
                    });
                }
            },
            startBackupSmsAndContact : function () {
                var sessionID = _.uniqueId('backup.nonapps_');
                backupSessionID = sessionID;
                var filePath = BackupContextModel.GetFullFilePath;
                var brSpec = BackupContextModel.GetBRSpec;

                this.initProgressItems(brSpec);

                // call backupSmsAndContactFinish() after
                // both backupStartNonAppsAsync callback and BackupRestoreService.CONSTS.BR_STATUS.FINISHED received
                var finishedNum = 0;
                BackupRestoreService.backupStartNonAppsAsync(filePath, sessionID, brSpec).done(function (resp) {
                    BackupContextModel.set('appPath', resp.body.value);
                    finishedNum++;
                    this.backupSmsAndContactFinish(finishedNum);
                }.bind(this)).fail(function (resp) {
                    this.remove();
                    BackupRestoreService.showAndRecordError('debug.backup.progress.error', resp, 0);
                    BackupRestoreService.logBackupContextModel(BackupContextModel, false);
                }.bind(this));

                smsProgressHandler = IO.Backend.Device.onmessage({
                    'data.channel' : sessionID
                }, function (data) {
                    var progress = data;
                    var i, item;
                    switch (progress.status) {
                    case BackupRestoreService.CONSTS.BR_STATUS.RUNNING:
                        this.updateNonAppItems(progress.item);
                        break;
                    case BackupRestoreService.CONSTS.BR_STATUS.FINISHED:
                        this.updateNonAppItems(progress.item);

                        IO.Backend.Device.offmessage(smsProgressHandler);
                        finishedNum++;
                        this.backupSmsAndContactFinish(finishedNum);
                        break;
                    case BackupRestoreService.CONSTS.BR_STATUS.READY:
                    case BackupRestoreService.CONSTS.BR_STATUS.PAUSED:
                    case BackupRestoreService.CONSTS.BR_STATUS.STOPPED:
                        break;
                    case BackupRestoreService.CONSTS.BR_STATUS.ABORT:
                        this.remove();
                        alert(i18n.backup_restore.BACKUP_ABORT_TIP);
                        BackupRestoreService.logBackupContextModel(BackupContextModel, false);
                        break;
                    default:
                        this.remove();
                        alert(i18n.backup_restore.BACKUP_FAILED_TIP + progress.status);
                        BackupRestoreService.logBackupContextModel(BackupContextModel, false);
                        break;
                    }
                }, this);
            },
            backupSmsAndContactFinish : function (finishedNum) {
                if (finishedNum < 2) {
                    return;
                }

                if (BackupContextModel.IsAppSelected) {
                    this.startBackupApps();
                } else {
                    this.backupAllFinish();
                }
            },
            startBackupApps : function () {
                // empty app list
                if (BackupContextModel.get('dataNumList')[CONFIG.enums.BR_TYPE_APP] === 0) {
                    this.updateItem(CONFIG.enums.BR_TYPE_APP, BackupRestoreService.CONSTS.BR_PI_STATUS.FINISHED, 0, 0);
                    if (BackupContextModel.IsAppDataSelected) {
                        this.updateItem(CONFIG.enums.BR_TYPE_APP_DATA, BackupRestoreService.CONSTS.BR_PI_STATUS.FINISHED, 0, 0);
                    }
                    this.backupAllFinish();
                    return;
                }

                var exportDir = BackupContextModel.get('appPath');
                var fileType = BackupContextModel.get('appType');
                var sessionID = _.uniqueId('backup.apps_');
                backupSessionID = sessionID;
                var finished = false;

                BackupRestoreService.backupStartAppsAsync(exportDir, sessionID, fileType).done(function (resp) {
                    var data = resp.body;
                    var success = data && data.success && data.success.length ? data.success.length : 0;
                    var failed = data && data.failed && data.failed.length ? data.failed.length : 0;
                    if (failed > 0) {
                        this.updateItem(CONFIG.enums.BR_TYPE_APP, BackupRestoreService.CONSTS.BR_PI_STATUS.ERROR, success, data.total);
                        BackupContextModel.set('appErrorList', data.failed);
                        this.trigger('_APP_ERROR_LIST');
                    } else {
                        this.updateItem(CONFIG.enums.BR_TYPE_APP, BackupRestoreService.CONSTS.BR_PI_STATUS.FINISHED, success, data.total);
                        if (BackupContextModel.IsAppDataSelected) {
                            this.startBackupAppData();
                        } else {
                            this.backupAllFinish();
                        }
                    }
                }.bind(this)).fail(function (resp) {
                    this.remove();
                    BackupRestoreService.showAndRecordError('debug.backup.progress.error', resp, 1);
                    BackupRestoreService.logBackupContextModel(BackupContextModel, false);
                }.bind(this)).always(function (resp) {
                    finished = true;
                }.bind(this));

                appProgressHandler = IO.Backend.Device.onmessage({
                    'data.channel' : sessionID
                }, function (data) {
                    if (finished) {
                        IO.Backend.Device.offmessage(appProgressHandler);
                        return;
                    }

                    this.updateItem(CONFIG.enums.BR_TYPE_APP, BackupRestoreService.CONSTS.BR_PI_STATUS.RUNNING, data.current, data.total);
                }, this);
            },
            startBackupAppData : function () {
                if (userCancelled) {
                    return;
                }

                var exportDir = BackupContextModel.get('appPath');
                var sessionID = _.uniqueId('backup.appdata_');
                backupSessionID = sessionID;
                var finished = false;
                var tipView = BackupAppDataTipView.getInstance();

                tipView.on('_OK', function () {
                    var $item = this.findOrCreateProgressItem(CONFIG.enums.BR_TYPE_APP_DATA);
                    $item.addClass('error');
                    $item.find('.progress-desc').text(i18n.backup_restore.BACKUP_APP_DATA_WAITING);
                }.bind(this));

                BackupRestoreService.backupStartAppDataAsync(exportDir, sessionID).done(function (resp) {
                    var data = resp.body;
                    var success = data && data.success && data.success.length ? data.success.length : 0;
                    var failed = data && data.failed && data.failed.length ? data.failed.length : 0;
                    if (failed > 0) {
                        this.updateItem(CONFIG.enums.BR_TYPE_APP_DATA, BackupRestoreService.CONSTS.BR_PI_STATUS.ERROR, success, data.total);
                        BackupContextModel.set('appDataErrorList', data.failed);
                        this.trigger('_APP_DATA_ERROR_LIST');
                    } else {
                        this.updateItem(CONFIG.enums.BR_TYPE_APP_DATA, BackupRestoreService.CONSTS.BR_PI_STATUS.FINISHED, success, data.total);
                        this.backupAllFinish();
                    }
                }.bind(this)).fail(function (resp) {
                    if (userCancelled) {
                        return;
                    }

                    // error cannot be handled, just ignore backuping app data
                    var errorList = [735, 736, 739];
                    var appNum = BackupContextModel.get('dataNumList')[CONFIG.enums.BR_TYPE_APP];
                    if (errorList.indexOf(resp.state_code) >= 0) {
                        var msg = BackupRestoreService.CONSTS.ErrorCodeToMessage[resp.state_code];
                        this.updateItem(CONFIG.enums.BR_TYPE_APP_DATA, BackupRestoreService.CONSTS.BR_PI_STATUS.ERROR, 0, appNum, msg);
                        this.backupAllFinish();
                        return;
                    }

                    // error can be handled, retry
                    var errorMsg = BackupRestoreService.CONSTS.ErrorCodeToMessage[resp.state_code] || '';
                    this.updateItem(CONFIG.enums.BR_TYPE_APP_DATA, BackupRestoreService.CONSTS.BR_PI_STATUS.ERROR, 0, appNum, errorMsg);
                    BackupContextModel.set('appDataErrorMessage', errorMsg);
                    this.trigger('_APP_DATA_ERROR_ALL');
                }.bind(this)).always(function (resp) {
                    tipView.remove();
                    finished = true;
                }.bind(this));

                appDataProgressHandler = IO.Backend.Device.onmessage({
                    'data.channel' : sessionID
                }, function (data) {
                    if (finished || userCancelled) {
                        IO.Backend.Device.offmessage(appDataProgressHandler);
                        return;
                    }

                    // show or hide the 'need confirm on device' message
                    if (data.message === CONFIG.enums.BACKUP_APP_DATA_MESSAGE_NEED_USER) {
                        tipView.show();
                        isAppDataRunning = true;
                        return;
                    }

                    tipView.remove();
                    this.updateItem(CONFIG.enums.BR_TYPE_APP_DATA, BackupRestoreService.CONSTS.BR_PI_STATUS.RUNNING, data.current, data.total);
                }, this);
            },
            backupAllFinish : function () {
                if (userCancelled) {
                    return;
                }

                this.$('.title').text(i18n.backup_restore.BACKUP_COMPRESSING);

                BackupRestoreService.backupFinishAsync(BackupContextModel.GetFullFilePath).done(function (resp) {
                    this.$('.privacy-tip').show();
                    this.$('.title').text(i18n.backup_restore.BACKUP_FINISH_LABEL);
                    this.setButtnState(false);
                    BackupRestoreService.logBackupContextModel(BackupContextModel, true);
                }.bind(this)).fail(function (resp) {
                    this.remove();
                    BackupRestoreService.showAndRecordError('debug.backup.progress.error', resp, 2);
                    BackupRestoreService.logBackupContextModel(BackupContextModel, false);
                }.bind(this));
            },
            clickButtonShowFile : function () {
                BackupRestoreService.showFileAsync(BackupContextModel.GetFullFilePath + '.zip');
            },
            clickButtonCancel : function () {
                if (smsProgressHandler) {
                    IO.Backend.Device.offmessage(smsProgressHandler);
                }
                if (appProgressHandler) {
                    IO.Backend.Device.offmessage(appProgressHandler);
                }
                if (appDataProgressHandler) {
                    IO.Backend.Device.offmessage(appDataProgressHandler);
                }

                userCancelled = true;
                BackupRestoreService.backupCancelAsync(backupSessionID);
                alert(i18n.backup_restore.CANCELED);
            },
            clickButtonFinish : function () {
                userCancelled = true;
                this.trigger('_BACKUP_FINISH');
            },
            events : {
                'click .button-show-file' : 'clickButtonShowFile',
                'click .button-cancel' : 'clickButtonCancel',
                'click .button-finish' : 'clickButtonFinish'
            }
        });

        var backupProgressView;

        var factory = _.extend({
            getInstance : function () {
                if (!backupProgressView) {
                    backupProgressView = new BackupProgressView({
                        title : i18n.backup_restore.BACKUP_TITLE_LOCAL,
                        disableX : true,
                        height : BackupRestoreService.CONSTS.ViewHeight,
                        width : BackupRestoreService.CONSTS.ViewWidth
                    });
                }
                return backupProgressView;
            }
        });

        return factory;
    });
}(this));
