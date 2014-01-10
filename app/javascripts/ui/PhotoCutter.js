/*global define*/
(function (window) {
    define([
        'backbone',
        'doT',
        'ui/TemplateFactory'
    ], function (
        Backbone,
        doT,
        TemplateFactory
    ) {
        console.log('PhotoCutter - File loaded. ');

        var PhotoCutter = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('ui', 'photo-cutter')),
            render : function () {
                this.$el.html(this.template({}));
                return this;
            }
        });

        return PhotoCutter;
    });
}(this));
