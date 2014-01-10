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
            render : function (tipsOnly) {
                var url = CONFIG.BASE_PATH + 'modules/welcome/guide/guide.html';

                if (tipsOnly === true) {
                    url = url + '?tips=1';
                }

                this.$el.attr({
                    src : url
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
