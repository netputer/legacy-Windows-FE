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
        'contact/collections/AccountCollection',
        'contact/collections/ContactsCollection',
        'contact/views/AccountSelectorView',
        'backuprestore/models/RestoreContextModel',
        'backuprestore/BackupRestoreService'
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
        AccountCollection,
        ContactsCollection,
        AccountSelectorView,
        RestoreContextModel,
        BackupRestoreService
    ) {
        console.log('RestoreAppTipView - File loaded. ');

        var RestoreChooseAccountBodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('restore', 'restore-app-tip')),
            className : 'w-restore-app-tip',
            render : function () {
                this.$el.html(this.template({}));
                return this;
            }
        });

        var bodyView;

        var RestoreAppTipView = Panel.extend({
            initialize : function () {
                RestoreAppTipView.__super__.initialize.apply(this, arguments);

                this.on(UIHelper.EventsMapping.SHOW, function () {
                    bodyView = new RestoreChooseAccountBodyView();
                    this.$bodyContent = bodyView.render().$el;
                    this.setViewTitle();
                    this.center();
                }, this);

                this.buttons = [{
                    $button : $('<button>').html(i18n.ui.FINISH).addClass('button-next primary'),
                    eventName : 'button_next'
                }];
            },
            setViewTitle : function () {
                this.title = RestoreContextModel.IsLocal ? i18n.backup_restore.RESTORE_TITLE_LOCAL : i18n.backup_restore.RESTORE_TITLE_REMOTE;
            },
            clickButtonNext : function () {
                this.trigger('_NEXT_STEP');
            },
            events : {
                'click .button-next' : 'clickButtonNext'
            }
        });

        var restoreAppTipView;

        var factory = _.extend({
            getInstance : function () {
                if (!restoreAppTipView) {
                    restoreAppTipView = new RestoreAppTipView({
                        title : i18n.backup_restore.RESTORE_TITLE,
                        disableX : true,
                        width : BackupRestoreService.CONSTS.ViewWidth
                    });
                }
                return restoreAppTipView;
            }
        });

        return factory;
    });
}(this));