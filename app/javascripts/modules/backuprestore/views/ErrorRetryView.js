/*global define, console*/
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
        'backuprestore/BackupRestoreService',
        'backuprestore/models/BackupContextModel',
        'backuprestore/models/RestoreContextModel'
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
        BackupRestoreService,
        BackupContextModel,
        RestoreContextModel
    ) {
        console.log('ErrorRetryView - File loaded. ');

        var ErrorRetryBodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('backup', 'error-retry')),
            className : 'w-backup-error-retry',
            render : function () {
                this.$el.html(this.template({}));
                return this;
            },
            setContent : function (content) {
                this.$('.content').html(content);
            }
        });

        var bodyView;

        var ErrorRetryView = Panel.extend({
            content : '',
            initialize : function () {
                ErrorRetryView.__super__.initialize.apply(this, arguments);

                this.on(UIHelper.EventsMapping.SHOW, function () {
                    bodyView = new ErrorRetryBodyView();
                    this.$bodyContent = bodyView.render().$el;
                    bodyView.setContent(this.content);

                    this.center();
                    this.once('remove', bodyView.remove, bodyView);
                }, this);

                this.buttons = [{
                    $button : $('<button>').html(i18n.ui.RETRY).addClass('button-retry'),
                    eventName : 'button_retry'
                }, {
                    $button : $('<button>').html(i18n.ui.IGNORE).addClass('button-ignore primary'),
                    eventName : 'button_ignore'
                }];
            },
            render : function () {
                _.extend(this.events, ErrorRetryView.__super__.events);
                this.delegateEvents();
                ErrorRetryView.__super__.render.apply(this, arguments);

                if (bodyView !== undefined) {
                    bodyView.setContent(this.content);
                }

                return this;
            },
            setContent : function (msg) {
                this.content = msg;
            },
            clickButtonRetry : function () {
                this.trigger('_RETYR');
            },
            clickButtonIgnore : function () {
                this.trigger('_IGNORE');
            },
            events : {
                'click .button-retry' : 'clickButtonRetry',
                'click .button-ignore' : 'clickButtonIgnore'
            }
        });

        var backupErrorRetryView;
        var restoreErrorRetryView;

        var factory = _.extend({
            getBackupInstance : function () {
                if (!backupErrorRetryView) {
                    backupErrorRetryView = new ErrorRetryView({
                        title : i18n.backup_restore.BACKUP_TITLE,
                        disableX : true,
                        width : BackupRestoreService.CONSTS.ViewWidthTip
                    });
                }
                return backupErrorRetryView;
            },
            getRestoreInstance : function () {
                if (!restoreErrorRetryView) {
                    restoreErrorRetryView = new ErrorRetryView({
                        title : i18n.backup_restore.RESTORE_TITLE,
                        disableX : true,
                        width : BackupRestoreService.CONSTS.ViewWidthTip
                    });
                }
                return restoreErrorRetryView;
            }
        });

        return factory;
    });
}(this));
