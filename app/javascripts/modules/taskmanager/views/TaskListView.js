/*global define*/
(function (window) {
    define([
        'backbone',
        'doT',
        'underscore',
        'ui/TemplateFactory',
        'ui/SmartList',
        'task/collections/TasksCollection',
        'task/views/TaskListItemView',
        'task/views/TaskContextMenu',
        'Internationalization'
    ], function (
        Backbone,
        doT,
        _,
        TemplateFactory,
        SmartList,
        TasksCollection,
        TaskListItemView,
        TaskContextMenu,
        i18n
    ) {
        console.log('TaskListView- File loaded.');

        var taskList;
        var tasksCollection;

        var TaskListView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('taskManager', 'task-list')),
            className : 'w-task-list-ctn vbox',
            initialize : function () {
                Object.defineProperties(this, {
                    selected : {
                        get : function () {
                            return taskList ? taskList.selected : [];
                        }
                    }
                });

                tasksCollection = TasksCollection.getInstance();
            },
            buildList : function () {
                taskList = new SmartList({
                    itemView : TaskListItemView.getClass(),
                    dataSet : [{
                        name : 'default',
                        getter : tasksCollection.getAll
                    }],
                    keepSelect : false,
                    $observer : this.options.$observer,
                    itemHeight : 45,
                    enableContextMenu : true,
                    listenToCollection : tasksCollection,
                    emptyTip : i18n.taskManager.EMPTY_LIST
                });

                taskList.listenTo(tasksCollection, 'refresh', function (tasksCollection) {
                    this.switchSet('default', tasksCollection.getAll);
                });

                taskList.listenTo(tasksCollection, 'update', function () {
                    this.loading = true;

                    tasksCollection.once('refresh', function () {
                        this.loading = false;
                    }, this);
                });

                this.$el.append(taskList.render().$el);

                this.listenTo(taskList, 'select:change', this.selectChangeHandler);
                this.listenTo(taskList, 'contextMenu', this.showContextMenu);
            },
            selectChangeHandler : function (selected) {
                this.trigger('select:change', selected);
            },
            showContextMenu : function () {
                TaskContextMenu.getInstance({
                    selected : taskList.selected
                }).show();
            },
            render : function () {
                this.$el.html(this.template({}));

                this.buildList();
                return this;
            },
            remove : function () {
                taskList.remove();
                TaskListView.__super__.remove.call(this);
            }
        });

        var taskListView;

        var factory = _.extend({
            getInstance : function (args) {
                if (!taskListView) {
                    taskListView = new TaskListView(args);
                }
                return taskListView;
            }
        });

        return factory;
    });
}(this));
