/*global define*/
(function (window) {
    define([
        'jquery',
        'backbone',
        'doT',
        'underscore',
        'ui/TemplateFactory',
        'ui/AlertWindow',
        'Internationalization',
        'Configuration',
        'FunctionSwitch',
        'Log',
        'IOBackendDevice',
        'task/views/TaskModuleToolbarView',
        'task/views/TaskListView',
        'task/views/TaskModuleCapacityView'
    ], function (
        $,
        Backbone,
        doT,
        _,
        TemplateFactory,
        AlertWindow,
        i18n,
        CONFIG,
        FunctionSwitch,
        log,
        IO,
        TaskModuleToolbarView,
        TaskListView,
        TaskModuleCapacityView
    ) {
        console.log('TaskModuleView - File loaded.');

        var lastView;
        var taskListView;

        var performanceHandler;
        var setInterval = window.setInterval;
        var clearInterval = window.clearInterval;

        var hasRecordFPS = false;
        var timeoutHandle;

        var pushNotificationView;
        var downloadHandler = function (msg) {

            var isClick = false;
            if (!pushNotificationView) {

                pushNotificationView = new AlertWindow({
                    draggable : true,
                    disposableName : 'batch-send-to-phone',
                    disableX : true,
                    buttons : [{
                        $button : $('<button/>').html(i18n.taskManager.SEND_TO_PHONE).addClass('button_yes primary'),
                        eventName : 'button_yes'
                    }, {
                        $button : $('<button/>').html(i18n.taskManager.DO_NOT_SEND_TO_PHONE).addClass('button_cancel'),
                        eventName : 'button_cancel'
                    }],
                    $bodyContent : doT.template(TemplateFactory.get('taskManager', 'push-notification'))({})
                });
            }

            var yesHandler;
            var cancelHandler;
            yesHandler = function () {
                IO.requestAsync({
                    url : msg.url + '&push=true'
                });

                log({
                    'event' : 'ui.click.send_to_phone',
                    'type'  : 'yes',
                    'click' : isClick
                });

                if (cancelHandler) {
                    pushNotificationView.off('button_cancel', cancelHandler);
                }
            };

            cancelHandler = function () {
                IO.requestAsync({
                    url : msg.url + '&push=false'
                });

                log({
                    'event' : 'ui.click.send_to_phone',
                    'type'  : 'NO',
                    'click' : isClick
                });

                if (yesHandler) {
                    pushNotificationView.off('button_yes', yesHandler);
                }
            };

            pushNotificationView.once('button_yes', yesHandler);
            pushNotificationView.once('button_cancel', cancelHandler);
            pushNotificationView.show();

            pushNotificationView.$('.button_yes').one('click', function () {
                isClick = true;
            });

            pushNotificationView.$('.button_cancel').one('click', function () {
                isClick = true;
            });
        };

        var TaskModuleView = Backbone.View.extend({
            className : 'w-task-module-main module-main vbox',
            template : doT.template(TemplateFactory.get('taskManager', 'main')),
            initialize : function () {
                var rendered = false;
                var show = false;
                Object.defineProperties(this, {
                    rendered : {
                        set : function (value) {
                            rendered = value;
                        },
                        get : function () {
                            return rendered;
                        }
                    },
                    show : {
                        set : function (value) {
                            show = value;
                        },
                        get : function () {
                            return show;
                        }
                    }
                });

                Backbone.on('switchModule', function (data) {
                    lastView = data.module;
                    if (data.module !== 'task' && this.show) {
                        this.slideOut();
                    }
                }.bind(this));

                IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.WEB_NAVIGATE
                }, function (msg) {

                    if (msg.type !== CONFIG.enums.NAVIGATE_TYPE_TASK_MANAGER && this.show) {
                        this.slideOut();
                    }

                }, this);

                IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.TASK_SHOW_PUSH_WINDOW
                }, downloadHandler, this);
            },
            render : function () {
                this.$el.html(this.template({}));
                this.$('.ctn').append(TaskModuleToolbarView.getInstance().render().$el);

                taskListView = TaskListView.getInstance();

                this.$('.ctn').append(taskListView.render().$el);

                if (FunctionSwitch.ENABLE_TASKMANAGER_CAPACITY) {
                    this.$('.ctn').append(TaskModuleCapacityView.getInstance().render().$el);
                }

                this.rendered = true;

                return this;
            },
            slideIn : function () {

                clearTimeout(timeoutHandle);

                this.show = true;

                if (!hasRecordFPS) {
                    hasRecordFPS = true;
                    this.recordFPS();
                }

                lastView = SnapPea.CurrentModule;
                this.$el.toggleClass('hide', !this.show);

                timeoutHandle = setTimeout(function () {
                    Backbone.trigger('taskManager.showModule', 'task');
                    taskListView.enableUpdateData = true;
                    taskListView.$('.w-ui-smartlist').addClass('visible');
                }, 600);
            },
            slideOut : function () {

                clearTimeout(timeoutHandle);

                if (lastView){
                    Backbone.trigger('taskManager.showModule', lastView);
                }
                this.show = false;
                this.$el.toggleClass('hide', !this.show);

                timeoutHandle = setTimeout(function () {
                    taskListView.enableUpdateData = false;
                    taskListView.$('.w-ui-smartlist').removeClass('visible');
                }, 600);

            },
            recordFPS : function () {

                this.$el.find('.ctn').one('webkitAnimationEnd', function () {
                    clearInterval(performanceHandler);
                });

                this.$el.find('.ctn').one('webkitAnimationStart', function () {
                    performanceHandler = setInterval(function () {
                        var index = _.uniqueId('taskmanager_slide_');
                        window.wandoujia.data = window.wandoujia.data || {};
                        window.wandoujia.data[index] = {'type' : 'taskmanager_slide'};
                        window.wandoujia.getFPS('recordFPS', index);
                    }, 20);
                });
            },
            clickButtonClose : function () {
                this.slideOut();
            },
            events : {
                'click .button-close' : 'clickButtonClose'
            }
        });

        var taskModuleView;

        var factory = _.extend({
            getInstance : function () {
                if (!taskModuleView) {
                    taskModuleView = new TaskModuleView();
                }
                return taskModuleView;
            },
            preload : function () {
                return;
            }
        });

        return factory;
    });
}(this));
