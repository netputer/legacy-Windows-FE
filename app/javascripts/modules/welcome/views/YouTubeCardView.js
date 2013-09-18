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
        var YouTubeCardView = FeedCardView.getClass().extend({
            template : doT.template(TemplateFactory.get('welcome', 'snappea-youtube')),
            className : FeedCardView.getClass().prototype.className + ' snappea-youtube',
            render : function () {
                this.$el.html(this.template({}));

                log({
                    'event' : 'ui.show.welcome_card',
                    'type' : this.model.get('type')
                });

                return this;
            },
            clickButtonAction : function () {
                BrowserModuleView.navigateToThirdParty(274, 'YouTube');

                log({
                    'event' : 'ui.click.welcome_card_action',
                    'type' : this.model.get('type'),
                    'index' : this.getIndex(),
                    'action' : 'snappea-youtube'
                });
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
