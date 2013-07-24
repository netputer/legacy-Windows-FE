/*global define*/
(function (window) {
    define([
        'underscore',
        'jquery',
        'doT',
        'ui/UIHelper',
        'ui/Panel',
        'ui/AlertWindow',
        'ui/TemplateFactory',
        'Internationalization',
        'contact/collections/AccountCollection'
    ], function (
        _,
        $,
        doT,
        UIHelper,
        Panel,
        AlertWindow,
        TemplateFactory,
        i18n,
        AccountCollection
    ) {
        console.log('AddGroupWindowView - File loaded.');

        var alert = window.alert;
        var targetAccount;
        var accountCollection;

        var AddGroupWindowView = Panel.extend({
            initialize : function () {
                AddGroupWindowView.__super__.initialize.apply(this, arguments);

                this.title = i18n.contact.ADD_GROUP;
                this.width = 360;

                this.buttons = [{
                    $button : $('<button>').addClass('primary button_save').html(i18n.contact.SAVE)
                }, {
                    $button : $('<button>').html(i18n.ui.CANCEL),
                    eventName : 'button_cancel'
                }];

                this.on(UIHelper.EventsMapping.SHOW, function () {
                    accountCollection = AccountCollection.getInstance();
                    this.once('remove', function () {
                        accountCollection = undefined;
                    });
                });

                this.$bodyContent = $('<div>').addClass('w-contact-group-mangaer-body-ctn').html(doT.template(TemplateFactory.get('contact', 'add-group-body')));
            },
            show : function (value) {
                if (!value) {
                    console.error('AddGroupWindowView - Please specify target account info! ');
                } else {
                    targetAccount = value;
                    AddGroupWindowView.__super__.show.apply(this, arguments);
                }
            },
            clickButtonSave : function () {
                var $input = this.$('.input-group-name');
                var $tip = this.$('.tip');
                var groupName = $input.val().trim();

                $tip.html('');
                if (groupName.length === 0) {
                    $input.focus();
                    $tip.html(i18n.contact.PLEASE_INPUT_GROUP_NAME);
                    return;
                }

                var hasGroupName = accountCollection.get(targetAccount.id).hasGroupWithName(groupName);
                if (!!hasGroupName) {
                    $tip.html(i18n.contact.GROUP_ALREADY_EXSIST);
                    return;
                }

                accountCollection.addNewGroupAsync(targetAccount, groupName).done(function (resp) {
                    this.trigger('addNewGroup', resp.body.id);
                }.bind(this)).fail(function () {
                    alert(i18n.contact.ADD_GROUP_FAIL);
                });

                this.close();
            },
            render : function () {
                _.extend(this.events, AddGroupWindowView.__super__.events);
                return AddGroupWindowView.__super__.render.call(this);
            },
            events : {
                'click .button_save' : 'clickButtonSave'
            }
        });

        var factory = _.extend({
            getInstance : function () {
                return new AddGroupWindowView();
            }
        });

        return factory;
    });
}(this));
