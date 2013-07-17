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
        console.log('RestoreDeleteDataView - File loaded. ');

        var RestoreDeleteDataBodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('restore', 'restore-delete-data')),
            className : 'w-restore-delete-data',
            initialize : function () {
            },
            render : function () {
                this.$el.html(this.template({}));
                return this;
            }
        });

        var bodyView;

        var RestoreDeleteDataView = Panel.extend({
            initialize : function () {
                RestoreDeleteDataView.__super__.initialize.apply(this, arguments);

                this.on(UIHelper.EventsMapping.SHOW, function () {
                    bodyView = new RestoreDeleteDataBodyView();
                    this.$bodyContent = bodyView.render().$el;
                    this.setViewTitle();
                    this.center();
                }, this);

                this.buttons = [{
                    $button : $('<button>').html(i18n.ui.CONFIRM).addClass('button-next primary'),
                    eventName : 'button_next'
                }];
            },
            setViewTitle : function () {
                this.title = RestoreContextModel.IsLocal ? i18n.backup_restore.RESTORE_TITLE_LOCAL : i18n.backup_restore.RESTORE_TITLE_REMOTE;
            },
            clickButtonNext : function () {
                var $checkedRadio = this.$('input[name="delete_data"]:checked');
                var shouldDelete = parseInt($checkedRadio[0].value, 10) === 1;
                if (shouldDelete) {
                    BackupRestoreService.restoreClearDataAsync();
                }

                this.trigger('_NEXT_STEP');
            },
            events : {
                'click .button-next' : 'clickButtonNext'
            }
        });

        var restoreDeleteDataView;

        var factory = _.extend({
            getInstance : function () {
                if (!restoreDeleteDataView) {
                    restoreDeleteDataView = new RestoreDeleteDataView({
                        title : i18n.backup_restore.RESTORE_TITLE,
                        disableX : true,
                        width : BackupRestoreService.CONSTS.ViewWidth
                    });
                }
                return restoreDeleteDataView;
            }
        });

        return factory;
    });
}(this));
