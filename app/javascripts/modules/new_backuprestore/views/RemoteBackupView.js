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
        'Account',
        'WindowController',
        'main/collections/PIMCollection',
        'new_backuprestore/views/ConfirmWindowView',
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
        Account,
        WindowController,
        PIMCollection,
        ConfirmWindowView,
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
        var confirm = ConfirmWindowView.confirm;

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
                    var url = 'https://account.wandoujia.com/?auth=' + encodeURIComponent(Account.get('auth')) + '&callback=http%3A%2F%2Fwww.wandoujia.com%2Fcloud';
                    this.$('.show-remote-file').show().prop('href', url);
                    this.$('.advanced').hide();
                    break;
                }
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
                    this.setProgressState(type, false);
                    this.updateStatus(type, 0, 0, true);
                    break;
                }
            }
        });

        var RemoteBackupView = BaseView.extend({
            initialize : function () {
                RemoteBackupView.__super__.initialize.apply(this, arguments);

                var backupHandler;
                Object.defineProperties(this, {
                    backupHandler : {
                        set : function (value) {
                            backupHandler = value;
                        },
                        get : function () {
                            return backupHandler;
                        }
                    }
                });
            },
            offMessageHandler : function () {
                if (this.backupHandler) {
                    IO.Backend.Device.offmessage(this.backupHandler);
                    this.backupHandler = undefined;
                }
            },
            remove : function () {

                progressView.remove();
                progressView = undefined;

                footerView.remove();
                footerView = undefined;

                if (remoteErrorView) {
                    remoteErrorView.remove();
                    remoteErrorView = undefined;
                }

                RemoteBackupView.__super__.remove.apply(this, arguments);
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

                return this;
            },
            cancel : function () {
                this.userCancelled = true;
                if (this.isProgressing) {

                    confirm(i18n.new_backuprestore.CANCEL_BACKUP, function () {

                        BackupRestoreService.stopRemoteSyncAsync().done(function () {

                            log({
                                event : 'ui.new_backuprestore.backup_time',
                                timeStamp : new Date().getTime() - BackupContextModel.get('startTime'),
                                isLocal : false,
                                backupResult : 'cancel'
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
                this.listenTo(footerView, '__DONE', function () {
                    this.trigger('__DONE');
                });

                this.listenTo(footerView, '__CANCEL', this.cancel);

                this.listenTo(footerView, '__START_BACKUP', function () {
                    this.setDomState(false);
                    this.startBackup();
                    PIMCollection.getInstance().get(20).set('syncing', true);

                    BackupContextModel.set('startTime', new Date().getTime());
                });
            },
            initState : function () {

                this.bindEvent();
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
                    alert(i18n.new_backuprestore.PERMISSION_TIP, this.cancel, this);
                });
            },
            setDomState : function (isDone) {
                footerView.setButtonState(isDone ? 'done' : 'progressing');
                this.stateTitle = isDone ? i18n.new_backuprestore.BACKUP_REMOTE_COMPLATE_TITLE : i18n.new_backuprestore.BACKUPING;

                if (isDone) {
                    this.bigTitle = i18n.new_backuprestore.BACKUP_FINISH_LABEL;
                }

            },
            startBackup : function () {

                log({
                    'event' : 'debug.backup.remote.start'
                });

                WindowController.blockWindowAsync();
                this.isProgressing = true;
                this.setDomState(false);

                var types = BackupContextModel.GetServerTypes;
                this.sessionId = _.uniqueId('backup.nonapps_');

                this.initProgressItems(BackupContextModel.GetBRSpec);

                this.backupHandler = IO.Backend.Device.onmessage({
                    'data.channel' : this.sessionId
                }, function (message) {
                    var type = BackupRestoreService.GetBRTypeBy30x0x(message.data_type);
                    var status = (message.total >= 0) ?  message.progress : BackupRestoreService.CONSTS.SYNC_PROGRESS.FAILED;
                    progressView.updateProgressStatus(type, status, true);
                }, this);

                BackupRestoreService.remoteManualBackupAsync(types, this.sessionId).done(function (resp) {

                    if (this.userCancelled) {
                        return;
                    }

                    log({
                        'event' : 'debug.backup.remote.success'
                    });

                    this.backupAllFinish();

                }.bind(this)).fail(function (resp) {

                    if (this.userCancelled) {
                        return;
                    }

                    BackupContextModel.set('remoteErrorResult', resp.body.result);
                    BackupContextModel.set('remoteErrorCode', resp.state_code);

                    this.showRemoteErrorView();
                }.bind(this));
            },
            showRemoteErrorView : function () {

                if (!remoteErrorView) {
                    remoteErrorView = BackupRemoteErrorView.getInstance();

                    this.listenTo(remoteErrorView, '__RETRY', function () {
                        this.offMessageHandler();
                        this.startBackup();
                    });

                    this.listenTo(remoteErrorView, '__IGNORE', function () {
                        this.backupAllFinish();
                        this.cancel();
                    });
                }

                remoteErrorView.show();
            },
            initProgressItems : function (brSpec) {
                _.each(brSpec.item, function (item) {
                    progressView.showProgress(item.type);
                    progressView.setProgressState(item.type, true);
                    progressView.updateProgressStatus(item.type, BackupRestoreService.CONSTS.BR_PI_STATUS.WAITING, false);
                }, this);
            },
            backupAllFinish : function () {

                this.setDomState(true);
                this.releaseWindow();
                this.offMessageHandler();

                _.each(BackupContextModel.get('dataIDList'), function (id) {
                    progressView.updateProgressStatus(id, BackupRestoreService.CONSTS.SYNC_PROGRESS.COMPLETED, true);
                }, this);

                BackupRestoreService.logBackupContextModel(BackupContextModel, true);

                log({
                    event : 'ui.new_backuprestore.backup_time',
                    timeStamp : new Date().getTime() - BackupContextModel.get('startTime'),
                    isLocal : false,
                    backupResult : 'finish'
                });
            },
            releaseWindow : function () {
                WindowController.releaseWindowAsync();
                PIMCollection.getInstance().get(20).set('syncing', false);
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
