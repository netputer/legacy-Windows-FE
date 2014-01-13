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
        'new_backuprestore/BackupRestoreService'
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
            template : doT.template(TemplateFactory.get('new_backuprestore', 'backup-app-data-tip-view')),
            className : 'w-backup-app-data-tip',
            render : function () {
                this.$el.html(this.template({}));
                return this;
            }
        });

        var BackupAppDataTipView = Panel.extend({
            initialize : function () {
                BackupAppDataTipView.__super__.initialize.apply(this, arguments);

                this.on(UIHelper.EventsMapping.SHOW, function () {
                    this.bodyView = new BackupAppDataTipBodyView();
                    this.$bodyContent = this.bodyView.render().$el;
                    this.center();

                    this.once('remove', function () {
                        this.bodyView.remove();
                        this.bodyView = undefined;
                    });
                }, this);

                this.buttons = [{
                    $button : $('<button>').html(i18n.ui.CONFIRM).addClass('button-ok')
                }];
            },
            clickButtonOK : function () {
                this.trigger('_OK');
                this.remove();
            },
            events : {
                'click .button-ok' : 'clickButtonOK'
            }
        });

        var backupAppDataTipView;
        var factory = _.extend({
            getInstance : function () {
                if (!backupAppDataTipView) {
                    backupAppDataTipView = new BackupAppDataTipView({
                        title : i18n.new_backuprestore.BACKUP_TO_LOCAL,
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
