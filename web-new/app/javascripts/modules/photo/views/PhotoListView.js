/*global define*/
(function (window, document) {
    define([
        'underscore',
        'backbone',
        'doT',
        'jquery',
        'Configuration',
        'Internationalization',
        'Account',
        'ui/TemplateFactory',
        'ui/WindowState',
        'ui/MouseState',
        'Device',
        'photo/views/PhotoThreadView'
    ], function (
        _,
        Backbone,
        doT,
        $,
        CONFIG,
        i18n,
        Account,
        TemplateFactory,
        WindowState,
        MouseState,
        Device,
        PhotoThreadView
    ) {
        console.log('PhotoListView -File loaded. ');

        var PhotoListView = Backbone.View.extend({
            className : 'w-photo-gallery',
            template : doT.template(TemplateFactory.get('photo', 'photo-list')),
            initialize : function () {
                var subView = [];
                var threads = [];
                var scrollHandler = _.throttle(function (evt) {
                    this.renderThread();
                    Backbone.trigger('photo:list:scroll', evt);
                }.bind(this), 20);
                var loading = false;
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
                                this.$('> .w-ui-loading').show();
                            } else {
                                this.$('> .w-ui-loading').hide();
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
                    this.loading = this.collection.loading || this.collection.syncing;
                });

                this.listenTo(this.collection, 'remove', _.debounce(function () {
                    if (this.collection.length > 0) {
                        this.renderThread();
                    } else {
                        this.toggleEmptyTip(true);
                    }
                }));

                if (this.options.template) {
                    this.template = this.options.template;
                }

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

                this.listenTo(Account, 'change:isLogin', function (account, isLogin) {
                    if (this.collection.data.photo_type === CONFIG.enums.PHOTO_CLOUD_TYPE && isLogin) {
                        this.$('.empty-tip').html(i18n.photo.EMPTY_TIP_PHOTO_CLOUD_NOT_LOGIN).show();
                        return;
                    }
                });
            },
            toggleEmptyTip : function (toggle) {
                if (typeof toggle !== 'boolean') {
                    return;
                }

                if (toggle) {
                    if (Device.get('isConnected') && !Device.get('hasSDCard') && !Device.get('hasEmulatedSD')) {
                        this.$('.empty-tip').html(i18n.common.NO_SD_CARD_TIP_TEXT);
                    } else {
                        this.$('.empty-tip').html(this.getEmptyTip(this.collection.data.photo_type));
                    }
                }
                this.$('.empty-tip').toggle(toggle);
            },
            remove : function () {
                _.each(this.subView, function (view) {
                    view.remove();
                });
                this.subView.length = 0;
                this.$el.off('scroll', this.scrollHandler);
                PhotoListView.__super__.remove.call(this);
            },
            buildList : function (collection) {
                if (!collection) {
                    return;
                }

                this.threads = _.sortBy(collection.groupBy('key'), function (item, key) {
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
                    var i = 0;
                    var date;
                    for (date in this.threads) {
                        if (this.threads.hasOwnProperty(date)) {
                            var thread = this.threads[date];
                            var photoThreadView = new PhotoThreadView.getInstance({
                                models : thread,
                                $ctn : this.$el,
                                template : this.options.threadTemplate,
                                itemTemplate : this.options.itemTemplate
                            });
                            this.$('.spy').before(photoThreadView.render().$el);
                            photoThreadView.getThumbsAsync();
                            this.subView.push(photoThreadView);
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
            getEmptyTip : function (type) {
                switch (type) {
                case CONFIG.enums.PHOTO_PHONE_TYPE:
                    return i18n.photo.EMPTY_PHONE_LIST;
                case CONFIG.enums.PHOTO_LIBRARY_TYPE:
                    return i18n.photo.EMPTY_LIBRARY_LIST;
                case CONFIG.enums.PHOTO_CLOUD_TYPE:
                    return i18n.photo.EMPTY_CLOUD_LIST;
                default:
                    return i18n.photo.EMPTY_PHONE_LIST;
                }
            },
            render : function () {
                this.$el.html(this.template({}));
                if (!this.collection.loading && !this.collection.syncing) {
                    setTimeout(function () {
                        this.buildList(this.collection);
                    }.bind(this), 0);
                }
                this.$el.on('scroll', this.scrollHandler);

                this.loading = this.collection.loading || this.collection.syncing;
                this.listenTo(WindowState, 'resize', this.renderThread);

                this.$('.empty-tip').html(this.getEmptyTip(this.collection.data.type));
                return this;
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

                    var clientWidth = this.$el[0].clientWidth;

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
                        Backbone.trigger('photo.item.select', this.collection.data.photo_type, {
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
            clickButtonLogin :  function () {
                Account.loginAsync('', 'cloud-photo');
            },
            events : {
                'click .button-login' : 'clickButtonLogin',
                'mousedown' : 'startDraw'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new PhotoListView(args);
            }
        });

        return factory;
    });
}(this, this.document));
