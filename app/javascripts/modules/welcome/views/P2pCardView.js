/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'Log',
        'IO',
        'Configuration',
        'ui/TemplateFactory',
        'welcome/views/FeedCardView'
    ], function (
        Backbone,
        _,
        doT,
        log,
        IO,
        CONFIG,
        TemplateFactory,
        FeedCardView
    ) {
        var P2pCardView = FeedCardView.getClass().extend({
            template : doT.template(TemplateFactory.get('welcome', 'p2p')),
            className : FeedCardView.getClass().prototype.className + ' p2p',
            render : function () {
                this.$el.html(this.template({}));
                return this;
            },
            clickButtonAction : function () {
                this.remove();
            },
            clickButtonSetup : function () {

                IO.requestAsync(CONFIG.actions.WINDOW_OPEN_PRIVACY_SETTING);
                this.remove();

                log({
                    'event' : 'ui.click.welcome_card_action',
                    'action' : 'p2p'
                });

            },
            events : {
                'click .button-action' : 'clickButtonAction',
                'click .button-setup' : 'clickButtonSetup'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new P2pCardView(args);
            }
        });

        return factory;
    });
}(this));
