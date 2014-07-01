/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'jquery',
        'doT',
        'Log',
        'IOBackendDevice',
        'Device',
        'Internationalization',
        'ui/TemplateFactory'
    ], function (
        Backbone,
        _,
        $,
        doT,
        log,
        IO,
        Device,
        i18n,
        TemplateFactory
    ) {

        console.log('UsbTipView  - File loaded');

        var UsbTipView = Backbone.View.extend({
            className : 'w-misc-usb-tips',
            initialize : function () {

                if (this.options.title !== null) {
                    this.options.title = window.decodeURIComponent(this.options.title);
                    template = doT.template(TemplateFactory.get('misc', 'usb-app-tip'));
                } else if (this.options.usbError === null || this.options.usbError === true) {
                    template = doT.template(TemplateFactory.get('misc', 'usb-tip'));

                    var state;
                    if (Device.get('isWifi')) {
                        state = 'wifi';
                    } else if (Device.get('isFastADB')) {
                        state = 'isFastADB';
                    } else {
                        state = 'disconnected';
                    }

                    log({
                        'event': 'ui.show.new_wifi',
                        'type' : this.options.from,
                        'state' : state
                    });

                } else {
                    this.$el.addClass('error');
                    template = doT.template(TemplateFactory.get('misc', 'usb-error-tip'));
                }
            },
            render : function () {

                var title = i18n.misc.USE_USB_TITLE;
                var showDefault = true;
                if (this.options.from) {
                    title = i18n.misc['USB_TITLE_' + this.options.from.toUpperCase()];
                    showDefault = false;
                }

                this.$el.html(template({
                    title : title,
                    name : this.options.title,
                    showDefault : showDefault
                }));
                return this;
            },
            clickButtonClose : function () {
                window.SnapPea.AppWindow.close();
            },
            clickButtonAction : function () {
                window.location.href = window.location.href + '?usbError=true';
            },
            clickButtonHelp : function () {
                IO.requestAsync({
                    url : CONFIG.actions.OPEN_URL,
                    data : {
                        url : i18n.misc.USB_TIP_HELP
                    }
                });

                log({
                    'event' : 'ui.click.new_wifi_tip',
                    'type' : 'help'
                });
            },
            clickButtonFeedback : function () {
                IO.requestAsync({
                    url : CONFIG.actions.OPEN_URL,
                    data : {
                        url : i18n.misc.USB_TIP_FEEDBACK
                    }
                });

                log({
                    'event' : 'ui.click.new_wifi_tip',
                    'type' : 'feedback'
                });

            },
            events : {
                'click .button-close' : 'clickButtonClose',
                'click .button-action' : 'clickButtonAction',
                'click .button-help' : 'clickButtonHelp',
                'click .button-feedback' : 'clickButtonFeedback'
            }
        });

        var factory = _.extend({
            getInstance : function (options) {
                return new UsbTipView(options);
            }
        });

        return factory;
    });
}(this));

