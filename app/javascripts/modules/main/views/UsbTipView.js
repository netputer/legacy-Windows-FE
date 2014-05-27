/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'jquery',
        'doT',
        'Device',
        'Internationalization',
        'ui/TemplateFactory'
    ], function (
        Backbone,
        _,
        $,
        doT,
        Device,
        i18n,
        TemplateFactory
    ) {

        console.log('UsbTipView  - File loaded');

        var UsbTipView = Backbone.View.extend({
            className : 'w-misc-usb-tips',
            initialize : function () {

                if (this.options.usbError === null || this.options.usbError === true) {
                    template = doT.template(TemplateFactory.get('misc', 'usb-tip'));
                } else {
                    this.$el.addClass('error');
                    template = doT.template(TemplateFactory.get('misc', 'usb-error-tip'));
                }

            },
            render : function () {

                var titleStr = i18n.misc.USE_USB_TITLE;
                if (this.options.from && this.options.from !== 'welcome') {
                    titleStr = i18n.misc['USB_TITLE_' + this.options.from.toUpperCase()];
                }

                this.$el.html(template({
                    title : titleStr
                }));
                return this;
            },
            clickButtonClose : function () {
                window.SnapPea.AppWindow.close();
            },
            clickButtonAction : function () {
                window.location.href = window.location.href + '?usbError=true';
            },
            clickButtonFeedback : function () {
                IO.requestAsync({
                    url : CONFIG.actions.OPEN_URL,
                    data : {
                        url : i18n.misc.USB_TIP_HELP
                    }
                });
            },
            clickButtonHelp : function () {
                IO.requestAsync({
                    url : CONFIG.actions.OPEN_URL,
                    data : {
                        url : i18n.misc.USB_TIP_FEEDBACK
                    }
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

