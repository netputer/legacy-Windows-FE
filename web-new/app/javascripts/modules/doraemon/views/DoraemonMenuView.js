/*global define*/
(function (window, document, undefined) {
    'use strict';

    define([
        'backbone',
        'underscore',
        'doT',
        'Log',
        'Internationalization',
        'Account',
        'FunctionSwitch',
        'Configuration',
        'IOBackendDevice',
        'Distributor',
        'ui/TemplateFactory',
        'ui/PopupTip',
        'doraemon/collections/ExtensionsCollection',
        'doraemon/models/ExtensionModel',
        'doraemon/views/MenuItemView',
        'doraemon/views/DoraemonModuleView',
        'doraemon/views/GallerySwitchView',
        'social/SocialService'
    ], function (
        Backbone,
        _,
        doT,
        log,
        i18n,
        Account,
        FunctionSwitch,
        CONFIG,
        IO,
        Distributor,
        TemplateFactory,
        PopupTip,
        ExtensionsCollection,
        ExtensionModel,
        MenuItemView,
        DoraemonModuleView,
        GallerySwitchView,
        SocialService
    ) {
        console.log('DoraemonMenuView - File loaded.');

        var extensionsCollection;

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
                    GallerySwitchView.getInstance().$el.before(menuItemView.render().$el);
                    menuItemView.$el[0].scrollIntoView();
                    menuItemView.highlight();
                });
            },
            buildList : function (extensionsCollection) {
                if (FunctionSwitch.ENABLE_DORAEMON) {
                    GallerySwitchView.getInstance().$el.detach();
                }

                var fragment = document.createDocumentFragment();
                extensionsCollection.each(function (extension) {
                    var menuItemView = MenuItemView.getInstance({
                        model : extension
                    });

                    fragment.appendChild(menuItemView.render().$el[0]);
                });

                if (FunctionSwitch.ENABLE_DORAEMON) {
                    fragment.appendChild(GallerySwitchView.getInstance().render().$el[0]);
                }

                this.$el.append(fragment);
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
