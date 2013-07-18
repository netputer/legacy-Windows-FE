/*global define*/
(function (windows) {
    define([
        'backbone',
        'underscore',
        'Configuration',
        'Device'
    ], function (
        Backbone,
        _,
        CONFIG,
        Device
    ) {
        console.log('FeedsCollection - File loaded. ');

        var FeedsCollection = Backbone.Collection.extend({
            url : CONFIG.actions.WELCOME_FEEDS,
            data : {
                totalFeedCursor : 0,
                singleFeedCursor : 0,
                max : 30,
                udid : ''
            },
            parse : function (resp) {
                this.data.totalFeedCursor = resp.totalFeedCursor;
                this.data.singleFeedCursor = resp.singleFeedCursor;

                this.finish = resp.feeds.length === 0;

                _.each(resp.feeds, function (feed) {
                    var list = [20, 21, 22, 23, 24, 25];
                    if (list.indexOf(feed.type) >= 0) {
                        _.each(feed.items, function (item) {
                            if (item.tagline === 'null') {
                                item.tagline = '';
                            }
                        });
                    }
                });
                return resp.feeds;
            },
            initialize : function () {
                var loading = false;
                var finish = false;
                Object.defineProperties(this, {
                    loading : {
                        set : function (value) {
                            loading = Boolean(value);
                        },
                        get : function () {
                            return loading;
                        }
                    },
                    finish : {
                        set : function (value) {
                            finish = Boolean(value);
                        },
                        get : function () {
                            return finish;
                        }
                    }
                });

                if (Device.get('udid')) {
                    this.data.udid = Device.get('udid');
                } else {
                    this.listenToOnce(Device, 'change:udid', function (Device, udid) {
                        this.data.udid = udid;
                    });
                }

                this.on('update', function () {
                    loading = true;
                    if (!this.finish) {
                        var doFetch = function () {
                            this.fetch({
                                success : function (collection) {
                                    loading = false;
                                    collection.trigger('refresh', collection);
                                },
                                error : function (collection) {
                                    loading = false;
                                    collection.trigger('refresh', collection);
                                }
                            }, {
                                reset : true
                            });
                        };
                        if (this.data.udid) {
                            doFetch.call(this);
                        } else {
                            this.listenToOnce(Device, 'change:udid', function (Device, udid) {
                                this.data.udid = udid;
                                doFetch.call(this);
                            });
                        }
                    }
                }, this);
            }
        });

        var feedsCollection;

        var factory = _.extend({
            getInstance : function () {
                if (!feedsCollection) {
                    feedsCollection = new FeedsCollection();
                    feedsCollection.trigger('update');
                }
                return feedsCollection;
            }
        });

        return factory;
    });
}(this));
