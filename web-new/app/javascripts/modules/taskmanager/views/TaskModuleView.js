/*global define*/
(function (window) {
    define([
        'backbone',
        'doT',
        'underscore',
        'ui/TemplateFactory',
        'Configuration',
        'IOBackendDevice',
        'task/views/TaskModuleToolbarView',
        'task/views/TaskListView',
        'task/collections/TasksCollection'
    ], function (
        Backbone,
        doT,
        _,
        TemplateFactory,
        CONFIG,
        IO,
        TaskModuleToolbarView,
        TaskListView,
        TasksCollection
    ) {
        console.log('TaskModuleView - File loaded.');

        var taskListView;

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
                            .css('visibility', 'visible').addClass('w-task-module-fade-in');
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
