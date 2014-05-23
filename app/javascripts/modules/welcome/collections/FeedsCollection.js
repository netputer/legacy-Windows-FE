/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'Configuration',
        'Environment',
        'Device',
        'Log',
        'utilities/JSONParser'
    ], function (
        Backbone,
        _,
        CONFIG,
        Environment,
        Device,
        log,
        JSONParser
    ) {
        console.log('FeedsCollection - File loaded. ');

        var totalFeedCursor = 0;

        var FeedsCollection = Backbone.Collection.extend({
            url : CONFIG.actions.WELCOME_FEEDS,
            data : {
                ch : Environment.get('source'),
                max : 30,
                start : 0,
                platform : 'windows',
                launchedCount : Settings.get(CONFIG.enums.LAUNCH_TIME_KEY)
            },
            parse : function (cards) {

                return _.map(cards, function (card) {
                    var model = card.feedItem;
                    model.feedItemType = card.feedItemType;
                    model.feedName = card.feedName;
                    model.template = card.template;
                    model.feedId = card.id;
                    return model;
                });
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
                                success : function (collection, resp) {

                                    collection.data.start += collection.data.max + 1;

                                    JSONParser.parse(resp, function (data) {

                                        var cards = data.cards;

                                        if (cards.length < this.data.max) {
                                            this.finish = true;
                                        }

                                        this.set(cards, {
                                            parse : true
                                        });

                                        loading = false;
                                        this.trigger('refresh', this);

                                        totalFeedCursor += this.data.max;
                                        log({
                                            'event' : 'debug.welcome_feed_load',
                                            'totalFeedCursor' : totalFeedCursor
                                        });

                                    }, collection);
                                },
                                error : function (collection) {
                                    loading = false;
                                    collection.trigger('refresh', collection);
                                },
                                parse : false,
                                reset : true
                            });
                        };
                        if (navigator.language !== CONFIG.enums.LOCALE_ZH_CN) {
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
                    { feedItemType : 100, feedName : 'snappea-web'},
                    { feedItemType : 103, feedName : 'snappea-facebook'},
                    { feedItemType : 101, feedName : 'snappea-photos'},
                    { feedItemType : 102, feedName : 'snappea-feedback'}
                    // { feedItemType : 104, feedName : 'snappea-itunes'}
                    // { feedItemType : 105, feedname : 'snappea-youtube'}
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
