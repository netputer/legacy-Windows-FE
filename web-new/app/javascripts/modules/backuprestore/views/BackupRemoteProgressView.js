/*global define, console*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'Device',
        'Internationalization',
        'Configuration',
        'Log',
        'IOBackendDevice',
        'ui/Panel',
        'ui/UIHelper',
        'ui/TemplateFactory',
        'utilities/StringUtil',
        'backuprestore/BackupRestoreService',
        'backuprestore/models/BackupContextModel'
    ], function (
        Backbone,
        _,
        doT,
        $,
        Device,
        i18n,
        CONFIG,
        log,
        IO,
        Panel,
        UIHelper,
        TemplateFactory,
        StringUtil,
        BackupRestoreService,
        BackupContextModel
    ) {
        console.log('BackupRemoteProgressView - File loaded. ');

        var BackupRemoteProgressBodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('backup', 'backup-remote-progress')),
            className : 'w-backup-remote-progress',
            initialize : function () {
            },
            render : function () {
                this.$el.html(this.template({}));
                this.resetContent();
                return this;
            },
            resetContent : function () {
                this.$('.title').text(i18n.backup_restore.BACKUPING);
                this.$('.progress-ctn').html('');
                this.$('.mobile-tip').hide();
            }
        });

        var bodyView;
        var progressHandler;

        var BackupRemoteProgressView = Panel.extend({
            initialize : function () {
                BackupRemoteProgressView.__super__.initialize.apply(this, arguments);

                this.on(UIHelper.EventsMapping.SHOW, function () {
                    bodyView = new BackupRemoteProgressBodyView();
                    this.$bodyContent = bodyView.render().$el;
                    this.startBackupRemote();
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
                _.extend(this.events, BackupRemoteProgressView.__super__.events);
                this.delegateEvents();
                BackupRemoteProgressView.__super__.render.apply(this, arguments);

                if (bodyView !== undefined) {
                    bodyView.resetContent();
                }

                this.setButtnState(true);

                return this;
            },
            setButtnState : function (in_progress) {
                this.$('.button-finish').toggle(!in_progress);
                this.$('.button-cancel').toggle(in_progress);
            },
            startBackupRemote : function () {
                this.$('.progress-ctn').html('');

                var types = BackupContextModel.GetServerTypes;
                var sessionID = _.uniqueId('backup.nonapps_');
                log({ 'event' : 'debug.backup.remote.start' });

                this.initProgressItems(BackupContextModel.GetBRSpec);

                BackupRestoreService.remoteManualBackupAsync(types, sessionID).done(function (resp) {
                    this.backupAllFinish();
                    log({ 'event' : 'debug.backup.remote.success' });
                }.bind(this)).fail(function (resp) {
                    BackupContextModel.set('remoteErrorResult', resp.body.result);
                    BackupContextModel.set('remoteErrorCode', resp.state_code);
                    this.trigger('_ERROR');
                }.bind(this)).always(function (resp) {
                    if (progressHandler) {
                        IO.Backend.Device.offmessage(progressHandler);
                    }
                }.bind(this));

                progressHandler = IO.Backend.Device.onmessage({
                    'data.channel' : sessionID
                }, function (message) {
                    var type = BackupRestoreService.GetBRTypeBy30x0x(message.data_type);
                    var status = (message.total >= 0) ?  message.progress : BackupRestoreService.CONSTS.SYNC_PROGRESS.FAILED;
                    this.updateItem(type, status, true);
                }, this);
            },
            initProgressItems : function (brSpec) {
                _.each(brSpec.item, function (item) {
                    this.updateItem(item.type, BackupRestoreService.CONSTS.BR_PI_STATUS.WAITING, false);
                }, this);
            },
            updateItem : function (type, status, isFull) {
                if (!i18n.backup_restore.BR_TYPE_WORD_ENUM[type]) {
                    console.error('backup remote progess, unknown' + type);
                    return;
                }

                var className = 'progress-item-' + type;
                var $item = this.$('.' + className);
                if ($item.length === 0) {
                    // create a new item node
                    var template_str = doT.template(TemplateFactory.get('backup', 'backup-progress-item'))({});
                    $item = $('<div>').html(template_str);

                    $item.addClass(className).addClass('item hbox');
                    $item.find('.icon-ctn').addClass('icon-type-' + type);

                    this.$('.progress-ctn').append($item);
                }

                $item.removeClass('error');
                $item.find('progress').removeClass('running').prop({
                    max : 1,
                    value : isFull ? 1 : 0
                });

                var pattern;
                switch (status) {
                case BackupRestoreService.CONSTS.BR_PI_STATUS.WAITING:
                    pattern = i18n.backup_restore.BACKUP_WAITING;
                    break;
                case BackupRestoreService.CONSTS.SYNC_PROGRESS.FAILED:
                    $item.addClass('error');
                    pattern = i18n.backup_restore.BACKUP_FAILED;
                    break;
                case BackupRestoreService.CONSTS.SYNC_PROGRESS.START:
                case BackupRestoreService.CONSTS.SYNC_PROGRESS.RUNNING:
                    $item.find('progress').addClass('running');
                    pattern = i18n.backup_restore.BACKUP_PROCESS;
                    break;
                case BackupRestoreService.CONSTS.SYNC_PROGRESS.COMPLETED:
                    pattern = i18n.backup_restore.BACKUP_FINISH;
                    break;
                default:
                    console.log(type + ', ' + status);
                    break;
                }
                var desc = StringUtil.format(pattern, i18n.backup_restore.BR_TYPE_WORD_ENUM[type]);
                $item.find('.progress-desc').text(desc);
            },
            backupAllFinish : function () {
                _.each(BackupContextModel.get('dataIDList'), function (id) {
                    this.updateItem(id, BackupRestoreService.CONSTS.SYNC_PROGRESS.COMPLETED, true);
                }, this);

                this.$('.title').text(i18n.backup_restore.BACKUP_FINISH_LABEL);
                this.setButtnState(false);
                this.$('.mobile-tip').show();

                BackupRestoreService.logBackupContextModel(BackupContextModel, true);
            },
            clickButtonCancel : function () {
                if (progressHandler) {
                    IO.Backend.Device.offmessage(progressHandler);
                }

                BackupRestoreService.stopRemoteSyncAsync();
            },
            clickButtonFinish : function () {
                this.trigger('_BACKUP_FINISH');
            },
            events : {
                'click .button-cancel' : 'clickButtonCancel',
                'click .button-finish' : 'clickButtonFinish'
            }
        });

        var backupRemoteProgressView;

        var factory = _.extend({
            getInstance : function () {
                if (!backupRemoteProgressView) {
                    backupRemoteProgressView = new BackupRemoteProgressView({
                        title : i18n.backup_restore.BACKUP_TITLE_REMOTE,
                        disableX : true,
                        height : BackupRestoreService.CONSTS.ViewHeight,
                        width : BackupRestoreService.CONSTS.ViewWidth
                    });
                }
                return backupRemoteProgressView;
            }
        });

        return factory;
    });
}(this));
