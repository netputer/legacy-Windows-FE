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

        var TitleView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('doraemon', 'nav-title')),
            className : 'menu-title hbox',
            render : function () {
                this.$el.html(this.template({}));

                this.$('.button-ctn').toggle(FunctionSwitch.ENABLE_DORAEMON);

                var popupTip = new PopupTip({
                    $host : this.$('.button-management')
                });

                return this;
            },
            clickButtonManagement : function (evt) {
                if (!Account.get('isLogin')) {
                    Account.loginAsync(i18n.misc.LOGIN_TO_MANAGE, 'gallery-manage');
                } else {
                    Backbone.trigger('switchModule', {
                        module : 'doraemon'
                    });
                }

                log({
                    'event' : 'ui.click.dora.button_manage',
                    'isLogin' : Account.get('isLogin')
                });
            },
            events : {
                'click .button-management' : 'clickButtonManagement'
            }
        });

        var extensionsCollection;

        var DoraemonMenuView = Backbone.View.extend({
            className : 'w-menu-doraemon',
            template : doT.template(TemplateFactory.get('doraemon', 'menu')),
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

                var $menuCtn = this.$('.w-sidebar-menu').empty();

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

                $menuCtn.append(fragment);
            },
            render : function () {
                this.$el.html(this.template({}));

                if (FunctionSwitch.ENABLE_DORAEMON) {
                    this.$('.w-sidebar-menu').append(GallerySwitchView.getInstance().render().$el);
                }

                var titleView = new TitleView().render();

                this.$el.prepend(titleView.$el);

                titleView.on('showModule', function () {
                    this.trigger('showModule');
                }, this);

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
