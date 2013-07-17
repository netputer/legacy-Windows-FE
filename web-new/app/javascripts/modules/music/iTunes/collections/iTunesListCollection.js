/*global define*/
(function (window, undefined) {
    define([
        'underscore',
        'backbone',
        'jquery',
        'IO',
        'Configuration',
        'Log',
        'music/iTunes/models/iTunesListModel',
        'music/iTunes/models/ListContextModel',
        'utilities/StringUtil'
    ], function (
        _,
        Backbone,
        $,
        IO,
        CONFIG,
        log,
        iTunesListModel,
        ListContextModel,
        StringUtil
    ) {

        console.log('ItunesListCollection - File loaded');

        var iTunesListCollection = Backbone.Collection.extend({
            model : iTunesListModel,
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

                this.on('update', function () {
                    this.set(ListContextModel.get('play_lists'));
                    setTimeout(function () {
                        this.trigger('refresh', this);
                    }.bind(this), 0);
                }, this);
            },
            parse : function (lists) {
                return lists;
            },
            getAll : function () {
                return this.models;
            }
        });

        var itunesListCollection;
        var factory = _.extend({
            getInstance : function () {
                if (!itunesListCollection) {
                    itunesListCollection = new iTunesListCollection();
                }

                return itunesListCollection;
            }
        });

        return factory;
    });
}(this));
