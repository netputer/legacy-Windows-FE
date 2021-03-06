/*global define*/
(function (window) {
    define([
        'doT',
        'underscore',
        'Internationalization',
        'FunctionSwitch',
        'Configuration',
        'Log',
        'IOBackendDevice',
        'ui/Toolbar',
        'ui/TemplateFactory',
        'task/collections/TasksCollection',
        'task/views/TaskListView',
        'task/views/DeleteConfirmWindowView'
    ], function (
        doT,
        _,
        i18n,
        FunctionSwitch,
        CONFIG,
        log,
        IO,
        Toolbar,
        TemplateFactory,
        TasksCollection,
        TaskListView,
        DeleteConfirmWindowView
    ) {
        console.log('TaskModuleToolbarView - File loaded.');


        var taskListView;
        var tasksCollection;

        var TaskModuleToolbarView = Toolbar.extend({
            template : doT.template(TemplateFactory.get('taskManager', 'toolbar')),
            render : function () {
                this.$el.html(this.template({}));

                taskListView = TaskListView.getInstance({
                    $observer : this.$('.check-select-all')
                });
                tasksCollection = TasksCollection.getInstance();
                tasksCollection.on('refresh', this.setButtonState, this);

                taskListView.on('select:change', this.setButtonState, this);

                this.setButtonState();
                return this;
            },
            setButtonState : function () {
                var selected = taskListView.selected;

                var selectedLength = selected.length;

                var hasRunning = (function (tasksCollection) {
                    var flag = false;
                    var i;
                    var task;
                    for (i = 0; i < selectedLength; i++) {
                        task = tasksCollection.get(selected[i]);
                        if (task !== undefined) {
                            flag = task.isRunning;
                        }

                        if (flag) {
                            break;
                        }
                    }
                    return flag;
                }(tasksCollection));

                var hasStoped = (function (tasksCollection) {
                    var flag = false;
                    var i;
                    var task;
                    for (i = 0; i < selectedLength; i++) {
                        task = tasksCollection.get(selected[i]);
                        if (task !== undefined) {
                            flag = task.isStoped;
                        }

                        if (flag) {
                            break;
                        }
                    }
                    return flag;
                }(tasksCollection));

                this.$('.button-pause').prop({
                    disabled : selectedLength === 0 || !hasRunning || !tasksCollection.hasPausable(selected)
                });

                this.$('.button-continue').prop({
                    disabled : selectedLength === 0 || !hasStoped
                });

                this.$('.button-delete').prop({
                    disabled : selectedLength === 0
                });
            },
            clickButtonPause : function () {
                tasksCollection.pauseTasksAsync(taskListView.selected);


                log({
                    'event' : 'ui.click.task_pause_item',
                    'position' : 'toolbar'
                });
            },
            clickButtonContinue : function () {
                tasksCollection.startTasksAsync(taskListView.selected);

                log({
                    'event' : 'ui.click.task_start_item',
                    'position' : 'toolbar'
                });
            },
            clickButtonDelete : function () {
                var alertPanel = new DeleteConfirmWindowView.getInstance({
                    $bodyContent : i18n.taskManager.CONFIRM_DELETE_BATCH
                });

                alertPanel.show();

                alertPanel.on('button_yes', function () {
                    tasksCollection.deleteTasksAsync(taskListView.selected, alertPanel.deleteFile);
                    tasksCollection.once('refresh', function () {
                        taskListView.switchDataSet();
                    });
                });

                log({
                    'event' : 'ui.click.task_delete_item',
                    'position' : 'toolbar'
                });
            },
            clickButtonOpenFolder : function () {
                log({
                    'event' : 'ui.click.task.open.download.folder'
                });

                IO.requestAsync({
                    url : CONFIG.actions.TASK_OPEN_DOWNLOAD_DIRECTORY,
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('TaskModuleToolbarView - Open download directory success.');
                        } else {
                            console.error('TaskModuleToolbarView - Open download directory failed. Error info: ' + resp.state_line);
                        }
                    }
                });
            },
            clickSelectAll : function (e) {
                log({
                    'event' : 'ui.click.taskmanager_selecte_all',
                    'check_state' : e.currentTarget.checked
                });
            },
            events : {
                'click .button-pause' : 'clickButtonPause',
                'click .button-continue' : 'clickButtonContinue',
                'click .button-delete' : 'clickButtonDelete',
                'click .button-open-folder' : 'clickButtonOpenFolder',
                'click .check-select-all' : 'clickSelectAll'
            }
        });

        var taskModuleToolbarView;

        var factory = _.extend({
            getInstance : function () {
                if (!taskModuleToolbarView) {
                    taskModuleToolbarView = new TaskModuleToolbarView();
                }
                return taskModuleToolbarView;
            }
        });

        return factory;
    });
}(this));
