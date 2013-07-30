/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'Device',
        'utilities/StringUtil',
        'ui/TemplateFactory',
        'ui/PopupPanel'
    ], function (
        Backbone,
        _,
        doT,
        $,
        Device,
        StringUtil,
        TemplateFactory,
        PopupPanel
    ) {
        console.log('CapacityView - File loaded.');

        var setTimeout = window.setTimeout;
        var setInterval = window.setInterval;
        var clearInterval = window.clearInterval;

        var CapacityView = PopupPanel.extend({
            className : 'w-ui-popup-tip w-layout-hide',
            contentTemplate : doT.template(TemplateFactory.get('welcome', 'capacity')),
            initialize : function () {
                CapacityView.__super__.initialize.apply(this, arguments);

                this.listenTo(Device, 'change:isConnected', function (Device, isConnected) {
                    $.when(Device.getDeviceCapacityAsync(), Device.getSDCapacityAsync()).done(function () {
                        this.fillData(Device);
                    }.bind(this));
                });

                this.listenTo(Backbone, 'switchModule', function (data) {
                    $.when(Device.getDeviceCapacityAsync(), Device.getSDCapacityAsync()).done(function () {
                        this.fillData(Device);
                    }.bind(this));
                });

                if (Device.get('isConnected')) {
                    $.when(Device.getDeviceCapacityAsync(), Device.getSDCapacityAsync()).done(function () {
                        this.fillData(Device);
                    }.bind(this));
                }

                this.fillData(Device);
            },
            fillData : function (Device) {
                this.$content = $(this.contentTemplate({
                    internalCapacity : Device.get('internalCapacity'),
                    externalCapacity : Device.get('externalCapacity'),
                    internalFreeCapacity : Device.get('internalFreeCapacity'),
                    externalFreeCapacity : Device.get('externalFreeCapacity')
                }));
            }
        });

        var capacityView;

        var factory = _.extend({
            getInstance : function (args) {
                if (!capacityView) {
                    capacityView = new CapacityView(_.extend({
                        alignToHost : false
                    }, args));
                }
                return capacityView;
            }
        });

        return factory;
    });
}(this));
