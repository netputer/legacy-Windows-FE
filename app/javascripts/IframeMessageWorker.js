/*global define*/
(function (window) {
    define([
        'underscore',
        'backbone',
        'IO',
        'Configuration'
    ], function (
        _,
        Backbone,
        IO,
        CONFIG
    ) {
        console.log('IframeMessageWorker - File loaded. ');

        var IframeMessageWorker = _.extend({}, Backbone.Events);

        IframeMessageWorker.alert = function (message) {
            IO.sendCustomEventsAsync(CONFIG.events.CUSTOM_IFRAME_ALERT, {
                data : message
            });
        };

        IframeMessageWorker.confirm = function (message, yesCallback, cancelCallback, context) {

            if (typeof cancelCallback !== 'function') {
                context = cancelCallback || window;
            }

            var yesHandler = function () {
                if (yesCallback !== undefined) {
                    yesCallback.call(context || window);
                }
            };

            var cancelHandler = function () {
                if (cancelCallback !== undefined && typeof cancelCallback === 'function') {
                    cancelCallback.call(context || window);
                }
            };

            var listenerId = _.uniqueId('iframe_confirm_');
            IO.sendCustomEventsAsync(CONFIG.events.CUSTOM_IFRAME_CONFIRM, {
                data : message,
                listenerId : listenerId
            });

            var handler = IO.Backend.Device.onmessage({
                'data.channel' : listenerId
            }, function (data) {
                if (data.action === 'yes') {
                    yesHandler.call(this);
                } else {
                    cancelHandler.call(this);
                }
                IO.Backend.Device.offmessage(handler);
            });
        };

        IframeMessageWorker.disposable = function (message) {
            IO.sendCustomEventsAsync(CONFIG.events.CUSTOM_IFRAME_DISPOSABLE, {
                data : message
            });
        };

        IframeMessageWorker.trigger = function (channel, message) {
            IO.sendCustomEventsAsync(channel, {
                data : message || {}
            });
        };

        return IframeMessageWorker;
    });
}(this));
