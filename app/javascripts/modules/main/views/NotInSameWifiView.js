/*global define*/
(function (window) {
    define([
        'underscore',
        'jquery',
        'doT',
        'ui/TemplateFactory',
        'ui/Panel',
        'Configuration',
        'Log',
        'IO',
        'Device',
        'utilities/StringUtil',
        'Internationalization',
        'Environment'
    ], function (
        _,
        $,
        doT,
        TemplateFactory,
        Panel,
        CONFIG,
        log,
        IO,
        Device,
        StringUtil,
        i18n,
        Environment
    ) {
        console.log('NotInSameWifiView - File loaded.');

        var NotInSameWifiView = Panel.extend({
            initialize : function () {
                NotInSameWifiView.__super__.initialize.apply(this, arguments);

                this.listenTo(Device, 'change:pcIp change:deviceIp', _.debounce(function (Device) {
                    this.$('.client-ip').html(StringUtil.format(i18n.misc.CLIENT_IP, Device.get('pcIp')));
                    this.$('.device-ip').html(StringUtil.format(i18n.misc.DEVICE_IP, Device.get('deviceIp')));
                }.bind(this), 500));

                this.events = _.extend(this.events, NotInSameWifiView.__super__.events);
            },
            render : function () {

                NotInSameWifiView.__super__.render.apply(this, arguments);
                this.$bodyContent = $(doT.template(TemplateFactory.get('misc', 'not-in-same-wifi'))({
                    type : this.options.type,
                    clientIp : Device.get('pcIp'),
                    deviceIp : Device.get('deviceIp')
                }));

                return this;
            },
            clickButtonHelp : function() {
                log({
                    'event' : 'ui.click.main_not_in_same_wifi_help'
                });
            },
            events : {
                'click .button-help' : 'clickButtonHelp'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new NotInSameWifiView(_.extend(args, {
                    width : '435px',
                    height: '250px',
                    title : i18n.misc.ALERT,
                    buttons : [{
                        $button : $('<button>').html(i18n.welcome.I_KNOW).addClass('primary'),
                        eventName : 'button_yes'
                    }]
                }));
            }
        });

        return factory;

    });
}(this));
