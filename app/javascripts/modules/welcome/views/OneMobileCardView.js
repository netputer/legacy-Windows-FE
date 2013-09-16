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
        var OneMobileCardView = FeedCardView.getClass().extend({
            template : doT.template(TemplateFactory.get('welcome', 'snappea-onemobile')),
            className : FeedCardView.getClass().prototype.className + ' snappea-onemobile',
            render : function () {
                this.$el.html(this.template({}));

                log({
                    'event' : 'ui.show.welcome_card',
                    'type' : this.model.get('type')
                });

                return this;
            },
            clickButtonAction : function () {
                BrowserModuleView.navigateToThirdParty(31, '1Mobile');

                log({
                    'event' : 'ui.click.welcome_card_action',
                    'type' : this.model.get('type'),
                    'index' : this.getIndex(),
                    'action' : 'snappea-onemobile'
                });
            },
            events : {
                'click .button-action' : 'clickButtonAction'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new OneMobileCardView(args);
            }
        });

        return factory;
    });
}(this));
