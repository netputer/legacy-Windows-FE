/*global define*/
(function (window) {
    define([
        'underscore',
        'jquery',
        'backbone',
        'IOBackendDevice',
        'Configuration',
        'Internationalization',
        'task/models/TaskModel',
        'app/collections/AppsCollection',
        'app/collections/WebAppsCollection'
    ], function (
        _,
        $,
        Backbone,
        IO,
        CONFIG,
        i18n,
        TaskModel,
        AppsCollection,
        WebAppsCollection
    ) {
        console.log('TasksCollection - File loaded.');

        var appsCollection;
        var webAppsCollection;

        var changeHandler = function () {
            webAppsCollection = webAppsCollection || WebAppsCollection.getInstance();

            this.pretreatment();

            var id = this.get('detail');
            var relativedAppModel = appsCollection.get(id);
            var relativedWebAppModel = webAppsCollection.get(id);
            var state = this.get('state');

            if (state !== CONFIG.enums.TASK_STATE_SUCCESS &&
                    state !== CONFIG.enums.TASK_STATE_FAILD) {
                if (relativedAppModel !== undefined) {
                    relativedAppModel.set({
                        isUpdating : true,
                        progress : this.get('processing')
                    });
                }
                if (relativedWebAppModel !== undefined) {
                    relativedWebAppModel.set({
                        isUpdating : true,
                        progress : this.get('processing')
                    });
                }
            } else {
                if (relativedAppModel !== undefined) {
                    relativedAppModel.set({
                        isUpdating : false,
                        progress : 0
                    });
                }
                if (relativedWebAppModel !== undefined) {
                    relativedWebAppModel.set({
                        isUpdating : false,
                        progress : 0
                    });
                }
            }
        };

        var refreshHandler = function (appsCollection) {
            var targert = appsCollection.get(this.get('detail'));
            if (targert !== undefined) {
                var state = this.get('state');

                if (state !== CONFIG.enums.TASK_STATE_SUCCESS &&
                        state !== CONFIG.enums.TASK_STATE_FAILD) {
                    targert.set({
                        isUpdating : true,
                        progress : this.get('processing')
                    });
                } else {
                    targert.set({
                        isUpdating : false,
                        progress : 0
                    });
                }
            }
        };

        var removeHandler = function () {
            webAppsCollection = webAppsCollection || WebAppsCollection.getInstance();

            var id = this.get('detail');
            var relativedAppModel = appsCollection.get(id);
            var relativedWebAppModel = webAppsCollection.get(id);
            if (relativedAppModel !== undefined) {
                relativedAppModel.set({
                    isUpdating : false,
                    progress : 0
                });
            }
            if (relativedWebAppModel !== undefined) {
                relativedWebAppModel.set({
                    isUpdating : false,
                    progress : 0
                });
            }

            this.off();
            this.stopListening();
        };

        var TasksCollection = Backbone.Collection.extend({
            url : CONFIG.actions.TASK_SHOW_PROGRESS,
            model : TaskModel,
            parse : function (resp) {
                var body = resp.body;

                this.activeCount = body.active_job_number;
                this.errorCount = body.error_job_number;
                this.running = body.is_running;
                this.progress = body.progress;
                this.speed = body.speed;

                return resp.body.status;
            },
            comparator : function (current) {
                return -Number(current.get('added_time'));
            },
            initialize : function () {
                var loading = false;
                var activeCount = 0;
                var errorCount = 0;
                var running = false;
                var progress = 0;
                var speed = 0;
                Object.defineProperties(this, {
                    loading : {
                        set : function (value) {
                            loading = Boolean(value);
                        },
                        get : function () {
                            return loading;
                        }
                    },
                    activeCount : {
                        set : function (value) {
                            activeCount = parseInt(value, 10);
                        },
                        get : function () {
                            return activeCount;
                        }
                    },
                    errorCount : {
                        set : function (value) {
                            errorCount = parseInt(value, 10);
                        },
                        get : function () {
                            return errorCount;
                        }
                    },
                    running : {
                        set : function (value) {
                            running = Boolean(value);
                        },
                        get : function () {
                            return running;
                        }
                    },
                    progress : {
                        set : function (value) {
                            progress = parseInt(value, 10);
                        },
                        get : function () {
                            return progress;
                        }
                    },
                    speed : {
                        set : function (value) {
                            speed = parseInt(value, 10);
                        },
                        get : function () {
                            return speed;
                        }
                    }
                });

                appsCollection = appsCollection || AppsCollection.getInstance();

                this.on('add', function (task) {
                    task.on('change', changeHandler, task);
                    task.once('remove', removeHandler, task);
                    task.listenTo(appsCollection, 'refresh', refreshHandler);
                });

                this.on('update', function () {
                    this.loading = true;
                    this.fetch({
                        success : function (collection) {
                            console.log('TasksCollection - Collection updated.');
                            collection.loading = false;
                            collection.trigger('refresh', collection);
                        }
                    });
                }, this);

                var isSilde = false;
                var handler;
                var setData = function (data) {
                    this.set({
                        body : data
                    }, {
                        parse : true
                    });

                    this.trigger('refresh', this);
                }.bind(this);

                IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.TASK_CHANGE
                }, function (data) {

                    clearTimeout(handler);
                    if (isSilde) {
                        handler = setTimeout(function() {
                            setData(data);
                        }, 1000);
                    } else {
                        setData(data);
                    }

                }, this);

                this.listenTo(Backbone, 'taskmanager.silde', function (isSilding) {
                    isSilde = isSilding;
                });

            },
            getRunningTasks : function () {
                return this.filter(function (task) {
                    return task.isRunning;
                });
            },
            removeAllFinishAsync : function () {
                IO.requestAsync({
                    url : CONFIG.actions.TASK_REMOVE_FINISHI,
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('TasksCollection - Remove all finished task success.');
                            this.trigger('update');
                        } else {
                            console.error('TasksCollection - Remove all finished task failed. Error info: ' + resp.state_line);
                        }
                    }.bind(this)
                });
            },
            getInQueueTasks : function () {
                return this.filter(function (task) {
                    return task.isInQueue;
                });
            },
            getTaskByPackageName : function (packageName) {
                return this.find(function (task) {
                    return task.get('detail') === packageName;
                });
            },
            deleteTasksAsync : function (ids, deleteFile) {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.TASK_DELETE_TASK,
                    data : {
                        job : ids.join(','),
                        clear : Number(deleteFile)
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('TasksCollection - Delete tasks success.');
                            _.each(ids, function (id) {
                                this.remove(id);
                            }, this);
                            this.trigger('refresh', this);
                            deferred.resolve(resp);
                        } else {
                            console.error('TasksCollection - Delete tasks failed. Error info: ' + resp.state_line);
                            deferred.reject(resp);
                        }
                    }.bind(this)
                });

                return deferred.promise();
            },
            startTasksAsync : function (ids) {
                var deferred = $.Deferred();

                var stopedTasks = [];

                _.each(ids, function (id) {
                    var task = this.get(id);

                    if (task.isStoped) {
                        stopedTasks.push(task.id);
                    }
                }, this);

                IO.requestAsync({
                    url : CONFIG.actions.TASK_START_TASK,
                    data : {
                        job : stopedTasks.join(',')
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('TasksCollection - Start tasks success.');
                            deferred.resolve(resp);
                        } else {
                            console.error('TasksCollection - Start tasks failed. Error info: ' + resp.state_line);
                            deferred.reject(resp);
                        }
                    }.bind(this)
                });

                return deferred.promise();
            },
            pauseTasksAsync : function (ids) {
                var deferred = $.Deferred();

                var runningTasks = [];

                _.each(ids, function (id) {
                    var task = this.get(id);

                    if (task.isRunning && task.get('type') === CONFIG.enums.TASK_TYPE_DOWNLOAD) {
                        runningTasks.push(task.id);
                    }
                }, this);

                IO.requestAsync({
                    url : CONFIG.actions.TASK_STOP_TASK,
                    data : {
                        job : runningTasks.join(',')
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('TasksCollection - Stop tasks success.');
                            deferred.resolve(resp);
                        } else {
                            console.error('TasksCollection - Stop tasks failed. Error info: ' + resp.state_line);
                            deferred.reject(resp);
                        }
                    }.bind(this)
                });

                return deferred.promise();
            },
            getAll : function () {
                return this.models;
            },
            getFailedTasks : function () {
                return this.filter(function (task) {
                    var state = task.get('state');
                    return state === CONFIG.enums.TASK_STATE_FAILD &&
                            task.get('type') === CONFIG.enums.TASK_TYPE_DOWNLOAD;
                });
            },
            getWaitingPushTasks : function () {
                return this.filter(function (task) {
                    var state = task.get('state');
                    return task.get('type') === CONFIG.enums.TASK_TYPE_PUSH &&
                                state !== CONFIG.enums.TASK_STATE_PROCESSING &&
                                state !== CONFIG.enums.TASK_STATE_SUCCESS &&
                                state !== CONFIG.enums.TASK_STATE_FAILD;
                });
            },
            hasPausable : function (ids) {
                return this.find(function (task) {
                    return ids.indexOf(task.id) >= 0 && task.get('type') === CONFIG.enums.TASK_TYPE_DOWNLOAD;
                }) !== undefined;
            }
        });

        var tasksCollection;

        var factory = _.extend({}, {
            getInstance : function () {
                if (!tasksCollection) {
                    tasksCollection = new TasksCollection();
                    tasksCollection.trigger('update');
                }
                return tasksCollection;
            }
        });

        return factory;
    });
}(this));
