/*global define*/
(function (window) {
    // 'use strict';

    define([
        'underscore',
        'backbone',
        'doT',
        'jquery',
        'Configuration',
        'IframeMessageWorker',
        'ui/TemplateFactory',
        'ui/WindowState',
        'photo/views/SlideShowView',
        'photo/views/PhotoInfoPanelView'
    ], function (
        _,
        Backbone,
        doT,
        $,
        CONFIG,
        IframeMessageWorker,
        TemplateFactory,
        WindowState,
        SlideShowView,
        PhotoInfoPanelView
    ) {
        console.log('PhotoItemView - File loaded. ');

        var changeErrorHandler = function (photo, error) {
            this.loading = false;
            if (error) {
                this.$('.error').show();
            } else {
                this.$('.error').hide();
            }
        };

        var changeThumbHandler = function (photo, thumb) {
            this.loading = false;
            this.$('.error').hide();
            this.$('.thumb').attr({
                src : thumb
            }).addClass('show rotate-' + photo.get('orientation'));

            this.listenTo(this.model, 'change:orientation', function (photo) {
                this.$('.thumb').removeClass('rotate-0 rotate-90 rotate-180 rotate-270')
                                .addClass('rotate-' + photo.get('orientation'));
            });
            this.stopListening(this.model, 'change:thumb', changeThumbHandler);
            this.stopListening(this.model, 'change:error', changeErrorHandler);
        };

        var changeSelectedHandler = function (photo, selected) {
            this.$el.toggleClass('selected', selected);
            this.$('.check-item').prop({
                checked : selected
            });
        };

        var locateHandler = function () {
            if (this.isItemSawn()) {
                this.renderContent();
                this.stopListening(Backbone, 'photo:list:scroll', locateHandler);
                this.stopListening(WindowState, 'resize', locateHandler);
            }
        };

        var PhotoItemView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('photo', 'photo-item')),
            tagName : 'li',
            className : 'w-photo-item',
            initialize : function () {
                var loading = false;
                var position = {};
                Object.defineProperties(this, {
                    loading : {
                        get : function () {
                            return loading;
                        },
                        set : function (value) {
                            loading = Boolean(value);
                            if (loading) {
                                this.$('.w-ui-loading').show();
                            } else {
                                this.$('.w-ui-loading').hide();
                            }
                        }
                    },
                    position : {
                        get : function () {
                            return position;
                        },
                        set : function (value) {
                            position = value;
                        }
                    }
                });

                this.listenTo(Backbone, 'photo.item.select', this.selectItem);
                this.listenTo(WindowState, 'resize', function () {
                    position = {
                        top : this.$el[0].offsetTop,
                        left : this.$el[0].offsetLeft
                    };
                });
                this.listenTo(WindowState, 'resize', locateHandler);
                this.listenTo(this.model.collection, 'remove', function (model) {
                    if (model.id !== this.model.id) {
                        position = {
                            top : this.$el[0].offsetTop,
                            left : this.$el[0].offsetLeft
                        };

                        setTimeout(locateHandler.call(this));
                    }
                });

                if (this.options.template) {
                    this.template = this.options.template;
                }
            },
            selectItem : function (type, position) {
                if (this.model.collection.data.photo_type === type) {
                    var Xa1 = this.position.left;
                    var Ya1 = this.position.top;
                    var Xa2 = this.position.left + 130;
                    var Ya2 = this.position.top + 130;
                    var Xb1 = position.left;
                    var Yb1 = position.top;
                    var Xb2 = position.left + position.width;
                    var Yb2 = position.top + position.height;
                    if (Math.abs(Xb2 + Xb1 - Xa2 - Xa1) <= Xa2 - Xa1 + Xb2 - Xb1 &&
                            Math.abs(Yb2 + Yb1 - Ya2 - Ya1) <= Ya2 - Ya1 + Yb2 - Yb1) {
                        this.model.set({
                            selected : true
                        });
                    }
                }
            },
            renderContent : function () {
                this.$el.html(this.template(this.model.toJSON()));

                if (this.model.get('thumb')) {
                    changeThumbHandler.call(this, this.model, this.model.get('thumb'));
                } else {
                    if (this.model.get('error')) {
                        changeErrorHandler.call(this, this.model, this.model.get('error'));
                    } else {
                        this.loading = true;
                    }
                    this.listenTo(this.model, 'change:thumb', changeThumbHandler);
                    this.listenTo(this.model, 'change:error', changeErrorHandler);
                }

                this.listenTo(this.model, 'change:selected', changeSelectedHandler);

                changeSelectedHandler.call(this, this.model, this.model.get('selected'));

                this.$('.thumb').on('error', function () {
                    if (this.$('.thumb').attr('src')) {
                        this.model.set({
                            error : true
                        });
                    }
                }.bind(this)).on('load', function () {
                    if (this.model.get('is_cloud')) {
                        this.$('.thumb').css('margin-left', -(this.$('.thumb').width() / 2)).off('load').off('error');
                    }
                }.bind(this));

                this.infoPanel = PhotoInfoPanelView.getInstance({
                    $host : this.$('.button-info'),
                    model : this.model
                });
            },
            remove : function () {
                if (this.infoPanel) {
                    this.infoPanel.remove();
                    delete this.infoPanel;
                }
                PhotoItemView.__super__.remove.call(this);
            },
            render : function () {
                setTimeout(function () {
                    if (this.isItemSawn()) {
                        this.renderContent();
                    } else {
                        this.listenTo(Backbone, 'photo:list:scroll', locateHandler);
                    }
                    this.position = {
                        top : this.$el[0].offsetTop,
                        left : this.$el[0].offsetLeft
                    };
                }.bind(this));
                return this;
            },
            isItemSawn : function () {
                var $ctn = this.options.$ctn;
                return $ctn[0].scrollTop + this.options.$ctn.height() > this.$el[0].offsetTop;
            },
            mousedownItem : function (evt) {
                evt.stopPropagation();
            },
            clickItem : function (evt) {
                this.model.set({
                    selected : !this.model.get('selected')
                });
            },
            dblclickThumb : function () {
                SlideShowView.getInstance().start(this.model);
            },
            clickButtonShare : function (evt) {
                evt.stopPropagation();

                var doShare = function () {
                    IframeMessageWorker.trigger(CONFIG.events.CUSTOM_IFRAME_PHOTO_SHARE, {
                        path : this.model.get('originalPic'),
                        orientation : this.model.get('orientation'),
                        type : CONFIG.enums.SOCIAL_PHOTO,
                        size : this.model.get('size')
                    });
                }.bind(this);

                if (!this.model.get('originalPic')) {
                    this.loading = true;
                    this.model.getOriginalPicAsync().done(function () {
                        this.loading = false;
                        doShare.call(this);
                    }.bind(this));
                } else {
                    doShare.call(this);
                }
            },
            clickButtonRetry : function (evt) {
                evt.stopPropagation();

                this.loading = true;
                this.model.set({
                    error : false
                }).getThumbnailAsync().always(function () {
                    this.loading = false;
                }.bind(this));
            },
            clickButtonInfo : function (evt) {
                evt.stopPropagation();
            },
            events : {
                'mousedown' : 'mousedownItem',
                'click' : 'clickItem',
                'click .button-share' : 'clickButtonShare',
                'dblclick .thumb' : 'dblclickThumb',
                'click .button-retry' : 'clickButtonRetry',
                'click .button-info' : 'clickButtonInfo'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new PhotoItemView(args);
            }
        });

        return factory;
    });
}(this));
