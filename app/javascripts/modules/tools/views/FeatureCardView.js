/*global define*/
(function (window) {
    define([
        'jquery',
        'backbone',
        'underscore',
        'doT',
        'Log',
        'ui/TemplateFactory'
    ], function (
        $,
        Backbone,
        _,
        doT,
        log,
        TemplateFactory
    ) {
        console.log('ManageSDCardView - File loaded');

        var FeatureCardView = Backbone.View.extend({
            className : 'w-tools-card feature hbox',
            template : doT.template(TemplateFactory.get('tools', 'tools-feature-card')),
            render : function () {
                this.$el.html(this.template({}));
                return this;
            }
        });

        var featureCardView;
        var factory = {
            getInstance : function (){
                if (!featureCardView) {
                    featureCardView = new FeatureCardView();
                }

                return featureCardView;
            }
        };

        return factory;

    });
}(this));
