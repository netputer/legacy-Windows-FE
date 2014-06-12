/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'jquery',
        'doT',
        'ui/TemplateFactory',
        'ui/WindowState',
        'utilities/QueryString',
        'Device',
        'Internationalization',
        'Environment',
        'FunctionSwitch',
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
        WindowState,
        QueryString,
        Device,
        i18n,
        Environment,
        FunctionSwitch,
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

        var lastWindowHeight;
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

        var toggleShadow = function (state) {

            if (state && state.height === lastWindowHeight) {
                lastWindowHeight = state.height;
                return;
            }

            var ele = this.$el[0];
            setTimeout(function () {

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
            }, 0);
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
                this.listenTo(WindowState, 'resize', toggleShadow);
                this.$el.on('scroll', _.throttle(toggleShadow.bind(this), 50));
            },
            render : function () {
                if (!Environment.get('internetBar')) {
                    this.$el.append(new WelcomeItemView().render().$el);
                }
                this.$el.append(doraemonMenuView.render().$el)
                    .append(pimMenuView.render().$el);

                setTimeout(function () {
                    if (!FunctionSwitch.SHOW_FIRST_EXTENSION && !Environment.get('internetBar')) {
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
                    } else {
                        var selectDefault = function () {
                            if (extensionsCollection.length > 0) {
                                var model = extensionsCollection.at(0);
                                model.set('selected', true);
                                BrowserModuleView.navigateToThirdParty(model.id);
                            }
                        };

                        var refreshHandler = function () {
                            if (extensionsCollection.length > 0) {
                                selectDefault.call(this);
                                extensionsCollection.off('refresh', refreshHandler);
                            }
                        };

                        if (extensionsCollection.length > 0) {
                            selectDefault.call(this);
                        } else {
                            extensionsCollection.on('refresh', refreshHandler, this);
                        }

                        if (FunctionSwitch.SHOW_FIRST_EXTENSION_WHEN_CONNECTION_CHANGED) {
                            Device.on('change:isConnected', selectDefault, this);
                        }
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
