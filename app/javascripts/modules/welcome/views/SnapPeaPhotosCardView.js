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
        
        var SnapPeaPhotosCardView = FeedCardView.getClass().extend({
            template : doT.template(TemplateFactory.get('welcome', 'snappea-photos')),
            className : FeedCardView.getClass().prototype.className + ' snappea-photos',
            render : function () {
                this.$el.html(this.template({}));
                return this;
            },
            clickButtonAction : function (evt) {

                this.openDoraemon(383);

                this.log({
                    action : 'youtube'
                }, evt);
            },
            events : {
                'click .button-action' : 'log'
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
