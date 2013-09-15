/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'Configuration',
        'Environment',
        'Device',
        'Log'
    ], function (
        Backbone,
        _,
        CONFIG,
        Environment,
        Device,
        log
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
                if (this.data.singleFeedCursor === 0) {
                    resp.feeds.unshift({
                        type : 99
                    });
                    resp.feeds.unshift({
                        type : 98
                    });
                }

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

                log({
                    'event' : 'debug.welcome_feed_load',
                    'totalFeedCursor' : this.data.totalFeedCursor,
                    'singleFeedCursor' : this.data.singleFeedCursor
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
                        if (Environment.get('locale') === CONFIG.enums.LOCALE_EN_US) {
                            this.snapPeaFetch();
                            return;
                        }
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
            },
            snapPeaFetch : function () {
                this.set([
                    { type : 100 },
                    { type : 101 },
                    { type : 102 },
                    { type : 103 },
                    { type : 104 },
                    { type : 105 }
                ]);

                setTimeout(function () {
                    this.loading = false;
                    this.finish = true;

                    this.trigger('refresh', this);
                }.bind(this));
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
