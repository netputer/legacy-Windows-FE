/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'IO',
        'Log',
        'Configuration',
        'ui/TemplateFactory',
        'welcome/views/FeedCardView'
    ], function (
        Backbone,
        _,
        doT,
        IO,
        log,
        CONFIG,
        TemplateFactory,
        FeedCardView
    ) {
        var P2pCardView = FeedCardView.getClass().extend({
            template : doT.template(TemplateFactory.get('welcome', 'p2p')),
            className : FeedCardView.getClass().prototype.className + ' vbox p2p',
            render : function () {
                this.$el.html(this.template({}));
                return this;
            },
            clickButtonIgnore : function () {

                log({
                    'event' : 'ui.click.welcome_card_action',
                    'name' : 'p2p',
                    'action' : 'ignore',
                    'index' : this.getIndex()
                });

                this.remove();
            },
            clickButtonSetup : function () {

                IO.requestAsync(CONFIG.actions.WINDOW_OPEN_SETTING);

                log({
                    'event' : 'ui.click.welcome_card_action',
                    'name' : 'p2p',
                    'action' : 'p2p',
                    'index' : this.getIndex()
                });
                this.remove();
            },
            events : {
                'click .button-ignore' : 'clickButtonIgnore',
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
