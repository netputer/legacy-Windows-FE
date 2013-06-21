/*global define*/
(function (window, undefined) {
    define([
        'underscore',
        'jquery',
        'doT',
        'ui/Panel',
        'ui/TemplateFactory',
        'ui/AlertWindow',
        'Internationalization',
        'contact/collections/AccountCollection'
    ], function (
        _,
        $,
        doT,
        Panel,
        TemplateFactory,
        AlertWindow,
        i18n,
        AccountCollection
    ) {
        console.log('AddGroupWindowView - File loaded.');

        var alert = window.alert;

        var targetAccount;

        var AddGroupWindowView = Panel.extend({
            initialize : function () {
                AddGroupWindowView.__super__.initialize.apply(this, arguments);

                this.title = i18n.contact.ADD_GROUP;
                this.width = 360;

                this.buttons = [{
                    $button : $('<button>').addClass('primary').html(i18n.contact.SAVE),
                    eventName : 'button_save'
                }, {
                    $button : $('<button>').html(i18n.contact.CANCEL),
                    eventName : 'button_cancel'
                }];

                this.$bodyContent = $('<div>').html(doT.template(TemplateFactory.get('contact', 'add-group-body')));

                this.on('button_save', function () {
                    var $input = this.$('.input-group-name');
                    var groupName = $input.val().trim();
                    if (groupName.length === 0) {
                        $input.focus();
                    } else {
                        this.close();
                        AccountCollection.getInstance().addNewGroupAsync(targetAccount, groupName).done(function (resp) {
                            this.trigger('addNewGroup', resp.body.id);
                        }.bind(this)).fail(function () {
                            alert(i18n.contact.ADD_GROUP_FAIL);
                        });
                    }
                }, this);
            },
            show : function (value) {
                if (!value) {
                    console.error('AddGroupWindowView - Please specify target account info! ');
                } else {
                    targetAccount = value;
                    AddGroupWindowView.__super__.show.apply(this, arguments);
                }
            }
        });

        var addGroupWindowView;

        var factory = _.extend({
            getInstance : function () {
                return addGroupWindowView || new AddGroupWindowView();
            }
        });

        return factory;
    });
}(this));
