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
        'main/views/NavView',
        'task/views/TaskDashboardView',
        'task/views/TaskNotifierPanelView',
        'task/views/TaskModuleView',
        'task/EventProcessor',
        'task/TaskService',
        'main/collections/PIMCollection'
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
        NavView,
        TaskDashboardView,
        TaskNotifierPanelView,
        TaskModuleView,
        EventProcessor,
        TaskService,
        PIMCollection
    ) {
        console.log('TaskMonitorView - File loaded. ');

        var tasksCollection;
        var taskModuleView;

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

        var TaskMonitorView = Backbone.View.extend({
            className : 'w-task-manager-ctn vbox',
            template : doT.template(TemplateFactory.get('taskManager', 'task-ctn')),
            initialize : function () {
                tasksCollection = TasksCollection.getInstance();
                taskModuleView = TaskModuleView.getInstance();

                tasksCollection.on('refresh', this.showMessage, this);

                var outOfSpaceHandler = function (message) {
                    if (message.message === 'NEW_TASK') {
                        IO.requestAsync(CONFIG.actions.WINDOW_DISK_FREE_SPACE).done(function (resp) {
                            if (Number(resp.body.value) < 1024 * 1024 * 500) {
                                var popupPanel = TaskNotifierPanelView.getInstance({
                                    $host : this.$el,
                                    $content : $(doT.template(TemplateFactory.get('taskManager', 'out-of-space'))()),
                                    alignToHost : false,
                                    popIn : true
                                });

                                popupPanel.show();

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

                var addUnderWifiAndMiuiHandler = IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.TASK_STATUS_CHANGE
                }, function (datas) {
                    var needConfirmItems = _.find(datas.status, function (data) {
                        return data.message === 'CONFIRM_ON_DEVICE' || data.message === 'NEED_USER_INSTALL';
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
                        IO.Backend.Device.offmessage(addUnderWifiAndMiuiHandler);
                    } else {
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
                            IO.Backend.Device.offmessage(addUnderWifiAndMiuiHandler);
                        }
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

                        popupPanel.show();
                        this.stopListening(tasksCollection, 'refresh', notEnoughSpaceHandler);

                        log({
                            'event' : 'debug.taskManager.not_enough_space_notifi_show'
                        });
                    }
                };
                this.listenTo(tasksCollection, 'refresh', notEnoughSpaceHandler);
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

                if (tasksCollection.activeCount > 0) {
                    this.$('.item.active .desc').html(StringUtil.format(i18n.taskManager.RUNNING_COUNT, tasksCollection.activeCount));
                    this.$('.item.active').show();
                } else {
                    if (tasksCollection.errorCount > 0) {
                        this.$('.item.error .desc').html(StringUtil.format(i18n.taskManager.FAILED_COUNT, tasksCollection.errorCount));
                        this.$('.item.error').show();
                    } else {
                        if (tasksCollection.getWaitingPushTasks().length) {
                            this.$('.item.push .desc').html(StringUtil.format(i18n.taskManager.WATING_PUSH_COUNT, tasksCollection.getWaitingPushTasks().length));
                            this.$('.item.push').show();
                        } else {
                            this.showCacheSize();
                            this.$('.item.cache').show();
                        }
                    }
                }
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
            clickView : function (evt) {
                if (taskModuleView.show) {
                    taskModuleView.slideOut();

                    log({
                        'event' : 'ui.click.task.toggle.close'
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

                    log({
                        'event' : 'ui.click.task.toggle.open'
                    });
                }
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
