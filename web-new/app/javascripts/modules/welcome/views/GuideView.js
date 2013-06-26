/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'Configuration',
        'Environment'
    ], function (
        Backbone,
        _,
        CONFIG,
        Environment
    ) {
        var GuideView = Backbone.View.extend({
            tagName : 'iframe',
            className : 'w-welcome-guide-frame',
            render : function () {
                this.$el.attr({
                    src : CONFIG.BASE_PATH + 'modules/welcome/guide/guide.html' + Environment.get('search')
                }).css({
                    display : 'block'
                });
                return this;
            }
        });

        var factory = _.extend({
            getInstance : function () {
                return new GuideView();
            }
        });

        return factory;
    });
}(this));
