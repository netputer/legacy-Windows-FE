/*global define*/
(function (window) {
    define([
        'underscore',
        'backbone'
    ], function (
        _,
        Backbone
    ) {
        console.log('WorkerPoll - File loaded.');

        var setInterval = window.setInterval;
        var clearInterval = window.clearInterval;

        var hasWaitingTask = function (timestamp) {
            var i;
            var length = this.runningTasks.length;
            for (i = 0; i < length; i++) {
                if (this.runningTasks[i] < timestamp) {
                    return true;
                }
            }
            return false;
        };

        var resolveWaitingResponse = function (timestamp) {
            this.waitingResponse.sort(function (a, b) {
                return a.timestamp > b.timestamp;
            });

            var i;
            var length = this.waitingResponse.length;
            var item;
            for (i = 0; i < length; i++) {
                item = this.waitingResponse[i];
                if (!hasWaitingTask.call(this, item.timestamp)) {
                    item.callback.call(item.context || window, item.evt);
                } else {
                    break;
                }
            }

            this.waitingResponse.splice(0, i + 1);
        };

        var WorkerPoll = function (workerUrl, poolSize) {
            this.size = poolSize || this.size;
            this.url = workerUrl;

            var timer = setInterval(function () {
                if (this.workerQueue.length < 10) {
                    this.workerQueue.push(new window.Worker(this.url));
                } else {
                    clearInterval(timer);
                }
            }.bind(this), 50);
        };

        WorkerPoll.prototype = _.extend({
            size : 3,
            taskQueue : [],
            workerQueue : [],
            runningTasks : [],
            waitingResponse : [],
            addTask : function (message, callback, context) {
                var timestamp = new Date().getTime();
                if (this.workerQueue.length > 0) {
                    this.runTask(message, callback, context, timestamp);
                } else {
                    this.taskQueue.push({
                        message : message,
                        callback : callback,
                        context : context,
                        timestamp : timestamp
                    });
                }
            },
            runTask : function (message, callback, context, timestamp) {
                var worker = this.workerQueue.shift();

                var handler = function (evt) {
                    if (hasWaitingTask.call(this, timestamp)) {
                        this.waitingResponse.push({
                            evt : evt,
                            callback : callback,
                            context : context,
                            timestamp : timestamp
                        });
                    } else {
                        callback.call(context || window, evt);
                        resolveWaitingResponse.call(this, timestamp);
                    }

                    this.runningTasks.splice(this.runningTasks.indexOf(timestamp), 1);

                    worker.removeEventListener('message', handler);

                    this.workerQueue.push(worker);
                    if (this.taskQueue.length > 0) {
                        var task = this.taskQueue.shift();
                        this.runTask(task.message, task.callback, task.context, task.timestamp);
                    }
                }.bind(this);

                this.runningTasks.push(timestamp);

                worker.addEventListener('message', handler);
                worker.postMessage(message);
            }
        }, Backbone.Events);

        return WorkerPoll;
    });
}(this));
