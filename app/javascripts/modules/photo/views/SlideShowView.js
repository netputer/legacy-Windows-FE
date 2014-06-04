/*global define*/
(function (window) {
    'use strict';

    define([
        'underscore',
        'backbone',
        'doT',
        'jquery',
        'ui/TemplateFactory',
        'ui/WindowState',
        'ui/KeyboardHelper',
        'ui/MouseState',
        'ui/PopupTip',
        'Device',
        'Environment',
        'Internationalization',
        'IframeMessageWorker',
        'IO',
        'Configuration'
    ], function (
        _,
        Backbone,
        doT,
        $,
        TemplateFactory,
        WindowState,
        KeyboardHelper,
        MouseState,
        PopupTip,
        Device,
        Environment,
        i18n,
        IframeMessageWorker,
        IO,
        CONFIG
    ) {
        console.log('SlideShowView - File loaded. ');

        var playing = false;

        var SlideShowView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('photo', 'slide-show')),
            className : 'w-photo-slideshow vbox',
            initialize : function () {
                var loading = false;
                Object.defineProperties(this, {
                    loading : {
                        get : function () {
                            return loading;
                        },
                        set : function (value) {
                            loading = Boolean(value);
                            this.$('.w-ui-loading').toggle(loading);
                        }
                    }
                });

                this.listenTo(Device, 'change:isMounted', function (Device, isMounted) {
                    // always show control buttons for cloud photo
                    if (this.currentPhoto && this.currentPhoto.get('is_cloud')) {
                        return;
                    }

                    if (isMounted) {
                        this.$('.control .tip').html(i18n.taskManager.INSTALL_FAILED_SDCARD_MOUNT);
                    }
                });
            },
            adjustSize : function () {
                if (this.currentPhoto) {
                    var orientation = this.currentPhoto.get('orientation');
                    if (this.currentPhoto.get('widthLtHeight') && (orientation === 270 || orientation === 90)) {
                        this.$('.photo').css({
                            'max-height' : this.$('.photo-ctn').width() - 100,
                            'max-width' : this.$('.photo-ctn').height() - 160
                        });
                    } else {
                        this.$('.photo').css({
                            'max-height' : this.$('.photo-ctn').height() - 100,
                            'max-width' : this.$('.photo-ctn').width() - 160
                        });
                    }
                }
            },
            remove : function () {
                delete this.currentPhoto;
                SlideShowView.__super__.remove.call(this);
            },
            render : function () {
                this.$el.html(this.template({}));
                this.listenTo(WindowState, 'resize', this.adjustSize);

                this.$('.photo').on('error', function () {
                    if (this.$('.photo').attr('src')) {
                        this.$('.error').show();
                    }
                }.bind(this));

                if (Device.get('isMounted')) {
                    this.$('.control .tip').html(i18n.taskManager.INSTALL_FAILED_SDCARD_MOUNT).show();
                    this.$('.control .buttons').hide();
                }

                var $buttonShare = this.$('.button-share');
                var title;
                switch (navigator.language) {
                case CONFIG.enums.LOCALE_ZH_CN:
                    title = i18n.misc.SHARE;
                    break;
                case CONFIG.enums.LOCALE_EN_US:
                case CONFIG.enums.LOCALE_TH_TH:
                    title = i18n.misc.SHARE_TO_FACEBOOK;
                    break;
                }
                $buttonShare.attr('title', title);

                return this;
            },
            showNext : function () {
                if (playing) {
                    this.next();
                }
            },
            showPic : function () {
                this.loading = false;
                this.$('.error').hide();

                var $img = $(new window.Image());
                var loadHandler = function () {
                    if (this.currentPhoto.get('originalPic') === $img.attr('src')) {
                        this.currentPhoto.set('widthLtHeight', $img[0].width > $img[0].height);
                        this.$('.photo').attr({
                            src : $img.attr('src'),
                            style : ''
                        }).removeClass('rotate-90 rotate-180 rotate-270').addClass('rotate-' + this.currentPhoto.get('orientation'));

                        this.adjustSize();

                        this.$('.photo').removeClass('hide');

                        if (playing) {
                            clearTimeout(this.playingTimer);
                            this.playingTimer = setTimeout(this.showNext.bind(this), 3000);
                        }
                    }
                    $img.remove();
                }.bind(this);

                var errorHandler = function () {
                    this.$('.error').show();
                    $img.remove();
                }.bind(this);

                $img.one('load', loadHandler)
                    .one('error', errorHandler)
                    .attr('src', this.currentPhoto.get('originalPic'));

            },
            loadAsync : function () {
                var deferred = $.Deferred();

                this.$('.error').hide();
                this.currentPhoto.getOriginalPicAsync().done(this.showPic.bind(this)).fail(function () {
                    this.loading = false;
                    this.$('.error').show();

                    deferred.resolve();
                }.bind(this)).done(deferred.resolve);

                return deferred.promise();
            },
            start : function (photo, autoPlay) {
                this.currentPhoto = photo;

                var isCloud = this.currentPhoto.get('is_cloud');
                this.$('.button-wallpaper').toggle(!isCloud);
                if (isCloud) {
                    this.$('.control .tip').slideUp('fast', function () {
                        this.$('.control .buttons').slideDown('fast');
                    }.bind(this));
                }
                this.$('.button-previous, .button-next').toggle(this.currentPhoto.collection.length !== 1);

                this.$el.addClass('show').css({
                    visibility : 'visible'
                }).one('webkitTransitionEnd', function () {
                    if (!photo.get('originalPic')) {
                        this.loading = true;
                        this.loadAsync();
                    } else {
                        this.showPic();
                    }
                    this.listenTo(KeyboardHelper, 'keydown', this.keyboardControl);
                }.bind(this));

                if (autoPlay) {
                    playing = true;
                    this.$('.button-play').removeClass('button-play').addClass('button-pause').attr('title', i18n.photo.SLIDES_STOP_TEXT);
                }
            },
            close : function () {
                playing = false;
                this.loading = false;
                this.$('.error').hide();
                this.$('.button-pause').removeClass('button-pause').addClass('button-play');

                this.$el.one('webkitTransitionEnd', function () {
                    this.$el.css({
                        visibility : 'hidden'
                    });
                    this.$('.photo').attr({
                        src : ''
                    }).removeClass('rotate-90 rotate-180 rotate-270').addClass('hide');
                }.bind(this)).removeClass('show');

                this.stopListening(KeyboardHelper, 'keydown', this.keyboardControl);

                if (this.playTimer) {
                    clearTimeout(this.playTimer);
                }

                if (this.playingTimer) {
                    clearTimeout(this.playingTimer);
                }

                this.trigger('close');
            },
            keyboardControl : function (evt) {
                evt.stopPropagation();
                evt.preventDefault();
                var keyCode = evt.keyCode;
                switch (keyCode) {
                case KeyboardHelper.Mapping.ESC:
                    this.close();
                    break;
                case KeyboardHelper.Mapping.SPACEBAR:
                case KeyboardHelper.Mapping.ENTER:
                case KeyboardHelper.Mapping.RIGHT:
                case KeyboardHelper.Mapping.PAGEDOWN:
                case KeyboardHelper.Mapping.DOWN:
                case KeyboardHelper.Mapping.J:
                    this.next();
                    break;
                case KeyboardHelper.Mapping.LEFT:
                case KeyboardHelper.Mapping.PAGEUP:
                case KeyboardHelper.Mapping.UP:
                case KeyboardHelper.Mapping.K:
                    this.previous();
                    break;
                }
            },
            next : function () {
                if (this.currentPhoto.collection.length > 1) {
                    var collection = this.currentPhoto.collection;
                    var index = collection.indexOf(this.currentPhoto);
                    var nextPhoto = (index + 1) >= collection.length ? collection.models[0] : collection.models[index + 1];
                    this.showNextPhoto(nextPhoto, true);
                }
            },
            previous : function () {
                if (this.currentPhoto.collection.length > 1) {
                    var collection = this.currentPhoto.collection;
                    var index = collection.indexOf(this.currentPhoto);
                    var nextPhoto = (index - 1) < 0 ? collection.models[collection.length - 1] : collection.models[index - 1];
                    this.showNextPhoto(nextPhoto, false);
                }
            },
            showNextPhoto : function (photo, forward) {
                var $photo = this.$('.photo');

                var loadPhoto = function () {
                    this.currentPhoto = photo;

                    if (!photo.get('originalPic')) {
                        this.loading = true;

                        this.loadAsync().done(function () {
                            this.preload(forward);
                        }.bind(this));
                    } else {
                        this.showPic();
                    }
                }.bind(this);

                if (!$photo.hasClass('hide')) {
                    $photo.one('webkitTransitionEnd', loadPhoto).addClass('hide');
                } else {
                    loadPhoto.call(this);
                }
            },
            preload : function (next) {
                var collection = this.currentPhoto.collection;
                var index = collection.indexOf(this.currentPhoto);
                var nextPhoto;
                if (next) {
                    nextPhoto = (index + 1) >= collection.length ? collection.models[0] : collection.models[index + 1];
                } else {
                    nextPhoto = (index - 1) < 0 ? collection.models[collection.length - 1] : collection.models[index - 1];
                }
                if (!nextPhoto.get('originalPic')) {
                    nextPhoto.getOriginalPicAsync();
                }
            },
            rotatePhoto : function (clockwise) {
                var $photo = this.$('.photo');
                var orientation;
                if ($photo.hasClass('rotate-90')) {
                    orientation = clockwise ? 180 : 0;
                } else if ($photo.hasClass('rotate-180')) {
                    orientation = clockwise ? 270 : 90;
                } else if ($photo.hasClass('rotate-270')) {
                    orientation = clockwise ? 0 : 180;
                } else {
                    orientation = clockwise ? 90 : 270;
                }

                this.loading = true;
                var currentPhotoId = this.currentPhoto.id;
                this.currentPhoto.rotateAsync(orientation).done(function () {
                    this.loading = false;
                    if (this.currentPhoto.id === currentPhotoId) {
                        $photo.removeClass('rotate-0 rotate-90 rotate-180 rotate-270').addClass('rotate-' + orientation);
                        this.adjustSize();
                    }
                }.bind(this));
            },
            play : function () {
                if (!playing) {
                    playing = true;
                    this.playTimer = setTimeout(function () {
                        if (playing) {
                            this.next();
                        }
                    }.bind(this), 3000);
                    this.$('.button-play').removeClass('button-play').addClass('button-pause').attr('title', i18n.photo.SLIDES_STOP_TEXT);
                }
            },
            stopPlaying : function () {
                if (playing) {
                    playing = false;
                    this.$('.button-pause').removeClass('button-pause').addClass('button-play').attr('title', i18n.photo.SLIDE_SHOW);
                }
            },
            sharePic : function (type) {
                var doShare = function () {
                    IframeMessageWorker.trigger(CONFIG.events.CUSTOM_IFRAME_PHOTO_SHARE, {
                        path : this.currentPhoto.get('originalPic'),
                        orientation : this.currentPhoto.get('orientation'),
                        type : type,
                        size : this.currentPhoto.get('size')
                    });
                }.bind(this);

                if (!this.currentPhoto.get('originalPic')) {
                    this.loadAsync().done(doShare);
                } else {
                    doShare.call(this);
                }
            },
            clickPhoto : function (evt) {
                evt.stopPropagation();
                var $img = $(evt.target);
                var orientation;

                if ($img.hasClass('rotate-270') || $img.hasClass('rotate-90')) {
                    orientation = 'height';
                } else {
                    orientation = 'width';
                }
                if (MouseState.x >= $img.offset().left + ($img[orientation]() / 2)) {
                    this.next();
                } else {
                    this.previous();
                }
            },
            clickButtonClose : function () {
                this.close();
            },
            clickButtonPlay : function () {
                this.play();
            },
            clickButtonPause : function () {
                this.stopPlaying();
            },
            clickButtonPrevious : function () {
                this.previous();
                if (playing) {
                    clearTimeout(this.playingTimer);
                }
            },
            clickButtonNext : function () {
                this.next();
                if (playing) {
                    clearTimeout(this.playingTimer);
                }
            },
            clickButtonRotateLeft : function () {
                this.stopPlaying();
                this.rotatePhoto(false);
            },
            clickButtonRotateRight : function () {
                this.stopPlaying();
                this.rotatePhoto(true);
            },
            clickButtonDelete : function () {
                this.stopPlaying();
                this.loading = true;
                var index = this.currentPhoto.collection.indexOf(this.currentPhoto);
                var collection = this.currentPhoto.collection;
                var nextPhoto = (index + 1) >= collection.length ? collection.models[0] : collection.models[index + 1];

                IframeMessageWorker.trigger(CONFIG.events.CUSTOM_IFRAME_PHOTO_DELETE, {
                    ids : [this.currentPhoto.id],
                    models : collection.models
                });

                var handler = IO.Backend.onmessage({
                    'data.channel' : CONFIG.events.CUSTOM_IFRAME_PHOTO_DELETED
                }, function (data) {
                    IO.Backend.offmessage(handler);
                    collection.remove(data.data);

                    this.loading = false;
                    if (data.data.length > 0) {
                        if (collection.length > 0) {
                            this.showNextPhoto(nextPhoto, true);
                        } else {
                            this.close();
                        }
                    }
                }, this);
            },
            clickButtonExport : function () {
                this.stopPlaying();
                IframeMessageWorker.trigger(CONFIG.events.CUSTOM_IFRAME_PHOTO_EXPORT, {
                    ids : [this.currentPhoto.id],
                    models : this.currentPhoto.collection.models
                });
            },
            clickButtonWallpaper : function (evt) {
                var isPlaying = playing;
                this.stopPlaying();
                this.loading = true;
                this.currentPhoto.setAsWallpaperAsync().done(function () {
                    var popup = new PopupTip({
                        $host : $(evt.currentTarget),
                        alignToHost : false,
                        popIn : true,
                        autoClose : 2000
                    });
                    popup.destoryBlurToHideMixin();
                    popup.show();
                    this.loading = false;
                    if (isPlaying) {
                        this.play();
                    }
                }.bind(this));
            },
            clickButtonShare : function () {
                this.stopPlaying();

                this.sharePic(CONFIG.enums.SOCIAL_PHOTO);
            },
            clickButtonRetry : function (evt) {
                evt.stopPropagation();

                this.loading = true;
                this.loadAsync();
            },
            getTransformItems : function ($elem) {
                var matrix = $elem.css('transform');

                if (matrix === 'none') {
                    return {
                        scale : 1,
                        angle : 0
                    };
                }

                var matrixArray = matrix.substr(7, matrix.length - 8).split(',');
                var a = matrixArray[0];
                var b = matrixArray[1];

                return {
                    scale : Math.sqrt(a * a + b * b),
                    angle : Math.round(Math.atan2(b, a) * (180 / Math.PI))
                };
            },
            mouseWheelEvent : _.throttle(function (evt) {
                var delta = evt.originalEvent.wheelDelta,
                    $photo = this.$('.photo'),
                    transform = this.getTransformItems($photo),
                    scale = transform.scale,
                    angle = transform.angle;

                if (delta > 0) {
                    scale = Number(scale + 0.5).toFixed(1);

                    if (scale > 5) {
                        scale = 5;
                    }
                } else {
                    scale = Number(scale - 0.5).toFixed(1);

                    if (scale < 0.5) {
                        scale = 0.5;
                    }
                }

                $photo.css('transform', 'scale(' + scale + ') rotate(' + angle + 'deg)');
            }, 30),
            events : {
                // 'mousewheel' : 'mouseWheelEvent',
                'click .photo' : 'clickPhoto',
                'click .button-close' : 'clickButtonClose',
                'click .button-play' : 'clickButtonPlay',
                'click .button-pause' : 'clickButtonPause',
                'click .button-previous' : 'clickButtonPrevious',
                'click .button-next' : 'clickButtonNext',
                'click .button-rotate-left' : 'clickButtonRotateLeft',
                'click .button-rotate-right' : 'clickButtonRotateRight',
                'click .button-delete' : 'clickButtonDelete',
                'click .button-export' : 'clickButtonExport',
                'click .button-wallpaper' : 'clickButtonWallpaper',
                'click .button-share' : 'clickButtonShare',
                'click .button-retry' : 'clickButtonRetry'
            }
        });

        var slideShowView;

        var factory = _.extend({
            getInstance : function () {
                if (!slideShowView) {
                    slideShowView = new SlideShowView();
                }
                return slideShowView;
            }
        });

        return factory;
    });
}(this));
