/*global define*/
(function (window) {
    'use strict';

    define([
        'backbone',
        'jquery',
        'underscore',
        'IO',
        'Environment',
        'Configuration',
        'Account',
        'Device',
        'utilities/StringUtil',
        'app/models/AppModel',
        'app/collections/AppsCollection'
    ], function (
        Backbone,
        $,
        _,
        IO,
        Environment,
        CONFIG,
        Account,
        Device,
        StringUtil,
        AppModel,
        AppsCollection
    ) {
        console.log('WebAppsCollection - File loaded.');

        var appsCollection;

        var WebAppsCollection = Backbone.Collection.extend({
            model : AppModel,
            url : CONFIG.actions.APP_SHOW_WEB_APPS,
            isWeb : true,
            initialize : function () {
                var loading = false;
                var syncing = false;

                Object.defineProperties(this, {
                    loading : {
                        set : function (value) {
                            loading = value;
                        },
                        get : function () {
                            return loading;
                        }
                    },
                    syncing : {
                        set : function (value) {
                            syncing = value;
                        },
                        get : function () {
                            return syncing;
                        }
                    }
                });

                appsCollection = appsCollection || AppsCollection.getInstance();

                this.on('update', function () {
                    if (!loading) {
                        loading = true;
                        this.fetch({
                            success : function (collection) {
                                console.log('WebAppsCollection - Collection fetched.');
                                loading = false;
                                collection.trigger('refresh', collection);
                            }
                        });
                    }
                }, this);

                IO.Backend.onmessage({
                    'data.channel' : CONFIG.events.WEB_APP_LIST_UPDATED
                }, function (data) {
                    if (syncing) {
                        syncing = false;
                        this.trigger('syncEnd');
                    }
                    if (!!data) {
                        this.trigger('update');
                    } else {
                        this.trigger('refresh', this);
                    }
                }, this);

                IO.Backend.onmessage({
                    'data.channel' : CONFIG.events.APP_INSTALL_SUCCESS
                }, function (data) {
                    var target = this.find(function (app) {
                        return app.id === data.packageName;
                    });

                    if (target !== undefined) {
                        var refreshHandler = function (appsCollection) {
                            if (appsCollection.get(target.id) !== undefined) {
                                appsCollection.off('refresh', refreshHandler);

                                target.set(this.convertAppToWebApp(target).toJSON());
                            }
                        };
                        appsCollection.on('refresh', refreshHandler, this);
                    }
                }, this);

                this.listenTo(Account, 'change:isLogin', function (Account, isLogin) {
                    if (isLogin) {
                        this.trigger('update');
                    } else {
                        this.set([]);
                        this.trigger('refresh', this);
                    }
                }).listenTo(appsCollection, 'add remove', _.debounce(function () {
                    this.trigger('update');
                })).on('sort', function () {
                    this.models = this.models.sort(function (a, b) {
                        var flag;
                        if (a.get('update') === b.get('update')) {
                            flag = a.get('base_info').name.localeCompare(b.get('base_info').name);
                        } else {
                            flag = a.get('update') - b.get('update');
                        }
                        return flag;
                    });
                }, this);
            },
            comparator : function (a, b) {
                var flag;
                if (a.get('update') === b.get('update')) {
                    flag = a.get('base_info').name.localeCompare(b.get('base_info').name);
                } else {
                    flag = a.get('update') - b.get('update');
                }
                return flag;
            },
            parse : function (resp) {
                if (resp.state_code !== 200 && resp.state_code !== 202) {
                    return [];
                }

                if (resp.state_code === 202) {
                    console.log('WebAppsCollection - App is syncing.');
                    this.syncing = true;
                    this.trigger('syncStart');
                }

                var webAppList = [];
                _.each(resp.body.app, function (item) {
                    webAppList.push(this.convertAppToWebApp(item));
                }, this);

                return webAppList;
            },
            convertAppToWebApp : function (app) {
                var existApp = appsCollection.get(app.packageName);
                if (existApp) {
                    return existApp.set({
                        isWeb : false
                    });
                }

                var webApp = {
                    id : app.packageName,
                    detail_page_info : app.detailUrl,
                    upgrade_info : {},
                    downloadInfo : {
                        downloadUrl : app.downloadUrl,
                        iconPath : app.iconPath,
                        title : app.title,
                        packageName : app.packageName
                    },
                    base_info : {
                        package_name : app.packageName,
                        name : app.title,
                        version_name : app.versionName.replace(/^v|V/, ''),
                        icon : app.iconPath,
                        apk_size : app.size
                    },
                    running : false
                };

                _.extend(webApp, {
                    installed : false,
                    isWeb : true
                });

                return webApp;
            },
            syncAsync : function () {
                var deferred = $.Deferred();

                this.syncing = true;
                this.trigger('syncStart');

                IO.requestAsync({
                    url : CONFIG.actions.APP_SYNC_WEB_APPS,
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('WebAppsCollection - App sync success.');

                            deferred.resolve(resp);
                        } else {
                            console.error('WebAppsCollection - App sync failed. Error info: ' + resp.state_line);

                            deferred.reject(resp);
                        }
                    }
                });

                return deferred.promise();
            },
            getAll : function () {
                return this.models;
            }
        });

        var webAppsCollection;

        var factory = _.extend({
            getInstance : function () {
                if (!webAppsCollection) {
                    webAppsCollection = new WebAppsCollection();

                    if (Device.get('isUSB')) {
                        webAppsCollection.trigger('update');
                    } else {
                        Device.once('change:isUSB', function (Device, isUSB) {
                            if (isUSB) {
                                webAppsCollection.trigger('update');
                            }
                        });
                    }
                }
                return webAppsCollection;
            }
        });

        return factory;
    });
}(this));
