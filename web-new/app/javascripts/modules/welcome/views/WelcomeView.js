/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'ui/TemplateFactory',
        'FunctionSwitch',
        'IOBackendDevice',
        'Configuration',
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
        TemplateFactory,
        FunctionSwitch,
        IO,
        CONFIG,
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
                }.bind(this), 20);

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
                toolbarView.$el.toggleClass('light', progress2 >= 0.65);
                toolbarView.$el.toggleClass('fixed', progress2 === 1);

                deviceView.$el.css({
                    'opacity' : 1 - (0.2 * progress2),
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

                this.$('.top').append(deviceView.render().$el)
                    .append(clockView.render().$el);

                this.$('.w-ui-loading-horizental-ctn').before(FeedListView.getInstance().initFeeds().$el);

                this.$el.append(toolbarView.render().$el)
                    .on('scroll', this.scrollHandler);

                this.initBackground();

                var feedsCollection = FeedsCollection.getInstance();
                this.loading = feedsCollection.loading;
                this.listenTo(feedsCollection, 'update refresh', function () {
                    this.loading = feedsCollection.loading;
                });

                return this;
            },
            loadBackgroundAsync : function () {
                var deferred = $.Deferred();

                IO.requestAsync(CONFIG.actions.WELCOME_BACKGROUND).done(deferred.resolve).fail(deferred.reject);

                return deferred.promise();
            },
            initBackground : function () {
                this.loadBackgroundAsync().done(function (resp) {
                    var bg = resp[0];
                    if (bg.type === 0) {
                        this.$('.bg').prepend($('<img>').attr('src', bg.url).addClass('content'));
                    } else {
                        this.$('.bg').prepend($('<iframe>').attr('src', bg.url).addClass('content'));
                    }

                    this.$('.content').one('load', function () {
                        $(this).css('opacity', 1);
                    });
                }.bind(this));
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
