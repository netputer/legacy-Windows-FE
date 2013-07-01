/*global define*/
(function (window, undefined) {
    define([
        'backbone',
        'underscore',
        'jquery',
        'utilities/QueryString',
        'Internationalization',
        'Environment',
        'Configuration',
        'WindowController',
        'main/views/PIMMenuView',
        'main/collections/PIMCollection',
        'doraemon/views/DoraemonMenuView',
        'doraemon/collections/ExtensionsCollection',
        'browser/views/BrowserModuleView'
    ], function (
        Backbone,
        _,
        $,
        QueryString,
        i18n,
        Environment,
        CONFIG,
        WindowController,
        PIMMenuView,
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

                    WindowController.navigationState();
                }, this);

                doraemonMenuView.on('welcomeItemSelected', function () {
                    extensionsCollection.deselectAll();
                    pimCollection.deselectAll();
                });

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

                this.$el.prepend(pimMenuView.render().$el);
                this.$el.prepend(doraemonMenuView.render().$el);

                setTimeout(function () {
                    var jumpToDefaultExtension = function (id) {
                        var selectDefaultExtension = function (extensionsCollection) {
                            if (window.SnapPea.CurrentModule === undefined) {
                                var extension;
                                if (id === undefined) {
                                    extension = extensionsCollection.at(0);
                                    if (extension !== undefined) {
                                        extension.set({
                                            selected : true
                                        });
                                    }
                                } else {
                                    extension = extensionsCollection.get(id);
                                    if (extension !== undefined) {
                                        extension.set({
                                            selected : true
                                        });
                                    } else {
                                        BrowserModuleView.navigateToThirdParty(id, '');
                                    }
                                }
                            }
                        };

                        var refreshHandler = function (extensionsCollection) {
                            if (extensionsCollection.length !== 0) {
                                selectDefaultExtension(extensionsCollection);
                                extensionsCollection.off('refresh', refreshHandler);
                            }
                        };

                        if (extensionsCollection.loading) {
                            extensionsCollection.on('refresh', refreshHandler);
                        } else {
                            if (extensionsCollection.length === 0) {
                                extensionsCollection.on('refresh', refreshHandler);
                            } else {
                                selectDefaultExtension(extensionsCollection);
                            }
                        }
                    };

                    if (!redirectExtId) {
                        if (Environment.get('deviceId') === 'Default') {
                            doraemonMenuView.selectWelcome();
                        } else {
                            if (defaultModule !== undefined && pimCollection.get(defaultModule)) {
                                pimCollection.get(defaultModule).set({
                                    selected : true
                                });
                            } else {
                                doraemonMenuView.selectWelcome();
                            }
                        }
                    } else {
                        jumpToDefaultExtension(redirectExtId);
                    }

                    toggleShadow.call(this);
                }.bind(this), 0);

                return this;
            },
            deselectAll : function () {
                pimCollection.deselectAll();
                extensionsCollection.deselectAll();
                doraemonMenuView.deselectWelcome();
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
