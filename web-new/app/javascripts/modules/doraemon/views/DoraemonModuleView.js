/*global define*/
(function (window) {
    define([
        'underscore',
        'backbone',
        'doraemon/views/DoraemonToolbarView',
        'doraemon/views/ExtensionListView'
    ], function (
        _,
        Backbone,
        DoraemonToolbarView,
        ExtensionListView
    ) {
        console.log('ManagementView - File loaded.');

        var DoraemonModuleView = Backbone.View.extend({
            className : 'w-doraemon-module-main module-main vbox',
            initialize : function () {
                var rendered = false;
                Object.defineProperties(this, {
                    rendered : {
                        set : function (value) {
                            rendered = Boolean(value);
                        },
                        get : function () {
                            return rendered;
                        }
                    }
                });
            },
            render : function () {
                this.$el.append(DoraemonToolbarView.getInstance().render().$el);

                this.$el.append(ExtensionListView.getInstance().render().$el);

                this.rendered = true;

                return this;
            }
        });

        var doraemonModuleView;

        var factory = _.extend({
            getInstance : function () {
                if (!doraemonModuleView) {
                    doraemonModuleView = new DoraemonModuleView();
                }
                return doraemonModuleView;
            }
        });

        return factory;
    });
}(this));
