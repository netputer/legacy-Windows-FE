/*global define, _, console*/
(function (window) {
    define([
        'ui/MenuButton',
        'Internationalization',
        'contact/EditorConfig'
    ], function (
        MenuButton,
        i18n,
        EditorConfig
    ) {
        console.log('CategoryMenuVirw - File loaded. ');

        var CategoryMenuView = MenuButton.extend({
            initialize : function () {
                CategoryMenuView.__super__.initialize.apply(this, arguments);

                var items = [];
                _.each(EditorConfig.CATEGORY_MENU, function (item) {
                    items.push({
                        name : 'category',
                        type :　'normal',
                        value : item.value,
                        label : item.name
                    });
                });

                this.items = items;

                this.label = i18n.contact.ADD_CONTACT_METHOD;

                this.$el.width(145);
                this.menu.$el.width(143);
            }
        });

        var categoryMenuView;

        var factory = _.extend({
            getInstance : function () {
                if (!categoryMenuView) {
                    categoryMenuView = new CategoryMenuView();
                }
                return categoryMenuView;
            }
        });

        return factory;
    });
}(this));
