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
                    Device.getCapacityAsync().always(function () {
                        var data = {
                            deviceCapacity : Device.get('deviceCapacity'),
                            deviceFreeCapacity : Device.get('deviceFreeCapacity'),
                            internalSDCapacity : Device.get('internalSDCapacity'),
                            internalSDFreeCapacity : Device.get('internalSDFreeCapacity'),
                            externalSDCapacity : Device.get('externalSDCapacity'),
                            externalSDFreeCapacity : Device.get('externalSDFreeCapacity')
                        };

                        this.$el.html(this.template(data));

                        CapacityTipsView.getInstance({
                            $host : this.$('.info-device'),
                            source : 'phone',
                            total : data.deviceCapacity,
                            free : data.deviceFreeCapacity
                        });

                        CapacityTipsView.getInstance({
                            $host : this.$('.info-sd-internal'),
                            source : 'sdcard',
                            total : data.internalSDCapacity,
                            free : data.internalSDFreeCapacity
                        });

                        CapacityTipsView.getInstance({
                            $host : this.$('.info-sd-external'),
                            source : 'sdcard',
                            total : data.externalSDCapacity,
                            free : data.externalSDFreeCapacity
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
