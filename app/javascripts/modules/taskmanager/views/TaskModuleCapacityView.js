/*global define*/
(function (window) {
    define([
        'underscore',
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
            render : function () {
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

                this.setButtonState();
                return this;
            },
            setButtonState : function () {
                return;
            },
            clickButtonOpenSD : function () {
                var $btn = this.$('.button-open-sd').prop('disabled', true);

                setTimeout(function () {
                    $btn.prop('disabled', false);
                }.bind(this), 2000);

                Device.manageSDCardAsync();

                // log({
                //     'event' : 'ui.click.welcome_button_manage_sd'
                // });
            },
            clickButtonChangeLocation : function () {
                IO.requestAsync(CONFIG.actions.SAVE_APP_SETTING);
            },
            events : {
                'click .info-sd' : 'clickButtonOpenSD',
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
