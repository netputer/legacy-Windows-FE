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

        var isOpened = false;

        var TaskModuleCapacityView = Backbone.View.extend({
            className : 'w-task-capacity hbox',
            template : doT.template(TemplateFactory.get('taskManager', 'capacity')),
            initialize : function () {

                var isOpened = false;
                var checkHandle;
                Object.defineProperties(this, {
                    isOpened : {
                        get :  function () {
                            return isOpened;
                        },
                        set : function (value) {
                            isOpened = value;
                        }
                    },
                    checkHandle : {
                        get : function () {
                            return checkHandle;
                        },
                        set : function (value) {
                            checkHandle = value;
                        }
                    }
                });

                this.listenTo(Device, 'change:isConnected change:isMounted change:deviceFreeCapacity change:internalSDFreeCapacity change:externalSDFreeCapacity', _.debounce(this.checkCapacity.bind(this), 200));

                this.listenTo(Backbone, 'taskManager:toggle', function (data) {
                    this.isOpened = (data.status === 'open');
                    this.checkCapacity();
                });

                this.listenTo(Backbone, 'switchModule', function (data) {
                    this.isOpened = (data.module === 'task');
                    this.checkCapacity();
                });
            },
            checkCapacity : function () {
                clearInterval(this.checkHandle);
                if (Device.get('isConnected') && this.isOpened) {
                    this.checkHandle = setInterval(function() {
                        Device.getCapacityAsync().always(this.setContent.bind(this));
                    }.bind(this), 3000);
                } else {
                    this.$('button').prop('disabled', true);
                    this.$('progress').addClass('disabled');
                }
            },
            render : function () {

                this.$el.html(this.template({}))
                        .find('button').prop('disabled', true)
                        .find('progress').addClass('disabled');
                return this;
            },
            setContent : function () {
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

                this.$el.html(this.template(data));

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
            },
            openSD : function (path) {
                var $btn = this.$('.button-open-sd').prop('disabled', true);

                setTimeout(function () {
                    $btn.prop('disabled', false);
                }.bind(this), 2000);

                Device.manageSDCardAsync(path);
            },
            clickInfoSD : function (e) {
                var path = $(e.currentTarget).data('path');
                this.openSD(path);

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
                'click .info-sd-internal' : 'clickInfoSD',
                'click .info-sd-external' : 'clickInfoSD',
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
