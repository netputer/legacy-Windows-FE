/*global define*/
(function (window) {
    define([
        'jquery',
        'backbone',
        'underscore',
        'doT',
        'Device',
        'Log',
        'Configuration',
        'Internationalization',
        'utilities/StringUtil',
        'IO',
        'new_backuprestore/views/BaseView',
        'new_backuprestore/views/BackupRestoreProgressView',
        'new_backuprestore/views/BackupFooterView',
        'new_backuprestore/BackupRestoreService',
        'new_backuprestore/views/RemoteBackupAdvanceView',
        'new_backuprestore/models/BackupContextModel',
        'new_backuprestore/views/BackupRemoteErrorView'
    ], function (
        $,
        Backbone,
        _,
        doT,
        Device,
        log,
        CONFIG,
        i18n,
        StringUtil,
        IO,
        BaseView,
        BackupRestoreProgressView,
        BackupFooterView,
        BackupRestoreService,
        RemoteBackupAdvanceView,
        BackupContextModel,
        BackupRemoteErrorView
    ) {

        console.log('RemoteBackupView - File loaded');

        var remoteErrorView;

        var footerView;
        var FooterView = BackupFooterView.extend({
            initialize : function () {
                FooterView.__super__.initialize.apply(this, arguments);

                Object.defineProperties(this, {
                    buttonState : {
                        set : function (value) {
                            switch (value) {
                            case 'progressing':
                                this.$('.startbackup').hide();
                                this.$('.advanced').hide();
                                break;
                            case 'done':
                                this.$('.done').show();
                                this.$('.cancel').hide();
                                break;
                            }
                        }
                    }
                });
            }
        });

        var progressView;
        var ProgressView = BackupRestoreProgressView.extend({
            updateProgressStatus : function (type, status, isFull) {
                if (!i18n.new_backuprestore.BR_TYPE_WORD_ENUM[type]) {
                    console.error('backup remote progess, unknown' + type);
                    return;
                }

                //switch (type) {
                //case CONFIG.enums.BR_TYPE_CONTACT:
                //case CONFIG.enums.BR_TYPE_SMS:
                //case CONFIG.enums.BR_TYPE_APP:
                //    if (BackupContextModel.IsAppDataSelected) {
                //        current_count = current_count / all_count * 100 / 2;
                //        all_count = 100;
                //    }
                //    break;
                //}

                this.updateProgress(type, isFull ? 1 : 0, 1);

                //TODO: 逻辑先注释掉，没有设计好在什么地方显示错误信息
                //var pattern;
                switch (status) {
                //case BackupRestoreService.CONSTS.BR_PI_STATUS.WAITING:
                //case BackupRestoreService.CONSTS.SYNC_PROGRESS.START:
                //case BackupRestoreService.CONSTS.SYNC_PROGRESS.RUNNING:
                case BackupRestoreService.CONSTS.SYNC_PROGRESS.FAILED:
                    //pattern = i18n.new_backuprestore.BACKUP_FAILED;
                    break;
                case BackupRestoreService.CONSTS.SYNC_PROGRESS.COMPLETED:
                    this.setContentState(type, true);
                    break;
                }
            }
        });

        var RemoteBackupView = BaseView.extend({
            remove : function () {
                RemoteBackupView.__super__.remove.apply(this, arguments);

                if (remoteErrorView) {
                    remoteErrorView.remove();
                    remoteErrorView = undefined;
                }
            },
            render : function () {
                _.extend(this.events, RemoteBackupView.__super__.events);
                this.delegateEvents();
                RemoteBackupView.__super__.render.call(this);

                progressView = new ProgressView();
                this.$el.append(progressView.render().$el);

                footerView = new FooterView();
                footerView.isLocal = false;
                this.$el.append(footerView.render().$el);

                setTimeout(function () {
                    this.initState();
                    this.bindEvent();
                }.bind(this), 0);

                return this;
            },
            bindEvent : function () {
                this.listenTo(footerView, '__DONE', function () {
                    this.trigger('__DONE');
                });

                this.listenTo(footerView, '__CANCEL', function () {

                    this.userCancelled = true;
                    if (this.isProgressing) {
                        this.progressing = false;
                        this.offMessageHandler();
                        BackupRestoreService.stopRemoteSyncAsync();
                        alert(i18n.new_backuprestore.CANCELED);
                    }

                    this.trigger('__CANCEL');
                });

                this.listenTo(footerView, '__START_BACKUP', function () {
                    this.setDomState(false);
                    this.startBackup();
                });
            },
            initState : function () {

                this.initAttrsState();
                this.bigTitle = StringUtil.format(i18n.new_backuprestore.BACKUP_DEVICE_TITLE, Device.get('deviceName'));
                this.stateTitle = i18n.new_backuprestore.BACKUP_DEVICE_REMOTE_DESC;

                BackupRestoreService.prepareBackupAsync().done(function (resp) {

                    var dataNumList = {};
                    _.each(resp.body.item, function (item) {
                        dataNumList[item.type] = item.count;
                    });
                    BackupContextModel.set('dataNumList', dataNumList);

                    progressView.contact = dataNumList[CONFIG.enums.BR_TYPE_CONTACT];
                    progressView.sms = dataNumList[CONFIG.enums.BR_TYPE_SMS];
                    progressView.app = dataNumList[CONFIG.enums.BR_TYPE_APP];

                    footerView.enableBackupButton = true;

                }.bind(this)).fail(function (resp) {

                    log({
                        'event' : 'debug.backup.progress.error',
                        'type' : 4
                    });
                    alert(i18n.new_backuprestore.PERMISSION_TIP);
                    this.trigger('__TIME_OUT');
                });
            },
            setDomState : function (isDone) {
                footerView.buttonState = isDone ? 'done' : 'progressing';
                this.stateTitle = isDone ? i18n.new_backuprestore.BACKUP_REMOTE_COMPLATE_TITLE : i18n.new_backuprestore.BACKUPING;
                this.bigTitle = isDone ? i18n.new_backuprestore.BACKUP_FINISH_LABEL : i18n.new_backuprestore.BACKUP_DEVICE_LOCAL_DESC;
            },
            startBackup : function () {

                this.isProgressing = true;
                this.setDomState(false);

                log({
                    'event' : 'debug.backup.remote.start'
                });

                var types = BackupContextModel.GetServerTypes;
                this.sessionId = _.uniqueId('backup.nonapps_');

                this.initProgressItems(BackupContextModel.GetBRSpec);

                this.progressHandler = IO.Backend.Device.onmessage({
                    'data.channel' : this.sessionId
                }, function (message) {
                    var type = BackupRestoreService.GetBRTypeBy30x0x(message.data_type);
                    var status = (message.total >= 0) ?  message.progress : BackupRestoreService.CONSTS.SYNC_PROGRESS.FAILED;
                    progressView.updateProgressStatus(type, status, true);
                }, this);

                BackupRestoreService.remoteManualBackupAsync(types, this.sessionId).done(function (resp) {

                    log({
                        'event' : 'debug.backup.remote.success'
                    });

                    this.isProgressing = false;
                    this.offMessageHandler();

                    this.backupAllFinish();

                }.bind(this)).fail(function (resp) {

                    BackupContextModel.set('remoteErrorResult', resp.body.result);
                    BackupContextModel.set('remoteErrorCode', resp.state_code);

                    this.isProgressing = false;
                    this.offMessageHandler();
                    //this.setDomState(true);

                    this.showRemoteErrorView();

                }.bind(this));
            },
            showRemoteErrorView : function () {

                if (!remoteErrorView) {
                    remoteErrorView = BackupRemoteErrorView.getInstance();

                    this.listenTo(remoteErrorView, '__RETRY', function () {
                        this.userCancelled = false;
                        this.startBackup();
                    });

                    this.listenTo(remoteErrorView, '__IGNORE', function () {
                        this.backupAllFinish();
                    });
                }

                this.remoteErrorView.show();
            },
            initProgressItems : function (brSpec) {
                _.each(brSpec.item, function (item) {
                    progressView.showProgress(item.type);
                    progressView.updateProgressStatus(item.type, BackupRestoreService.CONSTS.BR_PI_STATUS.WAITING, false);
                }, this);
            },
            backupAllFinish : function () {

                this.setDomState(true);

                _.each(BackupContextModel.get('dataIDList'), function (id) {
                    progressView.updateProgressStatus(id, BackupRestoreService.CONSTS.SYNC_PROGRESS.COMPLETED, true);
                }, this);

                BackupRestoreService.logBackupContextModel(BackupContextModel, true);
            }
        });

        var remoteBackupView;
        var factory = _.extend({
            getInstance : function () {
                if (!remoteBackupView) {
                    remoteBackupView = new RemoteBackupView();
                }
                return remoteBackupView;
            }
        });

        return factory;
    });
}(this));
