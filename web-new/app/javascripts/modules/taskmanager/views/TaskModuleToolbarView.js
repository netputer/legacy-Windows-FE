/*global define*/
(function (window, undefined) {
    define([
        'doT',
        'underscore',
        'Internationalization',
        'Configuration',
        'Log',
        'IOBackendDevice',
        'ui/Toolbar',
        'ui/TemplateFactory',
        'ui/UIHelper',
        'task/collections/TasksCollection',
        'task/views/TaskListView',
        'task/views/DeleteConfirmWindowView'
    ], function (
        doT,
        _,
        i18n,
        CONFIG,
        log,
        IO,
        Toolbar,
        TemplateFactory,
        UIHelper,
        TasksCollection,
        TaskListView,
        DeleteConfirmWindowView
    ) {
        console.log('TaskModuleToolbarView - File loaded.');

        var EventsMapping = UIHelper.EventsMapping;

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
            },
            clickButtonContinue : function () {
                tasksCollection.startTasksAsync(taskListView.selected);
            },
            clickButtonDelete : function () {
                var alertPanel = new DeleteConfirmWindowView.getInstance({
                    $bodyContent : i18n.taskManager.CONFIRM_DELETE_BATCH
                });

                alertPanel.show();

                alertPanel.on('button_yes', function () {
                    tasksCollection.deleteTasksAsync(taskListView.selected, alertPanel.deleteFile);
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
            events : {
                'click .button-pause' : 'clickButtonPause',
                'click .button-continue' : 'clickButtonContinue',
                'click .button-delete' : 'clickButtonDelete',
                'click .button-open-folder' : 'clickButtonOpenFolder'
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
