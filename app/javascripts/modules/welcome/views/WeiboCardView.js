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
        var WeiboCardView = FeedCardView.getClass().extend({
            template : doT.template(TemplateFactory.get('welcome', 'weibo')),
            className : FeedCardView.getClass().prototype.className + ' weibo',
            render : function () {
                this.$el.html(this.template({}));
                return this;
            },
            clickButtonAction : function () {
                // TODO 弹出网页

                log({
                    'event' : 'ui.click.welcome_card_action',
                    'action' : 'weibo'
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
                return new WeiboCardView(args);
            }
        });

        return factory;
    });
}(this));
