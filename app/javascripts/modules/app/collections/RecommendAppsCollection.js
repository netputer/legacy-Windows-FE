/*global define*/
(function (window) {
    'use strict';

    define([
        'backbone',
        'underscore',
        'Configuration',
        'Device',
        'app/models/RecommendAppModel'
    ], function (
        Backbone,
        _,
        CONFIG,
        Device,
        RecommendAppModel
    ) {
        console.log('RecommendAppsCollection - File loaded.');

        var RecommendAppsCollection = Backbone.Collection.extend({
            url : CONFIG.actions.APP_GET_RECOMMEND,
            model : RecommendAppModel,
            data : {},
            initialize : function () {
                var loading = false;
                Object.defineProperties(this, {
                    loading : {
                        set : function (value) {
                            loading = value;
                        },
                        get : function () {
                            return loading;
                        }
                    }
                });

                this.on('update', function () {
                    if (!loading) {
                        loading = true;
                        this.fetch({
                            success : function (collection) {
                                console.log('RecommendAppsCollection - Collection fetched.');
                                collection.trigger('refresh', collection);
                            },
                            error : function () {
                                this.trigger('updateFailed');
                            },
                            remove : true
                        });
                    }
                }, this);
            },
            parse : function (resp) {
                var result = [];

                if (resp.body && resp.body.item) {
                    result = resp.body.item;
                }

                return result;
            },
            getCommonApps : function () {
                return this.filter(function (app) {
                    return !app.get('isCampaign');
                });
            },
            getCampaignApps : function () {
                return this.filter(function (app) {
                    return app.get('isCampaign');
                });
            }
        });


        var factory = _.extend({
            getInstance : function (pos, packageName) {

                var listenHandler;
                var events = 'change:isConnected change:isSameWifi';

                var recommendAppsCollection = new RecommendAppsCollection();

                if (packageName) {
                    recommendAppsCollection.data.package_name = packageName;
                }

                recommendAppsCollection.data.pos = pos;

                if (window.SnapPea.isPimEnabled) {
                    recommendAppsCollection.trigger('update');
                } else {
                    listenHandler = function (Device) {
                        if (window.SnapPea.isPimEnabled) {
                            this.trigger('update');
                            this.stopListening(this, events, listenHandler);
                        }
                    };

                    recommendAppsCollection.listenTo(Device, events, listenHandler);
                }

                return recommendAppsCollection;
            }
        });

        return factory;
    });
}(this));
