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
                this.on('button-action', this.clickButtonAction, this);

                this.listenTo(Device, 'change:pc_ip change:device_ip', _.debounce(function (Device) {
                    this.$('.client-ip').html(StringUtil.format(i18n.misc.CLIENT_IP, Device.get('pc_ip')));
                    this.$('.device-ip').html(StringUtil.format(i18n.misc.DEVICE_IP, Device.get('device_ip')));
                }.bind(this), 500));

                this.events = _.extend(this.events, NotInSameWifiView.__super__.events);
            },
            render : function () {

                NotInSameWifiView.__super__.render.apply(this, arguments);
                this.$bodyContent = $(doT.template(TemplateFactory.get('misc', 'not-in-same-wifi'))({
                    type : this.options.type,
                    clientIp : Device.get('pc_ip'),
                    deviceIp : Device.get('device_ip')
                }));

                return this;
            },
            clickButtonAction : function() {
                IO.requestAsync({
                    url : CONFIG.actions.OPEN_URL,
                    data : {
                        url : ''
                    }
                });

                log({
                    'event' : 'ui.click.not-in-same-wifi-help'
                });
            },
            events : {
                'click .button-action' : 'clickButtonAction'
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