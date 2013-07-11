/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'ui/TemplateFactory',
        'ui/PopupPanel',
        'utilities/StringUtil',
        'task/collections/TasksCollection'
    ], function (
        Backbone,
        _,
        doT,
        TemplateFactory,
        PopupPanel,
        StringUtil,
        TasksCollection
    ) {
        console.log('TaskDashboardView - File loaded.');

        var tasksCollection;

        var ContentView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('taskManager', 'task-dashboard')),
            tagName : 'ul',
            className : 'w-task-dashboard',
            initialize : function () {
                tasksCollection = TasksCollection.getInstance();

                tasksCollection.on('refresh', this.render, this);
            },
            render : function () {
                this.$el.html(this.template({
                    speed : tasksCollection.speed,
                    active : tasksCollection.activeCount,
                    complete : tasksCollection.length - tasksCollection.activeCount - tasksCollection.errorCount,
                    error : tasksCollection.errorCount
                }));

                return this;
            }
        });

        var TaskDashboardView = PopupPanel.extend({
            className : 'w-ui-popup-tip w-layout-hide',
            initialize : function () {
                TaskDashboardView.__super__.initialize.apply(this, arguments);
                this.$content = new ContentView().render().$el;
                this.alignToHost = false;
                this.blurDelay = 100;

                tasksCollection = TasksCollection.getInstance();

                tasksCollection.on('refresh', function (tasksCollection) {
                    if (tasksCollection.activeCount === 0) {
                        this.destoryBlurToHideMixin();
                    } else {
                        this.initBlurToHideMixin();
                    }
                }, this);

                if (tasksCollection.activeCount === 0) {
                    this.initBlurToHideMixin();
                }
            }
        });

        var taskDashboardView;

        var factory = _.extend({
            getInstance : function (args) {
                if (!taskDashboardView) {
                    taskDashboardView = new TaskDashboardView(args);
                }
                return taskDashboardView;
            }
        });

        return factory;
    });
}(this));
