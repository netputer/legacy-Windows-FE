/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'Configuration',
        'Log',
        'Internationalization',
        'ui/TemplateFactory',
        'welcome/views/FeedCardView'
    ], function (
        Backbone,
        _,
        doT,
        CONFIG,
        log,
        i18n,
        TemplateFactory,
        FeedCardView
    ) {
        var SnapPeaFeedbackCardView = FeedCardView.getClass().extend({
            template : doT.template(TemplateFactory.get('welcome', 'snappea-feedback')),
            className : FeedCardView.getClass().prototype.className + ' snappea-feedback',
            render : function () {
                this.$el.html(this.template({}));

                log({
                    'event' : 'ui.show.welcome_card',
                    'type' : this.model.get('type')
                });

                return this;
            },
            clickButtonAction : function () {
                log({
                    'event' : 'ui.click.welcome_card_action',
                    'type' : this.model.get('type'),
                    'index' : this.getIndex(),
                    'action' : 'snappea-feedback'
                });
            },
            events : {
                'click .button-action' : 'clickButtonAction'
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
