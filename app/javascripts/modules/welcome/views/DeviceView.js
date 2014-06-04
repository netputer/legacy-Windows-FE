/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'ui/TemplateFactory',
        'ui/MouseState',
        'Device',
        'IO',
        'Configuration',
        'Internationalization',
        'Log',
        'welcome/views/ScreenControlView'
    ], function (
        Backbone,
        _,
        doT,
        $,
        TemplateFactory,
        MouseState,
        Device,
        IO,
        CONFIG,
        i18n,
        log,
        ScreenControlView
    ) {
        console.log('DeviceView - File loaded.');

        var setTimeout = window.setTimeout;
        var setInterval = window.setInterval;
        var clearInterval = window.clearInterval;

        var screenControlView;

        var SCREENSHOT_DEFAULTS = {
            top : 60,
            left : 12,
            width : 197,
            height : 310
        };

        var SCREEN_SHOT_CONFIG = {
            scale : 430
        };

        var slideShowSwitch = false;

        var checkMousePosition = function () {
            return this.$('.screen')[0].contains(MouseState.currentElement) ||
                    screenControlView.$el[0].contains(MouseState.currentElement);
        };

        var DeviceView = Backbone.View.extend({
            className : 'w-welcome-device-ctn',
            template : doT.template(TemplateFactory.get('welcome', 'device')),
            initialize : function () {
                var loading = false;
                var fade = false;
                var offlineTip;
                var wifiTip;
                var screenShot;
                var connectionTip;
                Object.defineProperties(this, {
                    loading : {
                        set : function (value) {
                            loading = value;
                            var $loading = this.$('.w-ui-loading');
                            $loading.toggle(loading);
                        },
                        get : function () {
                            return loading;
                        }
                    },
                    fade : {
                        set : function (value) {
                            fade = value;
                            this.$('.screen img').css({
                                opacity : fade ? '.3' : '1'
                            });
                        },
                        get : function () {
                            return fade;
                        }
                    },
                    offlineTip : {
                        set : function (value) {
                            offlineTip = value;
                        },
                        get : function () {
                            return offlineTip;
                        }
                    },
                    wifiTip : {
                        set : function (value) {
                            wifiTip = value;
                        },
                        get : function () {
                            return wifiTip;
                        }
                    },
                    screenShot : {
                        set : function (value) {
                            screenShot = value;
                        },
                        get : function () {
                            return screenShot;
                        }
                    },
                    connectionTip : {
                        set : function (value) {
                            connectionTip = value;
                        },
                        get : function () {
                            return connectionTip;
                        }
                    }
                });

                this.listenTo(Device, 'change:isConnected', function (Device, isConnected) {
                    var isUSB = Device.get('isUSB');
                    var isWifi = Device.get('isWifi');

                    if (isConnected) {
                        this.wifiTip.toggleClass('hide', !isWifi);
                        this.offlineTip.addClass('hide');
                        this.screenShot.toggle(isUSB);

                        if (isUSB) {
                            Device.getScreenshotAsync();
                        }
                        this.loading = false ;
                    } else {
                        this.wifiTip.addClass('hide');
                        this.offlineTip.removeClass('hide');
                        this.screenShot.hide();
                    }

                    this.connectionTip.addClass('hide');
                });

                this.listenTo(Device, 'change:connectionState', function (){
                    this.wifiTip.addClass('hide');
                    this.setConnectionState();
                });

                this.listenTo(Device, 'change:shell', this.renderShell)
                    .listenTo(Device, 'change:screenshot', function(Device, screenshot) {
                        this.renderScreenshot(Device, screenshot);
                        this.adjustRotation();
                    });
            },
            setConnectionState : function () {
                var $desc = this.$('.connection-tip .desc');
                var connectionState = Device.get('connectionState');

                if (connectionState === CONFIG.enums.CONNECTION_STATE_PLUG_OUT) {
                    return;
                }

                this.loading = true;
                this.offlineTip.addClass('hide');
                this.connectionTip.removeClass('hide');
                $desc.html(i18n.misc['DEVICE_' + connectionState.toUpperCase()]);
            },
            render : function () {
                this.$el.html(this.template({})).addClass('fade-in').find('.screenshot').attr('src', CONFIG.enums.IMAGE_PATH + '/blank.png');

                this.offlineTip = this.$('.offline-tip');
                this.wifiTip = this.$('.wifi-connection-tip');
                this.screenShot = this.$('.screenshot');
                this.connectionTip = this.$('.connection-tip');
                this.renderShell(Device, Device.get('shell'));
                this.renderScreenshot(Device, Device.get('screenshot'));

                Device.getScreenshotAsync();
                Device.getShellInfoAsync();

                screenControlView = ScreenControlView.getInstance({
                    deviceView : this
                });

                this.$el.append(screenControlView.render().$el);

                this.$el.one('webkitAnimationEnd', function () {
                    this.$el.removeClass('fade-in');
                }.bind(this));

                return this;
            },
            renderScreenshot : function (Device, screenshot) {
                var $screen = this.$('.screen');
                var $screenImg = $screen.find('img');
                $screenImg.toggle(!!screenshot.path);
                if (screenshot.path) {
                    var $img = $(new window.Image());
                    var loadHandler = function () {
                        $screen.find('img').attr('src', $img.attr('src'));
                        $img.remove();
                    }.bind(this);

                    var errorHandler = function () {
                        $img.remove();
                    };

                    $img.one('load', loadHandler)
                        .one('error', errorHandler)
                        .attr('src', 'file:///' + screenshot.path + '?date' + screenshot.date);
                }
            },
            adjustRotation : function () {
                var isPad = this.$el.hasClass('isPad');
                var rotation = Device.get('screenshot').rotation;

                this.$el.toggleClass('turn-left', rotation === 1)
                        .toggleClass('turn-right', rotation === 3)
                        .toggleClass('turn-down', rotation === 2);

                var shell = Device.get('shell');
                var config = SCREENSHOT_DEFAULTS;
                if (shell.path) {
                    config = shell.screenshot;
                }

                var height = this.offlineTip.height();
                var top = config.top + config.height - height;
                if (rotation === 1) {
                    top = top - config.top - 2 * config.left;
                } else if (rotation === 3){
                    top = top - config.top - config.left;
                }
                this.offlineTip.css('top', top);

                if (!isPad) {
                    if (rotation === 1 || rotation === 3) {
                        this.$el.width(Device.get('shell').height + 50);
                    } else {
                        this.$el.width(Device.get('shell').width);
                    }
                }
            },
            renderShell : function (Device, shell) {
                var screenshotStyle = SCREENSHOT_DEFAULTS;
                var $screen = this.$('.screen');
                var $screenImg = $screen.find('img');

                if (shell.path) {
                    var $screenCtn = this.$('.screen-ctn');
                    var isPad = false;

                    shell.width = shell.width || parseInt(this.$el.width(), 10);
                    shell.height = shell.height || parseInt(this.$el.height(), 10);
                    isPad = shell.width === SCREEN_SHOT_CONFIG.scale;

                    this.$el.toggleClass('isPad', isPad);

                    this.adjustRotation();

                    $screenCtn.fadeOut('fast', function () {
                        $screenCtn.css({
                            'width' : shell.width,
                            'height' : shell.height,
                            'background-image' : 'url(' + shell.path + ')',
                            'background-position' : '0 0'
                        }).fadeIn('fast');

                        screenshotStyle = {
                            left : shell.screenshot.left,
                            top : shell.screenshot.top,
                            width : shell.screenshot.width,
                            height : shell.screenshot.height
                        };

                        $screen.css(screenshotStyle);
                        $screenImg.css(screenshotStyle);
                    }.bind(this));
                } else {
                    $screen.css(screenshotStyle);
                    $screenImg.css(screenshotStyle);
                }
            },
            showScreenshotAsync : function () {
                var deferred = $.Deferred();

                Device.getScreenshotAsync().done(deferred.resolve).fail(deferred.reject);

                return deferred.promise();
            },
            refreshScreen : function () {
                this.showScreenshotAsync().always(function () {
                    if (slideShowSwitch) {
                        this.refreshScreen();
                    }
                }.bind(this));
            },
            mouseoverScreen : function () {
                if (Device.get('canScreenshot') && !this.loading) {
                    setTimeout(function () {
                        if (checkMousePosition.call(this)) {
                            screenControlView.$el.fadeIn();
                            this.$('.screen img').css({
                                opacity : '.3'
                            });

                            var delegate = setInterval(function () {
                                if (!checkMousePosition.call(this)) {
                                    screenControlView.$el.fadeOut();
                                    this.$('.screen img').css({
                                        opacity : 1
                                    });

                                    clearInterval(delegate);
                                }
                            }.bind(this), 50);
                        }
                    }.bind(this), 200);
                }
            },
            play : function () {
                slideShowSwitch = true;
                this.refreshScreen();
            },
            stop : function () {
                slideShowSwitch = false;
            },
            dbclickScreen : function () {
                if (Device.get('isConnected') && Device.get('isUSB')) {
                    IO.requestAsync(CONFIG.actions.FULL_SCREEN);

                    log({
                        'event' : 'ui.dbclick.welcome.screen'
                    });
                }
            },
            clickButtonAction : function () {
                IO.requestAsync({
                    url : CONFIG.actions.CONNET_PHONE,
                    data : {
                        from : SnapPea.CurrentModule
                    }
                });
            },
            events : {
                'mouseover .screen' : 'mouseoverScreen',
                'dblclick .screen img' : 'dbclickScreen',
                'click .button-action' : 'clickButtonAction'
            }
        });

        var deviceView;

        var factory = _.extend({
            getInstance : function () {
                if (!deviceView) {
                    deviceView = new DeviceView();
                }
                return deviceView;
            }
        });

        return factory;
    });
}(this));
