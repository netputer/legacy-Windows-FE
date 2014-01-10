/*global define, console*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'Internationalization',
        'ui/Panel',
        'ui/UIHelper',
        'ui/TemplateFactory',
        'backuprestore/BackupRestoreService'
    ], function (
        Backbone,
        _,
        doT,
        $,
        i18n,
        Panel,
        UIHelper,
        TemplateFactory,
        BackupRestoreService
    ) {
        console.log('BackupAppDataTipView - File loaded. ');

        var BackupAppDataTipBodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('backup', 'backup-app-data-tip-view')),
            className : 'w-backup-app-data-tip',
            render : function () {
                this.$el.html(this.template({}));

                return this;
            }
        });

        var bodyView;

        var BackupAppDataTipView = Panel.extend({
            initialize : function () {
                BackupAppDataTipView.__super__.initialize.apply(this, arguments);

                this.on(UIHelper.EventsMapping.SHOW, function () {
                    bodyView = new BackupAppDataTipBodyView();
                    this.$bodyContent = bodyView.render().$el;
                    this.center();
                }, this);

                this.buttons = [{
                    $button : $('<button>').html(i18n.ui.CONFIRM).addClass('button-next'),
                    eventName : 'button_next'
                }];
            },
            clickButtonOK : function () {
                this.trigger('_OK');
                this.remove();
            },
            events : {
                'click .button-next' : 'clickButtonOK'
            }
        });

        var backupAppDataTipView;

        var factory = _.extend({
            getInstance : function () {
                if (!backupAppDataTipView) {
                    backupAppDataTipView = new BackupAppDataTipView({
                        title : i18n.backup_restore.BACKUP_TITLE_LOCAL,
                        disableX : true,
                        width : BackupRestoreService.CONSTS.ViewWidthTip
                    });
                }
                return backupAppDataTipView;
            }
        });

        return factory;
    });
}(this));
