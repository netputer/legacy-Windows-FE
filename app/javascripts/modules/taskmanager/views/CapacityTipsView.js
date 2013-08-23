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
        console.log('CapacityTipsView - File loaded.');

        var CapacityTipsView = PopupPanel.extend({
            className : 'w-ui-popup-tip w-layout-hide',
            contentTemplate : doT.template(TemplateFactory.get('taskManager', 'capacity-tips')),
            initialize : function () {
                CapacityTipsView.__super__.initialize.apply(this, arguments);

                // var fillData = function () {
                //     $.when(Device.getDeviceCapacityAsync(), Device.getSDCapacityAsync()).always(function () {
                //         this.fillData(Device);
                //     }.bind(this));
                // };

                // this.listenTo(Device, 'change:isConnected', fillData);

                // this.listenTo(Backbone, 'switchModule', fillData);

                // if (Device.get('isConnected')) {
                //     fillData.call(this);
                // }

                // this.fillData(Device);

                this.$content = $(this.contentTemplate({
                    source : this.source,
                    total : this.total,
                    free : this.free
                }));
            },
            fillData : function (Device) {
                // this.$content = $(this.contentTemplate({
                //     internalCapacity : Device.get('internalCapacity'),
                //     externalCapacity : Device.get('externalCapacity'),
                //     internalFreeCapacity : Device.get('internalFreeCapacity'),
                //     externalFreeCapacity : Device.get('externalFreeCapacity')
                // }));

                if (!(Device.get('externalCapacity') === 0 &&
                        Device.get('externalFreeCapacity') === 0) &&
                        Device.get('hasSDCard')) {
                    this.$content.find('.external-capacity').css('display', '-webkit-box');
                } else {
                    this.$content.find('.external-capacity').hide();
                }
            }
        });

        // var capacityTipsView;

        var factory = _.extend({
            getInstance : function (args) {
                return new CapacityTipsView(_.extend({
                    alignToHost : true
                }, args));
            },
            getClass : function () {
                return CapacityTipsView;
            }
        });

        return factory;
    });
}(this));
