/*global define*/
(function (window, undefined) {
    define([
        'jquery',
        'underscore',
        'backbone'
    ], function (
        $,
        _,
        Backbone
    ) {
        console.log('AppsQueryResultCollection - File loaded. ');

        var AppsQueryResultCollection = Backbone.Collection.extend({
            initialize : function () {
                var original = {
                    pirate : 0,
                    ads : 0
                };
                Object.defineProperties(this, {
                    original : {
                        set : function (value) {
                            original = value;
                        },
                        get : function () {
                            return original;
                        }
                    }
                });
            },
            comparator : function (app) {
                return app.get('function').type === 'PIRATE';
            },
            getPirateApps : function () {
                return this.filter(function (app) {
                    return app.get('function').type === 'PIRATE';
                });
            },
            getUpdatableAdsApps : function () {
                return this.filter(function (app) {
                    return app.get('function').type === 'AD' && app.get('candidateApks');
                });
            },
            getUninstallableAdsApps : function () {
                return this.filter(function (app) {
                    return app.get('function').type === 'AD' && !app.get('candidateApks');
                });
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                args = _.filter(args, function (item) {
                    return item['function'].type === 'AD' || item['function'].type === 'PIRATE';
                });
                var appsQueryResultCollection = new AppsQueryResultCollection(args);
                appsQueryResultCollection.original = {
                    pirate : appsQueryResultCollection.getPirateApps().length,
                    ads : appsQueryResultCollection.getUpdatableAdsApps().length + appsQueryResultCollection.getUninstallableAdsApps().length
                };
                return appsQueryResultCollection;
            }
        });

        return factory;
    });
}(this));
