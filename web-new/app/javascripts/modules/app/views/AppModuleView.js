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
        'app/collections/AppsCollection',
        'main/collections/PIMCollection'
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
        AppsCollection,
        PIMCollection
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
                PIMCollection.getInstance().get(3).set({
                    selected : true
                });

                setTimeout(function () {
                    Backbone.trigger('switchModule', {
                        module : 'app',
                        tab : 'web'
                    });
                }, 0);
            },
            navigate : function (msg) {
                PIMCollection.getInstance().get(3).set({
                    selected : true
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
                        }, 0);
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
