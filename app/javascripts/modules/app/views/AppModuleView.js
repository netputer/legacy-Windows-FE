/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'Log',
        'ui/TemplateFactory',
        'utilities/StringUtil',
        'app/views/AppModuleToolbarView',
        'app/views/AppListView',
        'app/views/AppPanelView',
        'app/collections/AppsCollection'
    ], function (
        Backbone,
        _,
        doT,
        log,
        TemplateFactory,
        StringUtil,
        AppModuleToolbarView,
        AppListView,
        AppPanelView,
        AppsCollection
    ) {
        console.log('AppModuleMainView - File loaded.');

        var setInterval = window.setInterval;
        var clearInterval = window.clearInterval;

        var appListView;
        var appPanelView;

        var AppModuleMainView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('app', 'app-main')),
            className : 'w-app-module-main module-main vbox',
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
                this.$el.html(this.template({}));

                this.$el.prepend(AppModuleToolbarView.getInstance().render().$el);

                appListView = AppListView.getInstance();
                appPanelView = AppPanelView.getInstance();

                this.$('.w-app-ctn').append(appListView.render().$el)
                                    .append(appPanelView.render().$el);

                this.rendered = true;

                return this;
            }
        });

        var appModuleMainView;

        var factory = _.extend({
            enablePreload : false,
            getInstance : function (tab) {
                if (!appModuleMainView) {
                    appModuleMainView = new AppModuleMainView();

                    if (tab !== undefined && tab !== 'normal') {
                        setTimeout(function () {
                            Backbone.trigger('switchModule', {
                                module : 'app',
                                tab : tab
                            });
                        }, 0);
                    }
                }

                return appModuleMainView;
            },
            preload : function () {
                AppsCollection.getInstance().trigger('update');
            },
            showWebAppView : function () {
                Backbone.trigger('switchModule', {
                    module : 'app',
                    tab : 'web'
                });
            },
            navigateGroup : function (msg) {
                Backbone.trigger('switchModule', {
                    module : 'app',
                    tab : 'normal'
                });

                var filterSearch = function () {
                    appListView.showAppsByKeyword(msg.keyword);
                };

                if (appListView) {
                    filterSearch();
                } else {
                    var delegate = setInterval(function () {
                        if (appListView) {
                            clearInterval(delegate);
                            filterSearch();
                        }
                    }, 10);
                }
            },
            navigate : function (msg) {
                Backbone.trigger('switchModule', {
                    module : 'app',
                    tab : 'all'
                });

                var appsCollection = AppsCollection.getInstance();

                var highlightSearch = function () {
                    var highlight = function () {
                        var target = appsCollection.get(msg.id);
                        var newEvt;
                        if (target.isSystem) {
                            newEvt = {
                                module : 'app',
                                tab : 'sys'
                            };
                        } else {
                            newEvt = {
                                module : 'app',
                                tab : 'normal'
                            };
                        }

                        setTimeout(function () {
                            Backbone.trigger('switchModule', newEvt);
                            appListView.highlight(target);
                        });
                    };
                    if (!appsCollection.loading && !appsCollection.syncing) {
                        highlight();
                    } else {
                        var refreshHandler = function (appsCollection) {
                            highlight();
                        };
                        appsCollection.once('refresh', refreshHandler);
                    }
                };

                if (appListView) {
                    highlightSearch();
                } else {
                    var delegate = setInterval(function () {
                        if (appListView) {
                            clearInterval(delegate);
                            highlightSearch();
                        }
                    }, 10);
                }
            }
        });

        return factory;
    });
}(this));
