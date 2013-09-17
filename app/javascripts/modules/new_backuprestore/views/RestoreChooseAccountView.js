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
        'new_backuprestore/models/RestoreContextModel',
        'new_backuprestore/BackupRestoreService'
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

                    this.once('remove', function () {
                        bodyView.remove();
                        bodyView = undefined;

                        accountSelectorView.remove();
                        accountSelectorView = undefined;
                    });
                }, this);

                this.buttons = [{
                    $button : $('<button>').html(i18n.ui.CONTINUE).addClass('button-next primary'),
                    eventName : 'button_yes'
                }, {
                    $button : $('<button>').html(i18n.ui.CANCEL),
                    eventName : 'button_cancel'
                }];
            },
            setViewTitle : function () {
                this.title = RestoreContextModel.isLocal ? i18n.new_backuprestore.RESTORE_TITLE_LOCAL : i18n.new_backuprestore.RESTORE_TITLE_REMOTE;
            },
            clickButtonNext : function () {
                bodyView.setAccountInfo();
                this.trigger('__START_RESTORE');
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
                        title : i18n.new_backuprestore.RESTORE_TITLE,
                        disableX : true
                    });
                }
                return restoreChooseAccountView;
            }
        });

        return factory;
    });
}(this));
