/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'jquery',
        'doT',
        'ui/TemplateFactory',
        'utilities/QueryString',
        'Internationalization',
        'Environment',
        'Configuration',
        'WindowController',
        'main/views/PIMMenuView',
        'main/views/MenuItemView',
        'main/collections/PIMCollection',
        'doraemon/views/DoraemonMenuView',
        'doraemon/collections/ExtensionsCollection',
        'browser/views/BrowserModuleView'
    ], function (
        Backbone,
        _,
        $,
        doT,
        TemplateFactory,
        QueryString,
        i18n,
        Environment,
        CONFIG,
        WindowController,
        PIMMenuView,
        MenuItemView,
        PIMCollection,
        DoraemonMenuView,
        ExtensionsCollection,
        BrowserModuleView
    ) {
        console.log('NavView - File loaded.');

        var setTimeout = window.setTimeout;

        var pimMenuView;
        var doraemonMenuView;
        var pimCollection;
        var extensionsCollection;

        var redirectModule = QueryString.get('redirect_page');
        var redirectExtId = QueryString.get('ext_id');

        var defaultModule;

        if (redirectModule) {
            defaultModule = parseInt(redirectModule, 10);
        }

        var toggleShadow = function () {
            setTimeout(function () {
                var ele = this.$el[0];

                var $shadow = $('.w-menu-shadow');
                var offsetHeight = ele.offsetHeight;
                var scrollHeight = ele.scrollHeight;
                var scrollTop = ele.scrollTop;
                if (scrollHeight !== offsetHeight) {
                    if (scrollTop + offsetHeight === scrollHeight) {
                        $shadow.addClass('w-layout-hide');
                    } else {
                        $shadow.removeClass('w-layout-hide');
                    }
                } else {
                    $shadow.addClass('w-layout-hide');
                }
            }.bind(this), 0);
        };

        var WelcomeItemView = Backbone.View.extend({
            className : 'w-menu-doraemon w-sidebar-menu w-menu-welcome',
            tagName : 'menu',
            render : function () {
                this.$el.html(MenuItemView.getInstance({
                    model : pimCollection.get(0)
                }).render().$el);
                return this;
            }
        });

        var NavView = Backbone.View.extend({
            className : 'w-menu',
            initialize : function () {
                pimMenuView = PIMMenuView.getInstance();
                doraemonMenuView = DoraemonMenuView.getInstance();
                pimCollection = PIMCollection.getInstance();
                extensionsCollection = ExtensionsCollection.getInstance();

                Backbone.on('switchModule', function (data) {
                    if (data.module === 'browser' && data.tab === 'misc') {
                        this.deselectAll();
                    } else if (data.module === 'gallery') {
                        this.deselectAll();
                    }
                }, this);

                pimCollection.on('itemSelected', function () {
                    extensionsCollection.deselectAll();
                });

                extensionsCollection.on('itemSelected', function () {
                    pimCollection.deselectAll();
                });

                extensionsCollection.on('add remove refresh', _.throttle(toggleShadow.bind(this), 50));
                $(window).on('resize', _.throttle(toggleShadow.bind(this), 50));
                this.$el.on('scroll', _.throttle(toggleShadow.bind(this), 50));
            },
            render : function () {
                this.$el.append(new WelcomeItemView({}).render().$el)
                    .append(doraemonMenuView.render().$el)
                    .append(pimMenuView.render().$el);

                setTimeout(function () {
                    if (!redirectExtId) {
                        if (Environment.get('deviceId') === 'Default') {
                            Backbone.trigger('switchModule', {
                                module : 'welcome',
                                tab : 'welcome'
                            });
                        } else {
                            var defaultModuleModel = pimCollection.get(defaultModule);
                            if (defaultModule !== undefined && defaultModuleModel) {
                                Backbone.trigger('switchModule', {
                                    module : defaultModuleModel.get('module'),
                                    tab : defaultModuleModel.get('tab')
                                });
                            } else {
                                Backbone.trigger('switchModule', {
                                    module : 'welcome',
                                    tab : 'welcome'
                                });
                            }
                        }
                    } else {
                        Backbone.trigger('switchModule', {
                            module : 'welcome',
                            tab : 'welcome'
                        });
                    }

                    toggleShadow.call(this);
                }.bind(this), 0);

                return this;
            },
            deselectAll : function () {
                pimCollection.deselectAll();
                extensionsCollection.deselectAll();
            }
        });

        var navView;

        var factory = _.extend({
            getInstance : function () {
                if (!navView) {
                    navView = new NavView();
                }
                return navView;
            }
        });

        return factory;
    });
}(this));
