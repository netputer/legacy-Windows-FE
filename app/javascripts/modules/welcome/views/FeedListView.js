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
        'welcome/views/AppCardView',
        'welcome/views/VideoCardView',
        'welcome/views/EBookCardView',
        'welcome/views/BannerCardView',
        'welcome/views/BackupCardView',
        'welcome/views/TipsCardView',
        'welcome/views/ChangelogCardView',
        'welcome/views/CloudPhotoCardView',
        'welcome/views/WeiboCardView',
        'welcome/views/UpdateCardView',
        'welcome/views/XibaibaiCardView',
        'welcome/views/TiebaCardView',
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
        AppCardView,
        VideoCardView,
        EBookCardView,
        BannerCardView,
        BackupCardView,
        TipsCardView,
        ChangelogCardView,
        CloudPhotoCardView,
        WeiboCardView,
        UpdateCardView,
        XibaibaiCardView,
        TiebaCardView,
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

                var createDiversonCard = function (feedName) {

                    var lastShownTimestamp;
                    var targetView;
                    var show;

                    switch (feedName) {
                    case 'UpdateFeed':
                        targetView = UpdateCardView;
                        break;
                    case 'BackupLocalFeed':
                        targetView = BackupCardView;
                        break;
                    case 'TipsFeed':
                        targetView = TipsCardView;
                        break;
                    case 'ChangeLogFeed':
                        if (Settings.get('latestVersion') !== Environment.get('backendVersion')) {
                            targetView = ChangelogCardView;
                        }
                        break;
                    case 'CloudPhotoFeed':
                        lastShownTimestamp = Settings.get('welcome_feed_cloud_photo_show') || 1;
                        show = !Settings.get('welcome_feed_cloud_photo') && (new Date().getTime() - lastShownTimestamp > 7 * 24 * 60 * 60 * 1000 );
                        if (show) {
                            targetView = CloudPhotoCardView;
                        }
                        break;
                    case 'WeiBoFeed':
                        if (Settings.get('welcome_feed_weibo') ||
                                randomDisplaySocialCard === CONFIG.enums.WELCOME_WEIBO_CARD) {
                            targetView = WeiboCardView;
                        }
                        break;
                    case 'TieBaFeed':
                        if (Settings.get('welcome_feed_tieba') ||
                                randomDisplaySocialCard === CONFIG.enums.WELCOME_TIEBA_CARD) {
                            targetView = TiebaCardView;
                        }
                        break;
                    case 'XiBaiBaiFeed':
                        lastShownTimestamp = Settings.get('welcome-card-xibaibai-show') || 1;
                        show = StringUtil.formatDate('yyyy/MM/dd') !== StringUtil.formatDate('yyyy/MM/dd', lastShownTimestamp);
                        if (show) {
                            targetView = XibaibaiCardView;
                        }
                        break;
                    }

                    return targetView;
                };

                collection.on('refresh', function (collection) {
                    var fragment = document.createDocumentFragment();
                    var show;
                    var logData;

                    collection.each(function (feed) {
                        var targetView;
                        var type = feed.get('feedItemType');

                        switch(type) {
                        case 'APP':
                            targetView = AppCardView;
                            break;
                        case 'VIDEO':
                            targetView = VideoCardView;
                            break;
                        case 'EBOOK':
                            targetView = EBookCardView;
                            break;
                        case 'BANNER':
                            targetView = BannerCardView;
                            break;
                        case "WINDOWS_DIVERSION":
                            targetView = createDiversonCard(feed.get('feedName'));
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

