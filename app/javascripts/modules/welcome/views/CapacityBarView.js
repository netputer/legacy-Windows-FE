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
                this.listenTo(Device, 'change:screenshot', function (Device, screenshot) {
                    this.$el.toggleClass('left', screenshot.rotation === 1 || screenshot.rotation === 3);
                });
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
                            internalSDPath : Device.get('internalSDPath'),
                            externalSDCapacity : Device.get('externalSDCapacity'),
                            externalSDFreeCapacity : Device.get('externalSDFreeCapacity'),
                            externalSDPath : Device.get('externalSDPath')
                        };

                        this.$el.html(this.template(data))
                            .addClass('show')
                            .toggleClass('left', Device.get('screenshot').rotation === 1 || Device.get('screenshot').rotation === 3);

                        CapacityTipsView.getInstance({
                            $host : this.$('.info-device'),
                            source : 'phone',
                            total : data.deviceCapacity,
                            free : data.deviceFreeCapacity
                        });

                        if (data.internalSDCapacity > 0) {
                            CapacityTipsView.getInstance({
                                $host : this.$('.info-sd-internal'),
                                source : 'sdcard',
                                total : data.internalSDCapacity,
                                free : data.internalSDFreeCapacity
                            });
                        }

                        if (data.externalSDCapacity > 0) {
                            CapacityTipsView.getInstance({
                                $host : this.$('.info-sd-external'),
                                source : 'sdcard',
                                total : data.externalSDCapacity,
                                free : data.externalSDFreeCapacity
                            });
                        }
                    }.bind(this));
                } else {
                    this.$el.removeClass('show');
                }

                return this;
            },
            clickInternalSD : function (e) {
                var path = $(e.currentTarget).data('path');
                Device.manageSDCardAsync(path);

                log({
                    'event' : 'ui.click.welcome_internal_sd'
                });
            },
            clickExternalSD : function (e) {
                var path = $(e.currentTarget).data('path');
                Device.manageSDCardAsync(path);

                log({
                    'event' : 'ui.click.welcome_external_sd'
                });
            },
            events : {
                'click .info-sd-internal' : 'clickInternalSD',
                'click .info-sd-external' : 'clickExternalSD'
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
