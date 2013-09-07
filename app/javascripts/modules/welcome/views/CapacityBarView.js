/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'Settings',
        'IO',
        'Configuration',
        'Log',
        'Device',
        'Internationalization',
        'ui/TemplateFactory',
        'task/views/CapacityTipsView'
    ], function (
        Backbone,
        _,
        doT,
        $,
        Settings,
        IO,
        CONFIG,
        log,
        Device,
        i18n,
        TemplateFactory,
        CapacityTipsView
    ) {

        var CapacityBarView = Backbone.View.extend({
            className : 'w-welcome-capacitybar hbox',
            template : doT.template(TemplateFactory.get('welcome', 'capacitybar')),
            initialize : function () {
                this.listenTo(Device, 'change:isConnected', this.render);
                this.listenTo(Backbone, 'switchModule', this.render);
            },
            render : function () {
                if (Device.get('isConnected')) {
                    $.when(Device.getDeviceCapacityAsync(), Device.getSDCapacityAsync()).always(function () {
                        var data = {
                            internalCapacity : Device.get('internalCapacity'),
                            externalCapacity : Device.get('externalCapacity'),
                            internalFreeCapacity : Device.get('internalFreeCapacity'),
                            externalFreeCapacity : Device.get('externalFreeCapacity')
                        };

                        this.$el.html(this.template(data));

                        CapacityTipsView.getInstance({
                            $host : this.$('.info-device'),
                            source : 'phone',
                            total : data.internalCapacity,
                            free : data.internalFreeCapacity
                        });

                        CapacityTipsView.getInstance({
                            $host : this.$('.info-sd'),
                            source : 'sdcard',
                            total : data.externalCapacity,
                            free : data.externalFreeCapacity
                        });
                    }.bind(this));
                }

                return this;
            }
        });

        var factory = _.extend({
            getInstance : function () {
                return new CapacityBarView();
            }
        });

        return factory;
    });
}(this));
