/*global define*/
(function (window) {
    define([
        'underscore',
        'backbone',
        'doT',
        'ui/TemplateFactory',
        'Device',
        'Configuration',
        'Internationalization',
        'IOBackendDevice'
    ], function (
        _,
        Backbone,
        doT,
        TemplateFactory,
        Device,
        CONFIG,
        i18n,
        IO
    ) {
        console.log('FastUSBNotificationView - File loaded. ');

        var FastUSBNotificationView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('misc', 'adb-notif')),
            className : 'w-device-usb-detect',
            initialize : function () {
                IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.DEVICE_USB_DETECT
                }, this.stateHandler, this);

                this.listenTo(Device, 'change:isFastADB', function (Device, isFastADB) {
                    if (isFastADB) {
                        this.$el.slideDown();
                    } else {
                        this.$el.slideUp();
                    }
                });

                this.listenTo(Backbone, 'switchModule', function (data) {
                    if (data.module === 'doraemon' || data.module === 'browser' || data.module === 'gallery') {
                        this.$el.css({
                            visibility : 'hidden'
                        });
                    } else {
                        this.$el.css({
                            visibility : 'visible'
                        });
                    }
                });
            },
            render : function () {
                this.$el.html(this.template({}));
                setTimeout(function () {
                    var currentModule = window.SnapPea.CurrentModule;
                    if (currentModule === 'doraemon' || currentModule === 'browser' || currentModule === 'gallery') {
                        this.$el.css({
                            visibility : 'hidden'
                        });
                    }
                    if (Device.get('isFastADB')) {
                        this.$el.slideDown();
                    }
                }.bind(this), 0);

                IO.requestAsync(CONFIG.actions.DEVICE_GET_USB_DETECT_STATE).done(function (resp) {
                    if (resp.state_code === 200) {
                        this.stateHandler(resp.body.value);
                    }
                }.bind(this));
                return this;
            },
            stateHandler : function (data) {
                var wording = {
                    '17' : i18n.misc.USB_APK_INSTALLING,
                    '18' : i18n.misc.USB_APK_UPDATING,
                    '-19' : i18n.misc.USB_INSTALL_FAILED,
                    '-20' : i18n.misc.USB_INSTALL_APK_INVALID,
                    '-21' : i18n.misc.USB_UPDATE_FAILED,
                    '-26' : i18n.misc.USB_ROM_TOO_OLD,
                    '-27' : i18n.misc.USB_INSTALL_FAILED_NO_MORE_SPACE,
                    '-31' : i18n.misc.USB_INSTALL_FAILED_INTERNAL_ERROR
                };

                var text = wording[data];

                if (text) {
                    this.$('.tip').html(text);
                } else {
                    if (data > 0) {
                        this.$('.tip').html(i18n.misc.USB_LOADING_INFO);
                    } else {
                        this.$('.tip').html(i18n.misc.USB_LOADING_INFO_FAILED);
                    }
                }

                this.$el.toggleClass('loading', data > 0);
                this.$el.toggleClass('error', data < 0);
            },
            clickButtonRetry : function () {
                IO.requestAsync(CONFIG.actions.DEVICE_USB_REDETECT);
            },
            events : {
                'click .button-retry' : 'clickButtonRetry'
            }
        });

        var fastUSBNotificationView;

        var factory = _.extend({
            getInstance : function () {
                if (!fastUSBNotificationView) {
                    fastUSBNotificationView = new FastUSBNotificationView();
                }
                return fastUSBNotificationView;
            }
        });

        return factory;
    });
}(this));
