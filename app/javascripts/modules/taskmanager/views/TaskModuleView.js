/*global define*/
(function (window) {
    define([
        'backbone',
        'doT',
        'underscore',
        'ui/TemplateFactory',
        'ui/AlertWindow',
        'Configuration',
        'IOBackendDevice',
        'task/views/TaskModuleToolbarView',
        'task/views/TaskListView',
        'task/collections/TasksCollection',
        'Log'
    ], function (
        Backbone,
        doT,
        _,
        TemplateFactory,
        AlertWindow,
        CONFIG,
        IO,
        TaskModuleToolbarView,
        TaskListView,
        TasksCollection,
        log
    ) {
        console.log('TaskModuleView - File loaded.');

        var taskListView;

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
                    },{
                        $button : $('<button/>').html(i18n.taskManager.DO_NOT_SEND_TO_PHONE).addClass('button_cancel'),
                        eventName : 'button_cancel'
                    }],
                    $bodyContent : doT.template(TemplateFactory.get('taskManager', 'push-notification'))({})
                });
            }

            var yesHandler = function () {
                IO.requestAsync({
                    url : msg.url + '&push=true'
                });

                log({
                    'event' : 'ui.click.send_to_phone',
                    'type'  : 'yes',
                    'click' : isClick
                });

                pushNotificationView.off('button_cancel', cancelHandler);
            };

            var cancelHandler = function () {
                IO.requestAsync({
                    url : msg.url + '&push=false'
                });

                log({
                    'event' : 'ui.click.send_to_phone',
                    'type'  : 'yes',
                    'click' : isClick
                });

                pushNotificationView.off('button_yes', yesHandler);
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
                    if (data.module !== 'task') {
                        this.slideOut();
                    }
                }.bind(this));

                IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.WEB_NAVIGATE
                }, function (msg) {
                    this.slideOut();
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

                this.rendered = true;

                return this;
            },
            slideIn : function () {
                if (!this.show && !this.$el.hasClass('w-task-module-fade-in')) {
                    var showHandler = function () {
                        this.$el.removeClass('w-task-module-fade-in');
                        this.show = true;
                    }.bind(this);

                    this.$('.w-task-mask').css('background-color', 'rgba(0, 0, 0, .4)');
                    this.$el.one('webkitAnimationEnd', showHandler)
                            .css('visibility', 'visible')
                            .addClass('w-task-module-fade-in');
                }
            },
            slideOut : function () {
                if (this.show && !this.$el.hasClass('w-task-module-fade-out')) {
                    var hideHandler = function () {
                        this.show = false;
                        this.$el.css({
                            visibility : 'hidden'
                        }).removeClass('w-task-module-fade-out');
                    }.bind(this);
                    this.$('.w-task-mask').css('background-color', 'rgba(0, 0, 0, 0)');
                    this.$el.one('webkitAnimationEnd', hideHandler)
                            .addClass('w-task-module-fade-out');
                }
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
