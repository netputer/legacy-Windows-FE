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
            clickButtonIgnore : function (evt){
                this.log({
                    name : 'p2p',
                    action : 'ignore'
                }, evt);

                this.remove();
            },
            clickButtonSetup : function (evt) {

                IO.requestAsync(CONFIG.actions.WINDOW_OPEN_SETTING);

                this.log({
                    'name' : 'p2p',
                    'action' : 'p2p'
                }, evt);
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
