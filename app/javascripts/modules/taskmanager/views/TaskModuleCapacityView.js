/*global define*/
(function (window) {
    define([
        'underscore',
        'jquery',
        'backbone',
        'doT',
        'Internationalization',
        'Configuration',
        'Log',
        'IO',
        'Device',
        'ui/TemplateFactory',
        'task/views/CapacityTipsView'
    ], function (
        _,
        $,
        Backbone,
        doT,
        i18n,
        CONFIG,
        log,
        IO,
        Device,
        TemplateFactory,
        CapacityTipsView
    ) {
        console.log('TaskModuleCapacityView - File loaded.');

        var TaskModuleCapacityView = Backbone.View.extend({
            className : 'w-task-capacity hbox',
            template : doT.template(TemplateFactory.get('taskManager', 'capacity')),
            initialize : function () {
                this.listenTo(Device, 'change', this.render);
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

                        if (data.externalCapacity === 0) {
                            this.$el.find('.info-sd').hide();
                        }

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

                        this.$el.addClass('show');
                    }.bind(this));
                } else {
                    this.$el.removeClass('show');
                }

                return this;
            },
            openSD : function () {
                var $btn = this.$('.button-open-sd').prop('disabled', true);

                setTimeout(function () {
                    $btn.prop('disabled', false);
                }.bind(this), 2000);

                Device.manageSDCardAsync();
            },
            clickInfoSD : function () {
                this.openSD();

                log({
                    'event' : 'ui.click.task_info_sd'
                });
            },
            clickButtonOpenSD : function () {
                this.openSD();

                log({
                    'event' : 'ui.click.task_button_open_sd'
                });
            },
            clickButtonChangeLocation : function () {
                IO.requestAsync(CONFIG.actions.SAVE_APP_SETTING);

                log({
                    'event' : 'ui.click.task_button_change_location'
                });
            },
            events : {
                'click .info-sd' : 'clickInfoSD',
                'click .button-open-sd' : 'clickButtonOpenSD',
                'click .button-change-location' : 'clickButtonChangeLocation'
            }
        });

        var taskModuleCapacityView;

        var factory = _.extend({
            getInstance : function () {
                if (!taskModuleCapacityView) {
                    taskModuleCapacityView = new TaskModuleCapacityView();
                }
                return taskModuleCapacityView;
            }
        });

        return factory;
    });
}(this));
