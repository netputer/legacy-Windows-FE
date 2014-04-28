/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'Configuration',
        'Internationalization',
        'browser/views/BrowserModuleView',
        'ui/TemplateFactory',
        'welcome/views/FeedCardView'
    ], function (
        Backbone,
        _,
        doT,
        CONFIG,
        i18n,
        BrowserModuleView,
        TemplateFactory,
        FeedCardView
    ) {
        var ITunesMoviesCardView = FeedCardView.getClass().extend({
            template : doT.template(TemplateFactory.get('welcome', 'snappea-itunes')),
            className : FeedCardView.getClass().prototype.className + ' snappea-itunes',
            render : function () {
                this.$el.html(this.template({}));
                return this;
            },
            clickButtonAction : function () {
                BrowserModuleView.navigateToThirdParty(83, 'iTunes Movies');
                this.log();
            },
            events : {
                'click .button-action' : 'clickButtonAction'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new ITunesMoviesCardView(args);
            }
        });

        return factory;
    });
}(this));
