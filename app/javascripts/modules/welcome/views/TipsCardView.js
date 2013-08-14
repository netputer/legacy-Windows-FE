/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'Log',
        'IOBackendDevice',
        'Internationalization',
        'ui/TemplateFactory',
        'welcome/views/FeedCardView'
    ], function (
        Backbone,
        _,
        doT,
        log,
        IO,
        i18n,
        TemplateFactory,
        FeedCardView
    ) {
        var TipsCardView = FeedCardView.getClass().extend({
            template : doT.template(TemplateFactory.get('welcome', 'tips')),
            className : FeedCardView.getClass().prototype.className + ' tips hide',
            render : function () {
                this.$el.html(this.template({}));
                return this;
            },
            clickButtonAction : function () {
                Backbone.trigger('welcome:showTips');

                log({
                    'event' : 'ui.click.welcome_card_action',
                    'action' : 'tips'
                });
            },
            clickButtonIgnore : function () {
                this.remove();
            },
            events : {
                'click .button-action' : 'clickButtonAction',
                'click .button-ignore' : 'clickButtonIgnore'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new TipsCardView(args);
            }
        });

        return factory;
    });
}(this));
