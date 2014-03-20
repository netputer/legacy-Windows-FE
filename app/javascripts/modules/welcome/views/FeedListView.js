/*global define*/
(function (window, document) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'wookmark',
        'Log',
        'Settings',
        'Configuration',
        'utilities/StringUtil',
        'ui/WindowState',
        'app/collections/AppsCollection',
        'welcome/views/UpdateCardView',
        'welcome/views/XibaibaiCardView',
        'welcome/views/SingleCardView',
        'welcome/views/ListCardView',
        'welcome/views/ItemListView',
        'welcome/views/CloudPhotoCardView',
        'welcome/views/BackupCardView',
        'welcome/views/TipsCardView',
        'welcome/views/WeiboCardView',
        'welcome/views/TiebaCardView',
        'welcome/views/ChangelogCardView',
        'welcome/views/SnapPeaWebCardView',
        'welcome/views/SnapPeaPhotosCardView',
        'welcome/views/SnapPeaFeedbackCardView',
        'welcome/views/FacebookCardView',
        'welcome/views/ITunesMoviesCardView',
        'welcome/views/YouTubeCardView',
        'welcome/collections/FeedsCollection'
    ], function (
        Backbone,
        _,
        doT,
        $,
        wookmark,
        log,
        Settings,
        CONFIG,
        StringUtil,
        windowState,
        AppsCollection,
        UpdateCardView,
        XibaibaiCardView,
        SingleCardView,
        ListCardView,
        ItemListView,
        CloudPhotoCardView,
        BackupCardView,
        TipsCardView,
        WeiboCardView,
        TiebaCardView,
        ChangelogCardView,
        SnapPeaWebCardView,
        SnapPeaPhotosCardView,
        SnapPeaFeedbackCardView,
        FacebookCardView,
        ITunesMoviesCardView,
        YouTubeCardView,
        FeedsCollection
    ) {
        console.log('FeedListView - File loaded. ');

        var targetArr = [];
        var wookmarkHandle;

        var initWindowWidth;
        var lastWindowWidth;

        var FeedListView = Backbone.View.extend({
            tagName : 'ul',
            className : 'feed-ctn',
            initialize : function () {

                this.listenTo(windowState, 'resize', function (state){
                    lastWindowWidth = state.width;
                });

                this.listenTo(Backbone, 'showModule', function (name) {
                    if (name === 'welcome' && lastWindowWidth !== initWindowWidth) {
                        initWindowWidth = lastWindowWidth;
                        setTimeout(wookmarkHandle.wookmarkInstance.layout);
                    }
                });
            },
            initFeeds : function () {
                var collection = FeedsCollection.getInstance();
                var fisrtScreen = true;
                var randomDisplaySocialCard = _.random(1);

                collection.on('refresh', function (collection) {
                    var fragment = document.createDocumentFragment();
                    var lastShownTimestamp;
                    var show;
                    var logData;

                    collection.each(function (feed) {
                        var targetView;
                        var type = feed.get('type');
                        switch (type) {
                        case 0:
                        case 1:
                            targetView = SingleCardView;
                            break;
                        case 10:
                        case 11:
                        case 12:
                            targetView = ListCardView;
                            break;
                        case 20:
                        case 21:
                        case 22:
                        case 23:
                        case 24:
                        case 25:
                            targetView = ItemListView;
                            break;
                        case 30:
                            lastShownTimestamp = Settings.get('welcome-card-update-show') || 1;
                            show = StringUtil.formatDate('yyyy/MM/dd') !== StringUtil.formatDate('yyyy/MM/dd', lastShownTimestamp);
                            if (show) {
                                targetView = UpdateCardView;
                            }
                            break;
                        case 31:
                            lastShownTimestamp = Settings.get('welcome-card-xibaibai-show') || 1;
                            show = StringUtil.formatDate('yyyy/MM/dd') !== StringUtil.formatDate('yyyy/MM/dd', lastShownTimestamp);
                            if (show) {
                                targetView = XibaibaiCardView;
                            }
                            break;
                        case 32:
                            if (!Settings.get('welcome_feed_cloud_photo')) {
                                targetView = CloudPhotoCardView;
                            }
                            break;
                        case 33:
                            lastShownTimestamp = Settings.get('welcome-card-backup-show') || Date.now();
                            show = Math.round((Date.now() - lastShownTimestamp) / 1000 / 3600 / 24) > 3;
                            if (show) {
                                targetView = BackupCardView;
                            }
                            break;
                        case 34:
                            if (Settings.get('welcome_feed_tieba') ||
                                    randomDisplaySocialCard === CONFIG.enums.WELCOME_WEIBO_CARD) {
                                targetView = WeiboCardView;
                            }
                            break;
                        case 35:
                            if (Settings.get('welcome_feed_weibo') ||
                                    randomDisplaySocialCard === CONFIG.enums.WELCOME_TIEBA_CARD) {
                                targetView = TiebaCardView;
                            }
                            break;
                        case 98:
                            targetView = ChangelogCardView;
                            break;
                        case 99:
                            if (!Settings.get('welcome_feed_tips')) {
                                targetView = TipsCardView;
                            }
                            break;
                        case 100:
                            targetView = SnapPeaWebCardView;
                            break;
                        case 101:
                            targetView = SnapPeaPhotosCardView;
                            break;
                        case 102:
                            targetView = SnapPeaFeedbackCardView;
                            break;
                        case 103:
                            targetView = FacebookCardView;
                            break;
                        case 104:
                            targetView = ITunesMoviesCardView;
                            break;
                        case 105:
                            targetView = YouTubeCardView;
                            break;
                        }
                        if (targetView !== undefined) {

                            var target = targetView.getInstance({
                                model : feed,
                                parentView : this
                            }).render().$el.toggleClass('flip', !fisrtScreen)[0];

                            fragment.appendChild(target);
                            if (!fisrtScreen) {
                                targetArr.push(target);
                            }

                            logData = {};
                            if (!logData[type]) {
                                logData[type] = 1;
                            } else {
                                logData[type] ++;
                            }
                        }
                    }, this);

                    this.$el.append(fragment);

                    setTimeout(this.initLayout.bind(this));

                    if (fisrtScreen) {
                        fisrtScreen = false;
                    }

                    if (logData) {
                        _.each(logData, function (num, name) {
                            log({
                                'event' : 'ui.show.welcome_card',
                                'type' : name,
                                'num' : num
                            });
                        });
                    }

                }, this);

                return this;
            },
            initLayout : function () {

                initWindowWidth = windowState.width;

                if (wookmarkHandle) {
                    wookmarkHandle.wookmarkInstance.clear();
                }

                wookmarkHandle = this.$('.w-welcome-feed-card:not(.hide)').wookmark({
                    align : 'left',
                    autoResize : true,
                    container : this.$el,
                    itemWidth : 350,
                    offset : 20
                });

                _.each(targetArr, function (target) {
                    $(target).removeClass('flip');
                });
                targetArr = [];
            },
            loadNextPage : function () {
                var collection = FeedsCollection.getInstance();
                if (!collection.loading && !collection.finish) {
                    collection.trigger('update');
                }
            }
        });

        var factory = _.extend({
            getInstance : function () {
                return new FeedListView();
            }
        });

        return factory;
    });
}(this, this.document));
