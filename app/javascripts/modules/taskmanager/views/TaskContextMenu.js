/*global define, _, $*/
(function (window) {
    define([
        'ui/Menu',
        'ui/behavior/ClickToHideMixin',
        'ui/AlertWindow',
        'Internationalization',
        'task/collections/TasksCollection',
        'task/views/DeleteConfirmWindowView'
    ], function (
        Menu,
        ClickToHideMixin,
        AlertWindow,
        i18n,
        TasksCollection,
        DeleteConfirmWindowView
    ) {
        console.log('TaskContextMenu - File loaded. ');

        var tasksCollection;

        var TaskContextMenu = Menu.extend({
            initialize : function () {
                TaskContextMenu.__super__.initialize.apply(this, arguments);
                ClickToHideMixin.mixin(this);

                tasksCollection = TasksCollection.getInstance();

                this.addItems();

                this.on('select', function (data) {
                    switch (data.value) {
                    case 'pause':
                        this.pauseTasks();
                        break;
                    case 'delete':
                        this.deleteTasks();
                        break;
                    case 'resume':
                        this.resumeTasks();
                        break;
                    }
                }, this);
            },
            show : function () {
                TaskContextMenu.__super__.show.apply(this, arguments);

                log({
                    'event' : 'ui.show.taskmanager_context_menu'
                });
            },
            pauseTasks : function () {
                tasksCollection.pauseTasksAsync(this.options.selected);

                log({
                     'event' : 'ui.show.task_pause_item',
                     'position' : 'contextmenu'
                });
            },
            deleteTasks : function () {
                var alertPanel = new DeleteConfirmWindowView.getInstance({
                    $bodyContent : i18n.taskManager.CONFIRM_DELETE_BATCH
                });

                alertPanel.show();

                alertPanel.on('button_yes', function () {
                    tasksCollection.deleteTasksAsync(this.options.selected, alertPanel.deleteFile);
                }, this);

                log({
                     'event' : 'ui.show.task_delete_item',
                     'position' : 'contextmenu'
                });
            },
            resumeTasks : function () {
                tasksCollection.startTasksAsync(this.options.selected);

                log({
                     'event' : 'ui.show.task_resume_item',
                     'position' : 'contextmenu'
                });
            },
            addItems : function () {
                var selected = this.options.selected;

                var hasRunning = (function () {
                    var flag = false;
                    var i;
                    var len = selected.length;
                    for (i = 0; i < len; i++) {
                        flag = tasksCollection.get(selected[i]).isRunning;
                        if (flag) {
                            break;
                        }
                    }
                    return flag;
                }());

                var hasStoped = (function () {
                    var flag = false;
                    var i;
                    var len = selected.length;
                    for (i = 0; i < len; i++) {
                        flag = tasksCollection.get(selected[i]).isStoped;
                        if (flag) {
                            break;
                        }
                    }
                    return flag;
                }());

                this.items = [{
                    type : 'normal',
                    name : 'pause',
                    value : 'pause',
                    label : i18n.misc.PAUSE,
                    disabled : !hasRunning || !tasksCollection.hasPausable(selected)
                }, {
                    type : 'normal',
                    name : 'resume',
                    value : 'resume',
                    label : i18n.ui.CONTINUE,
                    disabled : !hasStoped
                }, {
                    type : 'normal',
                    name : 'delete',
                    value : 'delete',
                    label : i18n.misc.DELETE,
                    disabled : false
                }];
            }
        });

        var taskContextMenu;

        var factory = _.extend({
            getInstance : function (args) {
                if (!taskContextMenu) {
                    taskContextMenu = new TaskContextMenu(args);
                } else {
                    taskContextMenu.options.selected = args.selected;
                    taskContextMenu.addItems();
                    taskContextMenu.render();
                }
                return taskContextMenu;
            }
        });

        return factory;
    });
}(this));
