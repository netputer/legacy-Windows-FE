/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'Internationalization',
        'main/collections/PIMCollection',
        'main/views/MenuItemView'
    ], function (
        Backbone,
        _,
        i18n,
        PIMCollection,
        MenuItemView
    ) {
        console.log('PIMMenuView - File loaded.');

        var pimCollection = PIMCollection.getInstance();

        var PIMMenuView = Backbone.View.extend({
            className : 'w-menu-pim w-sidebar-menu',
            tagName : 'menu',
            render : function () {
                var rootItems = pimCollection.getRootItems();
                _.each(rootItems, function (item) {
                    if (item.id !== 0 && item.id !== 18) {
                        var menuItemView = MenuItemView.getInstance({
                            model : item
                        });
                        this.$el.append(menuItemView.render().$el);
                    }
                }, this);

                return this;
            }
        });

        var pimMenuView;

        var factory = _.extend({
            getInstance : function () {
                if (!pimMenuView) {
                    pimMenuView = new PIMMenuView();
                }
                return pimMenuView;
            }
        });

        return factory;

    });
}(this));
