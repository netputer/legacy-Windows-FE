/*global define, console*/
(function (window, undefined) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'Device',
        'Internationalization',
        'ui/Panel',
        'ui/UIHelper',
        'ui/TemplateFactory',
        'utilities/StringUtil',
        'Log',
        'backuprestore/BackupRestoreService',
        'backuprestore/models/BackupContextModel'
    ], function (
        Backbone,
        _,
        doT,
        $,
        Device,
        i18n,
        Panel,
        UIHelper,
        TemplateFactory,
        StringUtil,
        log,
        BackupRestoreService,
        BackupContextModel
    ) {
        console.log('BackupRemoteErrorView - File loaded. ');

        var BackupRemoteErrorBodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('backup', 'backup-remote-error-view')),
            className : 'w-backup-remote-error-view',
            initialize : function () {
            },
            render : function () {
                this.$el.html(this.template({}));

                return this;
            },
            setData : function () {
                var result = BackupContextModel.get('remoteErrorResult');
                var code = BackupContextModel.get('remoteErrorCode');

                var msg = BackupRestoreService.getErrorMessage(code);
                this.$('.content').text(msg);

                // show details
                var i;
                for (i in result) {
                    var current = result[i];
                    var failedNum = current.total - current.success;
                    if (failedNum > 0) {
                        var brType = BackupRestoreService.GetBRTypeBy30x0x(current.data_type);
                        var detail = StringUtil.format(i18n.backup_restore.BACKUP_TO_CLOUD_FAILED_DETAIL,
                                                       failedNum, i18n.backup_restore.BR_TYPE_WORD_ENUM[brType]);
                        var $item = $('<div>').html(detail).addClass('text-secondary detail');
                        this.$('.content').append($item);
                    }
                }
            }
        });

        var bodyView;

        var BackupRemoteErrorView = Panel.extend({
            initialize : function () {
                BackupRemoteErrorView.__super__.initialize.apply(this, arguments);

                this.on(UIHelper.EventsMapping.SHOW, function () {
                    bodyView = new BackupRemoteErrorBodyView();
                    this.$bodyContent = bodyView.render().$el;
                    bodyView.setData();
                    this.center();
                }, this);

                this.buttons = [{
                    $button : $('<button>').html(i18n.ui.RETRY).addClass('button-retry primary'),
                    eventName : 'button_retry'
                }, {
                    $button : $('<button>').html(i18n.ui.CANCEL).addClass('button-cancel'),
                    eventName : 'button_cancel'
                }];
            },
            clickButtonRetry : function () {
                this.trigger('_RETRY');
            },
            clickButtonCancel : function () {
                this.trigger('_CANCEL');
                BackupRestoreService.logBackupContextModel(BackupContextModel, false);
                log({ 'event' : 'debug.backup.remote.failed' });
            },
            events : {
                'click .button-retry' : 'clickButtonRetry',
                'click .button-cancel' : 'clickButtonCancel'
            }
        });

        var backupRemoteErrorView;

        var factory = _.extend({
            getInstance : function () {
                if (!backupRemoteErrorView) {
                    backupRemoteErrorView = new BackupRemoteErrorView({
                        title : i18n.backup_restore.BACKUP_TITLE_REMOTE,
                        disableX : true,
                        width : BackupRestoreService.CONSTS.ViewWidthTip
                    });
                }
                return backupRemoteErrorView;
            }
        });

        return factory;
    });
}(this));