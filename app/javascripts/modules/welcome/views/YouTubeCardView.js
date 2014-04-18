/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'Configuration',
        'Internationalization',
        'ui/TemplateFactory',
        'welcome/views/FeedCardView'
    ], function (
        Backbone,
        _,
        doT,
        CONFIG,
        i18n,
        TemplateFactory,
        FeedCardView
    ) {
        var YouTubeCardView = FeedCardView.getClass().extend({
            template : doT.template(TemplateFactory.get('welcome', 'snappea-youtube')),
            className : FeedCardView.getClass().prototype.className + ' snappea-youtube',
            render : function () {
                this.$el.html(this.template({}));
                return this;
            },
            clickButtonAction : function () {
                this.openDoraemon(274);
                this.log();
            },
            events : {
                'click .button-action' : 'clickButtonAction'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new YouTubeCardView(args);
            }
        });

        return factory;
    });
}(this));
