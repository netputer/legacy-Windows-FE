/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'DB',
        'ui/TemplateFactory',
        'FunctionSwitch',
        'IOBackendDevice',
        'Configuration',
        'Internationalization',
        'Device',
        'Log',
        'welcome/views/ClockView',
        'welcome/views/DeviceView',
        'welcome/views/ToolbarView',
        'welcome/views/FeedListView',
        'welcome/collections/FeedsCollection'
    ], function (
        Backbone,
        _,
        doT,
        $,
        DB,
        TemplateFactory,
        FunctionSwitch,
        IO,
        CONFIG,
        i18n,
        Device,
        log,
        ClockView,
        DeviceView,
        ToolbarView,
        FeedListView,
        FeedsCollection
    ) {
        console.log('WelcomeView - File loaded.');

        var deviceView;
        var clockView;
        var toolbarView;

        var WelcomeView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('welcome', 'welcome')),
            className : 'w-welcome-ctn',
            initialize : function () {
                var scrollHandler = _.throttle(function (evt) {
                    var target = evt.target;
                    this.moveComponents(target.scrollTop);
                    if (target.scrollHeight - (target.scrollTop + target.offsetHeight) < 400) {
                        FeedListView.getInstance().loadNextPage();
                    }
                }.bind(this), 50);

                var loading = false;

                Object.defineProperties(this, {
                    scrollHandler : {
                        get : function () {
                            return scrollHandler;
                        }
                    },
                    loading :  {
                        set : function (value) {
                            loading = Boolean(value);
                            this.$('.w-ui-loading-horizental-ctn').toggle(loading);
                        },
                        get : function () {
                            return loading;
                        }
                    }
                });
            },
            moveComponents : function (scrollTop) {
                scrollTop = scrollTop >= 400 ? 400 : scrollTop;
                var progress1 = scrollTop / 400;
                this.$('.bg').css({
                    opacity : 1 - progress1
                });

                this.$('.bg .content').css({
                    '-webkit-transform' : 'translate3d(' + -Math.round(50 * progress1) + 'px, ' + -Math.round(40 * progress1)  + 'px, 0)'
                });


                var progress2 = scrollTop <= 80 ? 0 : (scrollTop - 80) / 320;
                if (progress1 < 1) {
                    if (toolbarView.$el.hasClass('left')) {
                        toolbarView.$el.css({
                            '-webkit-transform' : 'translate3d(' + -Math.round(25 * progress2) + 'px, ' + -Math.round(19 * progress2) + 'px, 0)'
                        });
                    } else {
                        toolbarView.$el.css({
                            '-webkit-transform' : 'translate3d(' + -Math.round(305 * progress2) + 'px, ' + Math.round(36 * progress2) + 'px, 0)'
                        });
                    }
                } else {
                    toolbarView.$el.css({
                        '-webkit-transform' : 'translate3d(0, 0, 0)'
                    });
                }
                toolbarView.$el.toggleClass('light', progress2 >= 0.65)
                    .toggleClass('fixed', progress2 === 1);

                deviceView.$el.css({
                    'opacity' : (Device.get('canScreenshot') ? 1 : 0.7) - (0.2 * progress2),
                    '-webkit-transform' : 'translate3d(' + -Math.round(50 * progress2) + 'px, ' + -Math.round(180 * progress2)  + 'px, 0)'
                });

                clockView.$el.css({
                    '-webkit-transform' : 'translate3d(' + -Math.round(20 * progress2) + 'px, ' + -Math.round(180 * progress2)  + 'px, 0)'
                });
            },
            render : function () {
                this.$el.html(this.template({}));

                deviceView = DeviceView.getInstance();
                clockView = ClockView.getInstance();
                toolbarView = ToolbarView.getInstance();
                this.listenTo(toolbarView, 'top', this.scrollTopAnimation);

                this.$('.top').append(deviceView.render().$el)
                    .append(clockView.render().$el);

                this.$('.w-ui-loading-horizental-ctn').before(FeedListView.getInstance().initFeeds().$el);

                this.$el.append(toolbarView.render().$el)
                    .on('scroll', this.scrollHandler);

                var feedsCollection = FeedsCollection.getInstance();
                this.loading = feedsCollection.loading;
                this.listenTo(feedsCollection, 'update refresh', function () {
                    this.loading = feedsCollection.loading;
                    if (feedsCollection.finish) {
                        this.$('.w-ui-loading-horizental-ctn').show().html(i18n.welcome.NO_MORE);
                    }
                });

                this.showBackground();

                var connectionType;
                if (Device.get('isConnected')) {
                    if (Device.get('isUSB')) {
                        connectionType = 'usb';
                    } else {
                        connectionType = 'wifi';
                    }
                } else {
                    connectionType = 'disconnected';
                }

                log({
                    'event' : 'debug.show.welcome',
                    'connectionType' : connectionType
                });

                return this;
            },
            scrollTopAnimation : function () {
                this.$el[0].scrollTop = 0;
            },
            deviceViewAnimationAsync : function () {
                var deferred = $.Deferred();

                deviceView.$el.one('webkitAnimationEnd', function () {
                    deferred.resolve();
                });

                return deferred.promise();
            },
            loadBackgroundAsync : function () {
                var deferred = $.Deferred();

                IO.requestAsync(CONFIG.actions.WELCOME_BACKGROUND).done(deferred.resolve).fail(deferred.reject);

                return deferred.promise();
            },
            showBackground : function () {
                $.when(this.initBackgroundAsync(), this.deviceViewAnimationAsync(), this.loadCachedWallpaperAsync()).done(function () {
                    this.$('.content.new, .mask').css('opacity', 1);
                    this.$('.content.cache').css('opacity', 0).one('webkitTransitionEnd', function () {
                        $(this).remove();
                    });
                }.bind(this));
            },
            loadCachedWallpaperAsync : function () {
                var deferred = $.Deferred();

                DB.readAsync('welcome', 'wallpaper').done(function (evt) {
                    if (evt.target.result) {
                        var cachedWallpaper = evt.target.result.value;
                        this.renderWallpaperInCanvasAsync(cachedWallpaper, 'cache').done(function () {
                            setTimeout(function () {
                                this.$('.content:first, .mask').css('opacity', 1);
                            }.bind(this));
                            setTimeout(deferred.resolve, 3000);
                        }.bind(this));
                    } else {
                        deferred.resolve();
                    }
                }.bind(this));
                return deferred.promise();
            },
            loadImageAsync : function (url) {
                var deferred = $.Deferred();

                var $img = $(new window.Image());

                var loadHandler = function () {
                    deferred.resolve($img);
                    $img.remove();
                };

                var errorHandler = function () {
                    deferred.reject($img);
                    $img.remove();
                };

                $img.one('load', loadHandler)
                    .one('error', errorHandler)
                    .attr('src', url);

                return deferred.promise();
            },
            renderWallpaperInCanvasAsync : function (url, className) {
                var deferred = $.Deferred();

                var $canvas = $('<canvas>').addClass('content ' + className);

                this.loadImageAsync(url).done(function ($img) {
                    $canvas.attr({
                        height : $img[0].height,
                        width : $img[0].width
                    });

                    var context = $canvas[0].getContext('2d');
                    context.drawImage($img[0], 0, 0);

                    this.$('.bg').prepend($canvas);

                    deferred.resolve($canvas);
                }.bind(this));

                return deferred.promise();
            },
            initBackgroundAsync : function () {
                var deferred = $.Deferred();

                this.loadBackgroundAsync().done(function (resp) {
                    var bg = resp[0];
                    if (bg.type === 0) {
                        this.renderWallpaperInCanvasAsync(bg.url, 'new').done(function ($canvas) {
                            deferred.resolve();

                            // Cache wallpaper
                            setTimeout(function () {
                                DB.addOrUpdateAsync('welcome', {
                                    key : 'wallpaper',
                                    value : $canvas[0].toDataURL()
                                });
                            }, 5000);
                        });
                    } else {
                        this.$('.bg').prepend($('<iframe>').attr('src', bg.url).addClass('content'));
                        this.$('.content').one('load', function () {
                            deferred.resolve();
                        });
                    }
                }.bind(this)).fail(deferred.reject);

                return deferred.promise();
            }
        });

        var welcomeView;

        var factory = _.extend({
            getInstance : function () {
                if (!welcomeView) {
                    welcomeView = new WelcomeView();
                }
                return welcomeView;
            }
        });

        return factory;
    });
}(this));
