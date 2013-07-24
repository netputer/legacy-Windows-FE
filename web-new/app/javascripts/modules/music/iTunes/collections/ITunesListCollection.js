/*global define*/
(function (window) {
    define([
        'underscore',
        'backbone',
        'Configuration',
        'music/iTunes/models/ITunesListModel',
        'music/iTunes/models/ListContextModel'
    ], function (
        _,
        Backbone,
        ITunesListModel,
        ListContextModel
    ) {

        console.log('ItunesListCollection - File loaded');

        var ITunesListCollection = Backbone.Collection.extend({
            model : ITunesListModel,
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
                    itunesListCollection = new ITunesListCollection();
                }

                return itunesListCollection;
            }
        });

        return factory;
    });
}(this));
