/*global define*/
(function (window) {
    define([
        'underscore',
        'ui/TemplateFactory',
        'ui/PopupPanel',
        'IO',
        'Configuration',
        'Log',
        'Device'
    ], function (
        _,
        TemplateFactory,
        PopupPanel,
        IO,
        CONFIG,
        log,
        Device
    ) {
        console.log('TaskNotifierPanelView - File loaded. ');

        var connectHandler = function (Device, isConnected) {
            if (isConnected) {
                this.destory();
            }
        };

        var wifiHandler = function (Device) {
            if (Device.get('isConnected') && Device.get('isUSB')) {
                this.destory();
            }
        };

        var TaskNotifierPanelView = PopupPanel.extend({
            initialize : function () {
                TaskNotifierPanelView.__super__.initialize.apply(this, arguments);
                this.destoryBlurToHideMixin();

                if (this.options.listenToConnect) {
                    this.listenTo(Device, 'change:isConnected', connectHandler);
                }

                if (this.options.listenToWifi) {
                    this.listenTo(Device, 'change', wifiHandler);
                }

                if (this.options.hasOwnProperty('delay')) {
                    this.once('show', function () {
                        setTimeout(this.destory.bind(this), this.options.delay);
                    }, this);
                }
            },
            render : function () {
                TaskNotifierPanelView.__super__.render.apply(this, arguments);
                this.delegateEvents();
            },
            clickButtonConnect : function () {
                IO.requestAsync(CONFIG.actions.CONNET_PHONE);
                this.destory();
            },
            clickButtonClose : function () {
                this.destory();
                this.trigger('remove');
            },
            clickButtonChangeDisk : function () {
                IO.requestAsync(CONFIG.actions.SAVE_SCREENSHOT);
                log({
                    'event' : 'ui.click.taskManger_out_of_space_notifi_button_change_disk'
                });
                this.destory();
            },
            destory : function () {
                this.hide();
                this.stopListening();
            },
            events : {
                'click .button-connect' : 'clickButtonConnect',
                'click .button-close' : 'clickButtonClose',
                'click .button-change-disk' : 'clickButtonChangeDisk'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new TaskNotifierPanelView(args);
            }
        });

        return factory;
    });
}(this));
