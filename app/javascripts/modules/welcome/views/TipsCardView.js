/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'IOBackendDevice',
        'Internationalization',
        'ui/TemplateFactory',
        'welcome/views/FeedCardView'
    ], function (
        Backbone,
        _,
        doT,
        IO,
        i18n,
        TemplateFactory,
        FeedCardView
    ) {
        var TipsCardView = FeedCardView.getClass().extend({
            template : doT.template(TemplateFactory.get('welcome', 'tips')),
            className : FeedCardView.getClass().prototype.className + ' vbox tips hide',
            render : function () {
                this.$el.html(this.template({}));
                return this;
            },
            clickButtonAction : function (evt) {
                Backbone.trigger('welcome:showTips');

                this.log({
                    action : 'tips'
                }, evt);
            },
            clickButtonIgnore : function (evt) {

                Settings.set('welcome_feed_tips', true, true);

                this.log({
                    action : 'ignore'
                }, evt);

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
