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
        console.log('RestoreChooseAccountView - File loaded. ');

        var accountSelectorView;

        var RestoreChooseAccountBodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('restore', 'choose-account')),
            className : 'w-restore-choose-account',
            initialize : function () {
                accountSelectorView = AccountSelectorView.getInstance({
                    disableAllLabel : true,
                    displayReadOnly : false
                });
            },
            render : function () {
                this.$el.html(this.template({}));

                this.$('.account-ctn').append(accountSelectorView.render().$el);

                return this;
            },
            setAccountInfo : function () {
                var cur_contact = AccountCollection.getInstance().get(accountSelectorView.accountId);
                RestoreContextModel.set({
                    accountType : cur_contact.get('type'),
                    accountName : cur_contact.get('name')
                });
            }
        });

        var bodyView;

        var RestoreChooseAccountView = Panel.extend({
            initialize : function () {
                RestoreChooseAccountView.__super__.initialize.apply(this, arguments);

                this.on(UIHelper.EventsMapping.SHOW, function () {
                    bodyView = new RestoreChooseAccountBodyView();
                    this.$bodyContent = bodyView.render().$el;
                    this.setViewTitle();
                    this.center();
                }, this);

                this.buttons = [{
                    $button : $('<button>').html(i18n.ui.CONTINUE).addClass('button-next primary'),
                    eventName : 'button_next'
                }, {
                    $button : $('<button>').html(i18n.ui.CANCEL),
                    eventName : 'button_cancel'
                }];
            },
            setViewTitle : function () {
                this.title = RestoreContextModel.IsLocal ? i18n.backup_restore.RESTORE_TITLE_LOCAL : i18n.backup_restore.RESTORE_TITLE_REMOTE;
            },
            clickButtonNext : function () {
                bodyView.setAccountInfo();
                this.trigger('_NEXT_STEP');
            },
            events : {
                'click .button-next' : 'clickButtonNext'
            }
        });

        var restoreChooseAccountView;

        var factory = _.extend({
            getInstance : function () {
                if (!restoreChooseAccountView) {
                    restoreChooseAccountView = new RestoreChooseAccountView({
                        title : i18n.backup_restore.RESTORE_TITLE,
                        disableX : true
                    });
                }
                return restoreChooseAccountView;
            }
        });

        return factory;
    });
}(this));