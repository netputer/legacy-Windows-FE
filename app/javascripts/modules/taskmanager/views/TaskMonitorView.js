/*global define*/
(function (window) {
    define([
        'backbone',
        'doT',
        'jquery',
        'underscore',
        'Log',
        'ui/TemplateFactory',
        'Internationalization',
        'Configuration',
        'Device',
        'IOBackendDevice',
        'utilities/StringUtil',
        'task/collections/TasksCollection',
        'task/views/TaskDashboardView',
        'task/views/TaskNotifierPanelView',
        'task/views/TaskModuleView',
        'task/views/TaskChangeStoragePathView',
        'task/EventProcessor'
    ], function (
        Backbone,
        doT,
        $,
        _,
        log,
        TemplateFactory,
        i18n,
        CONFIG,
        Device,
        IO,
        StringUtil,
        TasksCollection,
        TaskDashboardView,
        TaskNotifierPanelView,
        TaskModuleView,
        TaskChangeStoragePathView,
        EventProcessor
    ) {
        console.log('TaskMonitorView - File loaded. ');

        var tasksCollection;
        var taskModuleView;
        var taskChangePathView;

        var MonitorItem = Backbone.View.extend({
            className : 'w-task-monitor-item item',
            template : doT.template(TemplateFactory.get('taskManager', 'monitor-item')),
            render : function () {
                var icon;
                var desc;
                switch (this.model.get('message')) {
                case 'NEW_TASK':
                    icon = 'add';
                    desc = StringUtil.format(i18n.taskManager.ADD_TASK_TIP, this.model.get('data'));
                    break;
                case 'TASK_FINISH':
                    icon = 'finish';
                    desc = StringUtil.format(i18n.taskManager.FINISH_TASK_TIP, this.model.get('data'));
                    break;
                }

                this.$el.html(this.template({
                    icon : icon,
                    desc : desc
                }));

                setTimeout(function () {
                    this.$el.slideDown(function () {
                        setTimeout(function () {
                            this.$el.slideUp(function () {
                                this.remove();
                                EventProcessor.remove(this.model.id);
                            }.bind(this));
                        }.bind(this), 2000);
                    }.bind(this));
                }.bind(this), 0);
                return this;
            }
        });

        var notEnoughSpaceFlag = false;

        var TaskMonitorView = Backbone.View.extend({
            className : 'w-task-manager-ctn vbox',
            template : doT.template(TemplateFactory.get('taskManager', 'task-ctn')),
            initialize : function () {
                tasksCollection = TasksCollection.getInstance();
                taskModuleView = TaskModuleView.getInstance();

                tasksCollection.on('refresh', this.showMessage, this);

                var outOfSpaceHandler = function (message) {
                    if (message.message === 'NEW_TASK' && !notEnoughSpaceFlag) {
                        IO.requestAsync(CONFIG.actions.WINDOW_DISK_FREE_SPACE).done(function (resp) {
                            if (Number(resp.body.value) < 1024 * 1024 * 500) {
                                var popupPanel = TaskNotifierPanelView.getInstance({
                                    $host : this.$el,
                                    $content : $(doT.template(TemplateFactory.get('taskManager', 'out-of-space'))()),
                                    alignToHost : false,
                                    popIn : true
                                });

                                setTimeout(popupPanel.show.bind(popupPanel));

                                log({
                                    'event' : 'debug.taskManager.out_of_space_notifi_show'
                                });
                            }
                        }.bind(this));
                        this.stopListening(EventProcessor, 'message', outOfSpaceHandler);
                    }
                };
                this.listenTo(EventProcessor, 'message', outOfSpaceHandler);

                EventProcessor.on('message', function (message) {
                    switch (message.message) {
                    case 'NEW_TASK':
                    case 'TASK_FINISH':
                        this.$el.prepend(new MonitorItem({
                            model : new Backbone.Model(message)
                        }).render().$el);
                        break;
                    }

                    if (message.message === 'NEW_TASK') {
                        this.addNewTaskAnima();
                    } else if (message.message === 'OFFLINE_TASK') {
                        var popupPanel = TaskNotifierPanelView.getInstance({
                            $host : this.$el,
                            $content : $(doT.template(TemplateFactory.get('taskManager', 'offline-task-added'))({
                                count : message.data
                            })),
                            alignToHost : false,
                            popIn : true,
                            delay : 5000
                        });

                        popupPanel.show();
                    }

                    tasksCollection.off('refresh', this.showMessage);
                }, this);

                EventProcessor.on('empty', function () {
                    tasksCollection.on('refresh', this.showMessage, this);
                    tasksCollection.trigger('refresh', tasksCollection);
                }, this);

                var addWhenDisconnectHandler = IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.TASK_ADD
                }, function (data) {
                    if (data > 0 && !Device.get('isConnected')) {
                        var popupPanel = TaskNotifierPanelView.getInstance({
                            $host : this.$el,
                            $content : $(doT.template(TemplateFactory.get('taskManager', 'disconnect-tip'))({})),
                            alignToHost : false,
                            popIn : true,
                            listenToConnect : true
                        });

                        popupPanel.show();

                        var notEnoughSpaceHandler = function () {
                            var target = _.find(tasksCollection.getFailedTasks(), function (task) {
                                return task.get('message') === 'NO_SPACE';
                            });

                            if (target !== undefined) {
                                popupPanel.remove();
                            }
                        };
                        popupPanel.listenTo(tasksCollection, 'refresh', notEnoughSpaceHandler);

                        IO.Backend.Device.offmessage(addWhenDisconnectHandler);
                    }
                }, this);

                var miuiHangdler = IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.TASK_STATUS_CHANGE
                }, function (datas) {
                    var miuiV5 = _.find(datas.status, function (data) {
                        return data.message === 'NEED_USER_INSTALL_MIUI_V5';
                    });
                    if (miuiV5) {
                        popupPanel = TaskNotifierPanelView.getInstance({
                            $host : this.$el,
                            $content : $(doT.template(TemplateFactory.get('taskManager', 'confirm-miui-v5-tip'))({})),
                            alignToHost : false,
                            popIn : true,
                            listenToWifi : true
                        });
                        popupPanel.show();
                        IO.Backend.Device.offmessage(miuiHangdler);
                    }
                });

                var underWifiHandler = IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.TASK_ADD
                }, function (datas) {
                    var needConfirmItems = _.find(datas.status, function (data) {
                        return data.type === CONFIG.enums.TASK_TYPE_PUSH_PHONE;
                    });
                    var popupPanel;
                    if (needConfirmItems !== undefined) {
                        popupPanel = TaskNotifierPanelView.getInstance({
                            $host : this.$el,
                            $content : $(doT.template(TemplateFactory.get('taskManager', 'confirm-tip'))({})),
                            alignToHost : false,
                            popIn : true,
                            listenToWifi : true
                        });
                        popupPanel.show();
                        IO.Backend.Device.offmessage(underWifiHandler);
                    }
                }, this);

                var disconnectHandler = function (Device, isConnected) {
                    if (!isConnected && tasksCollection.activeCount > 0) {
                        var popupPanel = TaskNotifierPanelView.getInstance({
                            $host : this.$el,
                            $content : $(doT.template(TemplateFactory.get('taskManager', 'disconnect-running-tip'))({})),
                            alignToHost : false,
                            popIn : true,
                            listenToConnect : true
                        });

                        popupPanel.show();

                        this.stopListening(Device, 'change:isConnected', disconnectHandler);
                        this.listenToOnce(Device, 'change:isConnected', function () {
                            popupPanel.remove();
                        });
                    }
                };

                this.listenTo(Device, 'change:isConnected', disconnectHandler);

                var notEnoughSpaceHandler = function () {
                    var target = _.find(tasksCollection.getFailedTasks(), function (task) {
                        return task.get('message') === 'NO_SPACE';
                    });

                    if (target !== undefined) {
                        var popupPanel = TaskNotifierPanelView.getInstance({
                            $host : this.$el,
                            $content : $(doT.template(TemplateFactory.get('taskManager', 'not-enough-space'))({})),
                            alignToHost : false,
                            popIn : true
                        });

                        notEnoughSpaceFlag = true;

                        popupPanel.show();

                        popupPanel.on('remove', function () {
                            notEnoughSpaceFlag = false;
                        });

                        this.stopListening(tasksCollection, 'refresh', notEnoughSpaceHandler);

                        log({
                            'event' : 'debug.taskManager.not_enough_space_notifi_show'
                        });
                    }
                };
                this.listenTo(tasksCollection, 'refresh', notEnoughSpaceHandler);

                IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.TASK_JOB_FILE_ERROR
                }, function (data) {

                    if (!taskChangePathView) {
                        taskChangePathView = TaskChangeStoragePathView.getInstance();
                    }

                    if (!taskChangePathView.isShow) {
                        taskChangePathView.show();
                        taskChangePathView.type = data.type;
                    }

                }, this);

                IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.TASK_DOWNLOAD_DIR_CHANGED
                }, function () {
                    var collection = TasksCollection.getInstance();
                    var ids = _.pluck(_.filter(collection.getFailedTasks(), function (task) {
                        return task.get('message') === 'NO_SPACE';
                    }), 'id');
                    collection.startTasksAsync(ids);

                }, true, this);
            },
            addNewTaskAnima : _.throttle(function () {
                var $anima = $('<div>').addClass('w-task-anima start-download-anima');
                $anima.one('webkitAnimationEnd', function () {
                    $anima.toggleClass('start-download-anima', false);
                    $anima.remove();
                });
                $('body').append($anima);
            }, 10 * 1000),
            showMessage : function (tasksCollection) {
                this.$('.item').hide();
                var count = 0;

                if (tasksCollection.activeCount > 0) {
                    this.$('.item.active .desc').html(StringUtil.format(i18n.taskManager.RUNNING_COUNT, tasksCollection.activeCount));
                    this.$('.item.active').show();
                    return;
                }

                if (tasksCollection.errorCount > 0) {
                    this.$('.item.error .desc').html(StringUtil.format(i18n.taskManager.FAILED_COUNT, tasksCollection.errorCount));
                    this.$('.item.error').show();
                    return;
                }

                count = tasksCollection.getWaitingPushTasks().length;
                if (count) {
                    this.$('.item.push .desc').html(StringUtil.format(i18n.taskManager.WATING_PUSH_COUNT, count));
                    this.$('.item.push').show();
                    return;
                }

                this.showCacheSize();
                this.$('.item.cache').show();
            },
            showCacheSize : _.debounce(function () {
                IO.requestAsync({
                    url : CONFIG.actions.TASK_CACHE_SIZE,
                    success : function (resp) {
                        var value = parseInt(resp.body.value, 10);
                        if (value) {
                            this.$('.item.cache .desc').html(StringUtil.format(i18n.taskManager.CACHE_SIZE, StringUtil.readableSize(value)));
                        } else {
                            this.$('.item.cache .desc').html(i18n.taskManager.NO_TASK_RUNNING);
                        }
                    }.bind(this)
                });
            }, 100),
            render : function () {
                this.$el.html(this.template({}));

                TaskDashboardView.getInstance({
                    $host : this.$el
                });

                this.showMessage(tasksCollection);

                this.addAnimation();

                return this;
            },
            addAnimation : function () {
                var $anima = $('<div>').addClass('anima');
                $anima.on('webkitAnimationEnd', function () {
                    $anima.toggleClass('start-download-anima', false);
                    $anima.toggleClass('start-install-anima', false);
                    $anima.detach();
                });

                IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.TASK_STATUS_CHANGE
                }, function (data) {
                    switch (data.message) {
                    case 'START_DOWNLOAD':
                        if (!$anima.hasClass('start-download-anima') &&
                                !$anima.hasClass('start-install-anima')) {
                            this.$el.prepend($anima);
                            $anima.toggleClass('start-download-anima', true);
                        }
                        break;
                    case 'START_INSTALL':
                        if (!$anima.hasClass('start-download-anima') &&
                                !$anima.hasClass('start-install-anima')) {
                            this.$el.prepend($anima);
                            $anima.toggleClass('start-install-anima', true);
                        }
                        break;
                    }
                }, this);
            },
            toggleListView : function (show) {
                if (taskModuleView.show || (show !== undefined && !show)) {
                    taskModuleView.slideOut();

                    Backbone.trigger('taskManager:toggle', {
                        status : 'close'
                    });
                } else {
                    if (taskModuleView.rendered) {
                        if (!$('.w-main .module-ctn').children().last()[0].contains(taskModuleView.$el[0])) {
                            $('.w-main .module-ctn').append(taskModuleView.$el);
                        }
                    } else {
                        $('.w-main .module-ctn').append(taskModuleView.render().$el);
                    }

                    taskModuleView.slideIn();

                    Backbone.trigger('taskManager:toggle', {
                        status : 'open'
                    });
                }
            },
            clickView : function (evt) {
                if (taskModuleView.show) {
                    log({
                        'event' : 'ui.click.task.toggle.close'
                    });
                } else {
                    log({
                        'event' : 'ui.click.task.toggle.open'
                    });
                }

                this.toggleListView();
            },
            events : {
                'click' : 'clickView'
            }
        });

        var taskMonitorView;

        var factory = _.extend({
            getInstance : function () {
                if (!taskMonitorView) {
                    taskMonitorView = new TaskMonitorView();
                }
                return taskMonitorView;
            }
        });

        return factory;
    });
}(this));
