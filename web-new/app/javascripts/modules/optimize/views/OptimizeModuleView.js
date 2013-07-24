/*global define*/
(function (window) {
    define([
        'underscore',
        'backbone',
        'optimize/views/ScanView'
    ], function (
        _,
        Backbone,
        ScanView
    ) {
        console.log('OptimizeModuleView - File loaded.');

        var OptimizeModuleView = Backbone.View.extend({
            className : 'w-optimize-module-main module-main vbox',
            initilize : function () {
                var rendered = false;
                Object.defineProperties(this, {
                    rendered : {
                        set : function (value) {
                            rendered = value;
                        },
                        get : function () {
                            return rendered;
                        }
                    }
                });
            },
            render : function () {
                this.$el.append(ScanView.getInstance().render().$el);

                this.rendered = true;
                return this;
            }
        });

        var optimizeModuleView;

        var factory = _.extend({
            getInstance : function () {
                if (!optimizeModuleView) {
                    optimizeModuleView = new OptimizeModuleView();
                }
                return optimizeModuleView;
            }
        });

        return factory;
    });
}(this));
