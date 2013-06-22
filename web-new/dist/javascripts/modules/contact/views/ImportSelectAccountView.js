/*global console, define*/
(function (window, undefined) {
    define([
        'backbone',
        'doT',
        'jquery',
        'underscore',
        'Device',
        'Internationalization',
        'ui/AlertWindow',
        'ui/UIHelper',
        'ui/TemplateFactory',
        'contact/views/AccountSelectorView',
        'IO',
        'contact/models/ImportContextModel'
    ], function (
        Backbone,
        doT,
        $,
        _,
        Device,
        i18n,
        AlertWindow,
        UIHelper,
        TemplateFactory,
        AccountSelectorView,
        IO,
        ImportContextModel
    ) {

        console.log('ImportSelectAccount - File loaded');


        var ImportSelectAccountBodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('contact', 'import-account-select')),
            className : 'w-contact-import-select-account-body-ctn',
            render : function () {
                this.$el.html(this.template({}));
                return this;
            }
        });

        var importSelectAccountView;
        var ImportSelectAccountView = AlertWindow.extend({
            initialize : function () {
                ImportSelectAccountView.__super__.initialize.apply(this, arguments);
                this.on(UIHelper.EventsMapping.SHOW, function () {

                    this.importSelectAccountBodyView = new ImportSelectAccountBodyView();

                    this.accountSelectorView = AccountSelectorView.getInstance({
                        disableAllLabel : true,
                        displayReadOnly : false
                    });
                    this.$bodyContent = this.importSelectAccountBodyView.render().$el.append(this.accountSelectorView.render().$el);
                    this.center();

                    this.once('remove', this.importSelectAccountBodyView.remove, this.importSelectAccountBodyView);
                    this.once('remove', this.accountSelectorView.remove, this.accountSelectorView);
                });

                Device.on('change:isConnected', function (Device, isConnected) {
                    this.$('.button_yes').prop('disabled', !isConnected);
                }, this);

                this.buttons = [{
                    $button : $('<button>').html(i18n.ui.CONFIRM).addClass('button_yes primary'),
                    eventName : 'button_yes'
                }, {
                    $button : $('<button>').html(i18n.ui.CANCEL),
                    eventName : 'button_cancel'
                }];
            },
            clickButtonYes : function () {
                ImportContextModel.set({
                    accountId : this.accountSelectorView.accountId
                });
                this.trigger('_NEXT_STEP');
            },
            events : {
                'click .button_yes' : 'clickButtonYes'
            }
        });

        var factory = {
            getInstance : function () {
                if (!importSelectAccountView) {
                    importSelectAccountView = new ImportSelectAccountView({
                        title: i18n.contact.WINDOW_IMPORT_TITLE
                    });
                }
                return importSelectAccountView;
            }
        };
        return factory;
    });
}(this));
