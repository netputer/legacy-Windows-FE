/*global define, console*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'ui/TemplateFactory',
        'ui/PopupTip',
        'ui/Panel',
        'Configuration',
        'Device',
        'IO',
        'Internationalization',
        'Settings',
        'Log',
        'social/SocialService'
    ], function (
        Backbone,
        _,
        doT,
        $,
        TemplateFactory,
        PopupTip,
        Panel,
        CONFIG,
        Device,
        IO,
        i18n,
        Settings,
        log,
        SocialService
    ) {
        console.log('DeviceToolsView - File loaded.');

        var setTimeout = window.setTimeout;

        var destination = Settings.get('screenShot-destination') !== undefined ? Settings.get('screenShot-destination') : CONFIG.enums.SCREEN_SHOT_DESTINATION_FILE;
        var wrapWithShell = Settings.get('screenShot-wrapWithShell') !== undefined ? Settings.get('screenShot-wrapWithShell') : 1;

        var DeviceToolsView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('welcome', 'device-tools')),
            className : 'w-welcome-device-tools-ctn w-anima-fade-in',
            initialize : function () {
                this.listenTo(Device, 'change', this.toggleView);
            },
            toggleView : function (Device) {
                if (!Device.get('isConnected')) {
                    if (Device.get('isFastADB')) {
                        this.$('.usb-tip').hide();
                        this.$('.btns').show();
                    } else {
                        this.$('.usb-tip').show();
                        this.$('.btns').hide();
                    }
                } else {
                    if (Device.get('isUSB')) {
                        this.$('.usb-tip').hide();
                        this.$('.btns').show();
                    } else {
                        if (Device.get('isWifi')) {
                            Device.canScreenshotAsync().done(function (resp) {
                                this.$('.usb-tip').toggle(!resp.body.value);
                                this.$('.btns').toggle(resp.body.value);
                            }.bind(this));
                        } else {
                            this.$('.usb-tip').show();
                            this.$('.btns').hide();
                        }
                    }
                }
            },
            render : function () {
                this.$el.html(this.template({}));

                this.toggleView(Device);

                return this;
            },
            showSavePathAlert : function (path) {
                if (Settings.get('save_screen_shot_path') !== true) {
                    var panel = new Panel({
                        buttonSet : 'yes_no',
                        $bodyContent : i18n.welcome.SAVE_PATH_FOR_SCREENSHOT_TIP,
                        width : 360,
                        title : i18n.ui.TIP
                    });

                    panel.on('button_yes', function () {
                        IO.requestAsync({
                            url : CONFIG.actions.SET_LAST_USED_DIR,
                            data : {
                                dir : path.slice(0, path.lastIndexOf('\\') + 1)
                            }
                        });
                        Settings.set('save_screen_shot_path', true, true);
                    }).on('button_no', function () {
                        Settings.set('save_screen_shot_path', true, true);
                    });

                    panel.show();
                }
            },
            screenShotAsync : function () {
                var deferred = $.Deferred();

                Device.getScreenshotAsync().done(function () {
                    Device.screenShotAsync(destination, wrapWithShell).done(function (resp) {
                        deferred.resolve(resp);
                    }).fail(function (resp) {
                        deferred.reject(resp);
                    }).always(function (resp) {
                        this.screenShotCallback(resp);
                    }.bind(this));
                }.bind(this)).fail(function (resp) {
                    deferred.reject(resp);
                });

                return deferred.promise();
            },
            showScreenShotTip : function (value, success) {
                var $tip = this.options.deviceView.$('.tip');

                $tip.find('.icon').toggleClass('success', success).toggleClass('fail', !success);
                $tip.find('.des').html(value);

                $tip.fadeIn('fast');

                setTimeout(function () {
                    $tip.fadeOut('fast');
                    this.options.deviceView.fade = false;
                }.bind(this), 3000);
            },
            screenShotCallback : function (resp) {
                if (resp.state_code === 200) {
                    if (destination === CONFIG.enums.SCREEN_SHOT_DESTINATION_CLIPBOARD) {
                        this.showScreenShotTip(i18n.welcome.SCREEN_SHOT_CLIPBOARD_SUCCESS, true);
                    } else {
                        this.showScreenShotTip(i18n.welcome.SAVE_SCREEN_SHOT_SUCCESS, true);

                        if (!resp.body.auto_save_screenshot_dir) {
                            var path = resp.body.screenshot_save_pos;
                            this.showSavePathAlert(path);
                        }
                    }
                } else if (resp.state_code === 402) {
                    this.showScreenShotTip(i18n.welcome.SCREEN_SHOT_CANCELD, false);
                } else {
                    this.showScreenShotTip(i18n.welcome.SCREEN_SHOT_FAILD, false);
                }
            },
            clickButtonFullscreen : function () {
                IO.requestAsync(CONFIG.actions.FULL_SCREEN);

                log({
                    'event' : 'ui.click.welcome.fullscreen'
                });
            },
            clickButtonRefresh : function () {
                this.options.deviceView.showScreenshotAsync();

                log({
                    'event' : 'ui.click.welcome.refresh'
                });
            },
            clickButtonPlay : function () {
                this.$('.button-play')
                    .removeClass('button-play')
                    .data('title', i18n.misc.PAUSE)
                    .addClass('button-pause')
                    .find('span')
                    .removeClass('play-black')
                    .addClass('pause-black');

                this.options.deviceView.play();

                log({
                    'event' : 'ui.click.welcome.play'
                });
            },
            clickButtonPause : function () {
                this.$('.button-pause')
                    .removeClass('button-pause')
                    .addClass('play-black')
                    .data('title', i18n.misc.PLAY)
                    .addClass('button-play')
                    .find('span')
                    .removeClass('pause-black')
                    .addClass('play-black');

                this.options.deviceView.stop();

                log({
                    'event' : 'ui.click.welcome.pause'
                });
            },
            clickButtonScreenShot : function () {
                this.options.deviceView.loading = true;
                this.options.deviceView.fade = true;
                this.screenShotAsync().always(function () {
                    this.options.deviceView.loading = false;
                }.bind(this));

                log({
                    'event' : 'ui.click.welcome.screen.shot',
                    'destination' : destination,
                    'wrapWithShell' : wrapWithShell
                });
            },
            clickButtonShare : function () {
                var screenshot = Device.get('screenshot');

                var rotation;
                var previewDeviceWrap = $('<div>').addClass('preview-device-wrap');
                var preivewDeviceImg = $('<img>').addClass('preview-device-img');

                preivewDeviceImg.attr('src', 'file:///' + screenshot.path + '?date=' + screenshot.date);
                preivewDeviceImg.appendTo(previewDeviceWrap);

                var previewContentSize = SocialService.getPreviewContentSize();
                if (!!wrapWithShell) {
                    var rateW = previewContentSize.width / Device.get('shell').width;
                    var rateH = previewContentSize.height / Device.get('shell').height;
                    var rate = Math.min(rateW, rateH);

                    rotation = Device.get('screenshot').rotation;

                    previewDeviceWrap.css({
                        'width' : parseInt(Device.get('shell').width * rate, 10),
                        'height' : parseInt(Device.get('shell').height * rate, 10) - 2,
                        'position' : 'relative',
                        'background-image' : 'url(' + Device.get('shell').path + ')',
                        'background-size' : '100%',
                        'margin' : 'auto'
                    });

                    var nowWidth = previewDeviceWrap.width();
                    var screenRate = nowWidth / Device.get('shell').width;
                    preivewDeviceImg.css({
                        'position' : 'absolute',
                        'width' : parseInt(Device.get('shell').screenshot.width * screenRate, 10),
                        'height' : parseInt(Device.get('shell').screenshot.height * screenRate, 10),
                        'top' : parseInt(Device.get('shell').screenshot.top * screenRate, 10),
                        'left' : parseInt(Device.get('shell').screenshot.left * screenRate, 10)
                    });

                } else {
                    previewDeviceWrap.css({
                        'background' : 'none',
                        'max-width' : previewContentSize.width,
                        'max-height' : previewContentSize.height,
                        'margin' : '0 auto'
                    });
                    preivewDeviceImg.css({
                        'position' : 'static',
                        'max-width' : previewContentSize.width,
                        'max-height' : previewContentSize.height
                    });

                    rotation = Device.get('screenshot').rotation || 0;
                }

                switch (rotation) {
                case 3:
                case 90:
                    previewDeviceWrap.addClass('turn-right');
                    rotation = 3;
                    break;
                case 2:
                case 180:
                    previewDeviceWrap.addClass('turn-down');
                    rotation = 2;
                    break;
                case 1:
                case 270:
                    previewDeviceWrap.addClass('turn-left');
                    rotation = 1;
                    break;
                }

                var data = {
                    hasPreview : true,
                    previewContent : previewDeviceWrap,
                    shareData : {
                        need_shell : wrapWithShell,
                        pic : screenshot.path,
                        rotation : rotation
                    },
                    type : CONFIG.enums.SOCIAL_SCREENSHOT
                };
                SocialService.show(data);

                log({
                    'event' : 'ui.click.welcome.share'
                });
            },
            events : {
                'click .button-screen-shot' : 'clickButtonScreenShot',
                'click .button-fullscreen' : 'clickButtonFullscreen',
                'click .button-refresh' : 'clickButtonRefresh',
                'click .button-play' : 'clickButtonPlay',
                'click .button-pause' : 'clickButtonPause',
                'click .button-share' : 'clickButtonShare'
            }
        });

        var deviceToolsView;

        var factory = _.extend({
            getInstance : function (args) {
                if (!deviceToolsView) {
                    deviceToolsView = new DeviceToolsView(args);
                }
                return deviceToolsView;
            }
        });

        return factory;
    });
}(this));

