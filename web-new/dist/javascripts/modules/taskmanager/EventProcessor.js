/*global define, Backbone, _*/
(function (window, undefined) {
    define([
        'Log',
        'IOBackendDevice',
        'Settings',
        'FunctionSwitch',
        'Configuration',
        'Device'
    ], function (
        log,
        IO,
        Settings,
        FunctionSwitch,
        CONFIG,
        Device
    ) {
        console.log('EventProcessor - File loaded.');

        var MESSAGE_MAPPING = {
            START_DOWNLOAD : 'START_DOWNLOAD'
        };

        var messageNormalList = [];

        var EventProcessorBase = function () {
            IO.Backend.Device.onmessage({
                'data.channel' : CONFIG.events.TASK_STATUS_CHANGE
            }, function (datas) {

                var originalLength = messageNormalList.length;

                var offlineTasks = _.filter(datas.status, function (task) {
                    return /^OFFLINE--/.test(task.source);
                });

                if (offlineTasks.length > 0) {
                    messageNormalList.push({
                        id : _.uniqueId('task-event-'),
                        message : 'OFFLINE_TASK',
                        data : offlineTasks.length
                    });
                }

                if (originalLength === 0 && messageNormalList.length === 1) {
                    this.trigger('message', messageNormalList[0]);
                }
            }, this);

            IO.Backend.Device.onmessage({
                'data.channel' : CONFIG.events.TASK_ADD
            }, function (data) {
                var originalLength = messageNormalList.length;

                if (data > 0) {
                    messageNormalList.push({
                        id : _.uniqueId('task-event-'),
                        message : 'NEW_TASK',
                        data : data
                    });

                    if (originalLength === 0 && messageNormalList.length === 1) {
                        this.trigger('message', messageNormalList[0]);
                    }
                }
            }, this);

            IO.Backend.Device.onmessage({
                'data.channel' : CONFIG.events.TASK_STOP
            }, function (data) {
                var originalLength = messageNormalList.length;
                if (data > 0) {
                    messageNormalList.push({
                        id : _.uniqueId('task-event-'),
                        message : 'TASK_FINISH',
                        data : data
                    });

                    if (originalLength === 0 && messageNormalList.length === 1) {
                        this.trigger('message', messageNormalList[0]);
                    }
                }
            }, this);
        };

        EventProcessorBase.prototype.remove = function (id) {
            var message;
            var i;
            var temp;
            var targetMessage;

            for (i = messageNormalList.length; i--; undefined) {
                targetMessage = messageNormalList[i];
                if (targetMessage.id === id) {
                    temp = messageNormalList[i];
                    messageNormalList.splice(i, 1);
                    this.trigger('remove', temp);

                    if (messageNormalList.length > 0) {
                        message = messageNormalList[0];
                    }
                    break;
                }
            }

            if (message) {
                this.trigger('message', message);
            } else if (messageNormalList.length === 0) {
                this.trigger('empty');
            }
        };

        var eventProcessor = _.extend(new EventProcessorBase(), Backbone.Events);

        return eventProcessor;
    });
}(this));