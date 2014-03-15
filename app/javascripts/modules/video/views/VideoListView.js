/*global define*/
(function (window, document) {
    define([
        'underscore',
        'backbone',
        'doT',
        'jquery',
        'Configuration',
        'Internationalization',
        'IOBackendDevice',
        'Account',
        'ui/TemplateFactory',
        'ui/WindowState',
        'ui/MouseState',
        'ui/KeyboardHelper',
        'Device',
        'video/views/VideoThreadView',
        'video/VideoService',
        'utilities/FormatDate',
        'browser/views/BrowserModuleView',
        'Log'
    ], function (
        _,
        Backbone,
        doT,
        $,
        CONFIG,
        i18n,
        IO,
        Account,
        TemplateFactory,
        WindowState,
        MouseState,
        KeyboardHelper,
        Device,
        VideoThreadView,
        VideoService,
        formatdate,
        BrowserModuleView,
        log
    ) {
        console.log('VideoListView -File loaded. ');

        var VideoListView = Backbone.View.extend({
            className : 'w-media-gallery',
            template : doT.template(TemplateFactory.get('video', 'video-list')),
            initialize : function () {
                var subView = [];
                var threads = [];
                var scrollHandler = _.throttle(function (evt) {
                    this.renderThread();
                    Backbone.trigger('video:list:scroll', evt);
                }.bind(this), 20);
                var loading = false;
                var listLoading = false;
                Object.defineProperties(this, {
                    subView : {
                        get : function () {
                            return subView;
                        }
                    },
                    threads : {
                        set : function (value) {
                            threads = value;
                        },
                        get : function () {
                            return threads;
                        }
                    },
                    scrollHandler : {
                        get : function () {
                            return scrollHandler;
                        }
                    },
                    loading : {
                        get : function () {
                            return loading;
                        },
                        set : function (value) {
                            loading = Boolean(value);
                            if (loading) {
                                this.$el.parent().find('.w-video-loading').css({
                                    'display' : '-webkit-box'
                                });
                            } else {
                                this.$el.parent().find('.w-video-loading').hide();
                            }
                        }
                    },
                    listLoading : {
                        get : function () {
                            return listLoading;
                        },
                        set : function (value) {
                            listLoading = Boolean(value);
                            if (listLoading) {
                                this.$el.parent().find('.w-video-list-loading').show();
                            } else {
                                this.$el.parent().find('.w-video-list-loading').hide();
                            }
                        }
                    }
                });
                this.listenTo(this.collection, 'refresh', function (collection) {
                    _.each(this.subView, function (view) {
                        view.remove();
                    });
                    this.subView.length = 0;
                    this.buildList(collection);
                });

                this.listenTo(this.collection, 'syncStart update syncEnd refresh', function () {
                    this.listLoading = this.collection.loading || this.collection.syncing;
                });

                this.listenTo(Backbone, 'video.loadingStart', function () {
                    this.loading = true;
                });

                this.listenTo(Backbone, 'video.loadingEnd', function () {
                    this.loading = false;
                });

                this.listenTo(Backbone, 'video.loadingUpdate', function (percent) {
                    this.$el.parent().find('.w-video-loading-percent').html(percent.current + '%');
                });

                KeyboardHelper.on('keydown', this.keyDown.bind(this));

                this.listenTo(this.collection, 'remove', _.debounce(function () {
                    if (this.collection.length > 0) {
                        this.renderThread();
                    } else {
                        this.toggleEmptyTip(true);
                    }
                }));

                this.listenTo(Device, 'change:hasSDCard change:hasEmulatedSD', _.debounce(function () {
                    if (!Device.get('hasSDCard') && !Device.get('hasEmulatedSD')) {
                        this.collection.set([]);
                        this.collection.trigger('refresh', this.collection);
                    } else {
                        this.collection.trigger('update');
                    }
                }));

                this.listenTo(Device, 'change:isFastADB', function (device, isFastADB) {
                    if (this.collection.loading || this.collection.syncing || isFastADB) {
                        this.$('.empty-tip').toggle(false);
                        return;
                    }
                });
            },
            toggleEmptyTip : function (toggle) {
                if (typeof toggle !== 'boolean') {
                    return;
                }

                var $emptyTip = this.$('.empty-tip');
                if (toggle) {

                    log({
                        'event' : 'ui.show.wanxiaodou',
                        'type' : 'video'
                    });

                    if (Device.get('isConnected') && !Device.get('hasSDCard') && !Device.get('hasEmulatedSD')) {
                        $emptyTip.html(
                            doT.template(TemplateFactory.get('misc', 'wanxiaodou'))({}) + i18n.misc.NO_SD_CARD_TIP_TEXT
                        );
                    } else {
                        $emptyTip.html(
                            doT.template(TemplateFactory.get('misc', 'wanxiaodou'))({}) + i18n.video.NO_VIDEOS_TEXT
                        );
                    }
                }
                $emptyTip.toggle(toggle);
            },
            remove : function () {
                _.each(this.subView, function (view) {
                    view.remove();
                });
                this.subView.length = 0;
                this.$el.off('scroll', this.scrollHandler);
                VideoListView.__super__.remove.call(this);
            },
            buildList : function (collection) {
                if (!collection) {
                    return;
                }

                var group = collection.groupBy(function (item) {
                    return Number(formatdate('yyyy0MM', item.get('date_added')));
                });

                this.threads = _.sortBy(group, function (item, key) {
                    return -Number(key);
                });

                if (!collection.loading && !collection.syncing) {
                    this.toggleEmptyTip(collection.length === 0);
                }

                if (this.collection.length !== 0) {
                    this.toggleEmptyTip(false);
                    this.renderThread();
                }
            },
            renderThread : function () {
                if (this.spyIsSawn()) {
                    var date, thread, videoThreadView;

                    for (date in this.threads) {
                        if (this.threads.hasOwnProperty(date)) {
                            thread = this.threads[date];
                            videoThreadView = new VideoThreadView.getInstance({
                                models : thread,
                                $ctn : this.$el
                            });
                            this.$('.spy').before(videoThreadView.render().$el);
                            videoThreadView.getThumbsAsync();
                            this.subView.push(videoThreadView);
                            delete this.threads[date];

                            if (!this.spyIsSawn()) {
                                break;
                            }
                        }
                    }
                }
            },
            spyIsSawn : function () {
                return this.$('.spy')[0].offsetTop <= Math.max(this.$el.height() + this.$el[0].scrollTop + 140, 0);
            },
            render : function () {
                this.$el.html(this.template({}));
                if (!this.collection.loading && !this.collection.syncing) {
                    setTimeout(function () {
                        this.buildList(this.collection);
                    }.bind(this), 0);
                }
                this.$el.on('scroll', this.scrollHandler);

                this.listLoading = this.collection.loading || this.collection.syncing;
                this.listenTo(WindowState, 'resize', this.renderThread);
                return this;
            },
            keyDown : function (e) {
                if (e.which === KeyboardHelper.Mapping.ESC) {
                    VideoService.cancelPlayVideo();
                }
            },
            startDraw : function () {
                var $mask = this.$('.mask');
                if ($mask.length > 0 && (WindowState.width - MouseState.x > 20) && this.collection.length > 0) {
                    var startPostiton = {
                        x : MouseState.x,
                        y : MouseState.y + this.$el[0].scrollTop
                    };
                    var ctnOffset =  {
                        left : this.$el.offset().left,
                        top : this.$el.offset().top
                    };

                    $mask.show().css({
                        left : startPostiton.x - ctnOffset.left,
                        top : startPostiton.y - ctnOffset.top
                    });

                    var clientWidth = this.$el[0].clientWidth + 190;

                    var moveHandler = function (MouseState) {
                        if (MouseState.x < startPostiton.x) {
                            $mask.css('left', MouseState.x - ctnOffset.left);
                        } else {
                            $mask.css('left', startPostiton.x - ctnOffset.left);
                        }

                        var scrollTop = this.$el[0].scrollTop;

                        if (MouseState.y + scrollTop < startPostiton.y) {
                            $mask.css('top', MouseState.y + scrollTop - ctnOffset.top);
                        } else {
                            $mask.css('top', startPostiton.y - ctnOffset.top);
                        }

                        $mask.css({
                            width : Math.abs(Math.min(MouseState.x, clientWidth) - startPostiton.x),
                            height : Math.abs(Math.min(MouseState.y + scrollTop, this.$el[0].scrollHeight + ctnOffset.top) - startPostiton.y)
                        });
                    }.bind(this);

                    MouseState.on('mousemove', moveHandler);
                    $(document).one('mouseup', function () {
                        Backbone.trigger('video.item.select', {
                            top : $mask[0].offsetTop,
                            left : $mask[0].offsetLeft,
                            height : $mask[0].offsetHeight,
                            width : $mask[0].offsetWidth
                        });
                        $mask.hide().css({
                            height : 0,
                            width : 0
                        });
                        MouseState.off('mousemove', moveHandler);
                    }.bind(this));
                }

            },
            clickButtonDownload : function () {

                log({
                    'event' : 'ui.click.wanxiaodou_download',
                    'type' : 'video'
                });

                IO.sendCustomEventsAsync(CONFIG.events.WEB_NAVIGATE, {type: CONFIG.enums.NAVIGATE_TYPE_GALLERY, id: 258});
            },
            events : {
                'mousedown' : 'startDraw',
                'click .button-download-video' : 'clickButtonDownload'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new VideoListView(args);
            }
        });

        return factory;
    });
}(this, this.document));
