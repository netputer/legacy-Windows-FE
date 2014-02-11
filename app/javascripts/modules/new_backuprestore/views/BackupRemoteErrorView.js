/*global define*/
(function (window) {
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
        'new_backuprestore/BackupRestoreService',
        'new_backuprestore/models/BackupContextModel'
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
            template : doT.template(TemplateFactory.get('new_backuprestore', 'backup-remote-error-view')),
            className : 'w-backup-remote-error-view',
            render : function () {
                this.$el.html(this.template({}));

                setTimeout(function () {
                    this.initData();
                }.bind(this), 0);

                return this;
            },
            initData : function () {
                var result = BackupContextModel.get('remoteErrorResult');
                var code = BackupContextModel.get('remoteErrorCode');

                var msg = BackupRestoreService.getErrorMessage(code);
                this.$('.content').html(msg);

                _.each(result, function (current) {
                    var failedNum = current.total - current.success;
                    if (failedNum > 0) {
                        var brType = BackupRestoreService.GetBRTypeBy30x0x(current.data_type);
                        var detail = StringUtil.format(i18n.new_backuprestore.BACKUP_TO_CLOUD_FAILED_DETAIL, failedNum, i18n.new_backuprestore.BR_TYPE_WORD_ENUM[brType]);
                        var $item = $('<div>').html(detail).addClass('text-secondary detail');
                        this.$('.content').append($item);
                    }
                });
            }
        });

        var BackupRemoteErrorView = Panel.extend({
            initialize : function () {
                BackupRemoteErrorView.__super__.initialize.apply(this, arguments);

                this.on(UIHelper.EventsMapping.SHOW, function () {
                    this.bodyView = new BackupRemoteErrorBodyView();
                    this.$bodyContent = this.bodyView.render().$el;
                    this.center();

                    this.once('remote', function () {
                        this.bodyView.remove();
                        this.bodyView = undefined;
                    }, this);

                }, this);

                this.buttons = [{
                    $button : $('<button>').html(i18n.ui.RETRY).addClass('button-retry primary')
                }, {
                    $button : $('<button>').html(i18n.ui.CANCEL).addClass('button-cancel')
                }];
            },
            clickButtonCancel : function () {

                log({
                    'event' : 'debug.backup.remote.failed'
                });

                BackupRestoreService.logBackupContextModel(BackupContextModel, false);

                this.remove();
                this.trigger('__IGNORE');
            },
            clickButtonRetry : function () {
                this.remove();
                this.trigger('__RETRY');
            },
            events : {
                'click .button-cancel' : 'clickButtonCancel',
                'click .button-retry' : 'clickButtonRetry'
            }
        });

        var backupRemoteErrorView;
        var factory = _.extend({
            getInstance : function () {
                if (!backupRemoteErrorView) {
                    backupRemoteErrorView = new BackupRemoteErrorView({
                        title : i18n.new_backuprestore.BACKUP_TITLE_REMOTE,
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
