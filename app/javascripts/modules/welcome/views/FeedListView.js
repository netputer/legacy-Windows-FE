/*global define*/
(function (window, document) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'wookmark',
        'Settings',
        'utilities/StringUtil',
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
        'welcome/views/ChangelogCardView',
        'welcome/views/SnapPeaWebCardView',
        'welcome/views/SnapPeaPhotosCardView',
        'welcome/views/OneMobileCardView',
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
        Settings,
        StringUtil,
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
        ChangelogCardView,
        SnapPeaWebCardView,
        SnapPeaPhotosCardView,
        OneMobileCardView,
        FacebookCardView,
        ITunesMoviesCardView,
        YouTubeCardView,
        FeedsCollection
    ) {
        console.log('FeedListView - File loaded. ');

        var FeedListView = Backbone.View.extend({
            tagName : 'ul',
            className : 'feed-ctn',
            initFeeds : function () {
                var collection = FeedsCollection.getInstance();

                var fisrtScreen = true;

                collection.on('refresh', function (collection) {
                    var fragment = document.createDocumentFragment();
                    var lastShownTimestamp;
                    var show;

                    collection.each(function (feed) {
                        var targetView;
                        switch (feed.get('type')) {
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
                            show = StringUtil.formatDate('YY/MM/DD') !== StringUtil.formatDate('YY/MM/DD', lastShownTimestamp);
                            if (show) {
                                targetView = UpdateCardView;
                            }
                            break;
                        case 31:
                            lastShownTimestamp = Settings.get('welcome-card-xibaibai-show') || 1;
                            show = StringUtil.formatDate('YY/MM/DD') !== StringUtil.formatDate('YY/MM/DD', lastShownTimestamp);
                            if (show) {
                                targetView = XibaibaiCardView;
                            }
                            break;
                        case 32:
                            targetView = CloudPhotoCardView;
                            break;
                        case 33:
                            targetView = BackupCardView;
                            break;
                        case 34:
                            if (!Settings.get('welcome_feed_weibo')) {
                                targetView = WeiboCardView;
                            }
                            break;
                        case 98:
                            targetView = ChangelogCardView;
                            break;
                        case 99:
                            targetView = TipsCardView;
                            break;
                        case 100:
                            targetView = SnapPeaWebCardView;
                            break;
                        case 101:
                            targetView = SnapPeaPhotosCardView;
                            break;
                        //case 102:
                        //    targetView = OneMobileCardView;
                        //    break;
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
                            fragment.appendChild(targetView.getInstance({
                                model : feed,
                                parentView : this
                            }).render().$el.toggleClass('flip', !fisrtScreen)[0]);
                        }
                    }, this);

                    this.$el.append(fragment);

                    setTimeout(this.initLayout.bind(this));

                    if (fisrtScreen) {
                        fisrtScreen = false;
                    }
                }, this);

                return this;
            },
            initLayout : function () {
                this.$('.w-welcome-feed-card:not(.hide)').wookmark({
                    align : 'left',
                    autoResize : true,
                    container : this.$el,
                    itemWidth : 350,
                    offset : 20
                });

                this.$('.w-welcome-feed-card.flip').removeClass('flip');
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
