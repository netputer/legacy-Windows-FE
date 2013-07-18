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
        var CloudPhotoCardView = FeedCardView.getClass().extend({
            template : doT.template(TemplateFactory.get('welcome', 'cloud-photo')),
            className : FeedCardView.getClass().prototype.className + ' cloud-photo',
            render : function () {
                this.$el.html(this.template({}));
                return this;
            },
            clickButtonAction : function () {
            },
            clickButtonIgnore : function () {
            },
            events : {
                'click .button-action' : 'clickButtonAction',
                'click .button-ignore' : 'clickButtonIgnore'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new CloudPhotoCardView(args);
            }
        });

        return factory;
    });
}(this));
