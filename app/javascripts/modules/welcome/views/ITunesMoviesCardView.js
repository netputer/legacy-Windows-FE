/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'Configuration',
        'Log',
        'Internationalization',
        'browser/views/BrowserModuleView',
        'ui/TemplateFactory',
        'welcome/views/FeedCardView'
    ], function (
        Backbone,
        _,
        doT,
        CONFIG,
        log,
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

                log({
                    'event' : 'ui.click.welcome_card_action',
                    'type' : this.model.get('type'),
                    'index' : this.getIndex(),
                    'action' : 'snappea-itunes'
                });
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
