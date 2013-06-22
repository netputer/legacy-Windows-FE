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

        var WelcomeItemView = {
            view : Backbone.View.extend({
                template: doT.template(TemplateFactory.get('doraemon', 'welcome-item')),
                initialize: function () {
                    Backbone.on('switchModule', function (data) {
                        if (data.module !== 'welcome') {
                            this.$el.find('li').removeClass('selected highlight');
                            this.selected = false;
                        }
                    }.bind(this));
                },
                selected : false,
                render: function () {
                    this.$el.html(this.template({}));
                    if (this.selected) {
                        this.$el.find('li').addClass('selected highlight');
                    }
                    return this;
                },
                clickItem : function () {
                    this.setSelected(true);
                },
                setSelected : function (selected) {
                    this.selected = selected;
                    if (selected) {
                        this.$el.find('li').addClass('selected highlight');
                        this.trigger('itemSelected');

                        Backbone.trigger('switchModule', {
                            module : 'welcome',
                            tab : 'welcome'
                        });
                    } else {
                        this.$el.find('li').removeClass('selected highlight');
                    }
                },
                events : {
                    'click' : 'clickItem'
                }
            }),
            getInstance : function () {
                return new this.view();
            }
        };

        var extensionsCollection;

        var DoraemonMenuView = Backbone.View.extend({
            className : 'w-menu-doraemon',
            template : doT.template(TemplateFactory.get('doraemon', 'menu')),
            initialize : function () {

                var welcomeItem;
                var selectedWelcome = false;
                Object.defineProperties(this, {
                    welcomeItem : {
                        set : function (value) {
                            welcomeItem = value;
                        },
                        get : function () {
                            return welcomeItem;
                        }
                    },
                    selectedWelcome : {
                        set : function (value) {
                            selectedWelcome = value;
                        },
                        get : function () {
                            return selectedWelcome;
                        }
                    }
                });

                Backbone.on('switchModule', function (data) {
                    if (data.module !== 'welcome') {
                        this.selectedWelcome = false;
                    }
                }, this);

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

                if (this.welcomeItem) {
                    this.stopListening(this.welcomeItem, 'itemSelected');
                    this.welcomeItem.remove();
                }

                var $menuCtn = this.$('.w-sidebar-menu').empty();

                this.welcomeItem = WelcomeItemView.getInstance();
                this.listenTo(this.welcomeItem, 'itemSelected', function () {
                    this.trigger('welcomeItemSelected');
                });
                if (this.selectedWelcome) {
                    this.welcomeItem.setSelected(true);
                }

                var fragment = document.createDocumentFragment();
                fragment.appendChild(this.welcomeItem.render().$el[0]);
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

                return this;
            },
            deselectWelcome : function () {
                if (this.welcomeItem) {
                    this.welcomeItem.setSelected(false);
                }
                this.selectedWelcome = false;
            },
            selectWelcome : function () {
                if (this.welcomeItem) {
                    this.welcomeItem.setSelected(true);
                }
                this.selectedWelcome = true;
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
