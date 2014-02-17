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
        var SnapPeaPhotosCardView = FeedCardView.getClass().extend({
            template : doT.template(TemplateFactory.get('welcome', 'snappea-photos')),
            className : FeedCardView.getClass().prototype.className + ' snappea-photos',
            render : function () {
                this.$el.html(this.template({}));
                return this;
            },
            clickButtonAction : function () {
                log({
                    'event' : 'ui.click.welcome_card_action',
                    'type' : this.model.get('type'),
                    'index' : this.getIndex(),
                    'action' : 'snappea-photos'
                });
            },
            events : {
                'click .button-action' : 'clickButtonAction'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new SnapPeaPhotosCardView(args);
            }
        });

        return factory;
    });
}(this));
