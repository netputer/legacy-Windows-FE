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
        var SnapPeaFeedbackCardView = FeedCardView.getClass().extend({
            template : doT.template(TemplateFactory.get('welcome', 'snappea-feedback')),
            className : FeedCardView.getClass().prototype.className + ' snappea-feedback',
            render : function () {
                this.$el.html(this.template({}));
                return this;
            },
            events : {
                'click .button-action' : 'log'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new SnapPeaFeedbackCardView(args);
            }
        });

        return factory;
    });
}(this));
