/*global define*/
(function (window, document) {
    'use strict';

    define([
        'backbone',
        'underscore',
        'doT',
        'ui/TemplateFactory',
        'Internationalization',
        'FunctionSwitch',
        'Configuration',
        'Strategy',
        'doraemon/collections/ExtensionsCollection',
        'doraemon/views/MenuItemView',
        'doraemon/views/GallerySwitchView',
        'main/views/MenuItemView',
        'main/collections/PIMCollection'
    ], function (
        Backbone,
        _,
        doT,
        TemplateFactory,
        i18n,
        FunctionSwitch,
        CONFIG,
        Strategy,
        ExtensionsCollection,
        MenuItemView,
        GallerySwitchView,
        PIMMenuItemView,
        PIMCollection
    ) {
        console.log('DoraemonMenuView - File loaded.');

        var extensionsCollection;
        var optimizeItemView;
        var OptimizeItemView = PIMMenuItemView.getClass();

        var optimizeModel = PIMCollection.getInstance().get(18);

        var DoraemonMenuView = Backbone.View.extend({
            className : 'w-menu-doraemon w-sidebar-menu',
            tagName : 'menu',
            initialize : function () {
                extensionsCollection = ExtensionsCollection.getInstance();

                extensionsCollection.on('refresh', this.buildList, this);

                extensionsCollection.on('star', function (extension) {
                    var menuItemView = MenuItemView.getInstance({
                        model : extension
                    });
                    if (optimizeItemView) {
                        optimizeItemView.$el.before(menuItemView.render().$el);
                    } else {
                        GallerySwitchView.getInstance().$el.before(menuItemView.render().$el);
                    }
                    menuItemView.$el[0].scrollIntoView();
                    menuItemView.highlight();
                });

                if (!FunctionSwitch.ENABLE_OPTIMIZE) {
                    this.listenTo(Strategy, 'change:enableQqTijian', function () {
                        if (FunctionSwitch.ENABLE_OPTIMIZE) {
                            var model = PIMCollection.getInstance().get(18);

                            optimizeItemView = optimizeItemView || new OptimizeItemView({
                                model : model
                            });
                            model.set('hide', false);

                            GallerySwitchView.getInstance().$el.before(optimizeItemView.render().$el);
                        }
                    });
                }
            },
            buildList : function (extensionsCollection) {
                if (FunctionSwitch.ENABLE_DORAEMON) {
                    GallerySwitchView.getInstance().$el.detach();
                }

                if (FunctionSwitch.ENABLE_OPTIMIZE) {
                    optimizeModel.set('hide', false);
                    optimizeItemView = optimizeItemView || new OptimizeItemView({
                        model : optimizeModel
                    });

                    optimizeItemView.$el.detach();
                }

                var fragment = document.createDocumentFragment();
                extensionsCollection.each(function (extension) {
                    var menuItemView = MenuItemView.getInstance({
                        model : extension
                    });

                    fragment.appendChild(menuItemView.render().$el[0]);
                });

                if (FunctionSwitch.ENABLE_OPTIMIZE) {
                    fragment.appendChild(optimizeItemView.render().$el[0]);
                }

                if (FunctionSwitch.ENABLE_DORAEMON) {
                    fragment.appendChild(GallerySwitchView.getInstance().render().$el[0]);
                }

                this.$el.empty().append(fragment);
            },
            render : function () {
                if (FunctionSwitch.ENABLE_DORAEMON) {
                    this.$('.w-sidebar-menu').append(GallerySwitchView.getInstance().render().$el);
                }

                this.buildList(extensionsCollection);

                return this;
            }
        });

        var doraemonMenuView;

        var factory = _.extend({
            getInstance : function () {
                if (!doraemonMenuView) {
                    doraemonMenuView = new DoraemonMenuView();
                }
                return doraemonMenuView;
            }
        });

        return factory;
    });
}(this, this.document));
