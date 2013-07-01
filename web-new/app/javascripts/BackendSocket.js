/*global console, define*/
(function (window, undefined) {
    define([], function () {
        console.log('BackendSocket - File loaded.');

        var setTimeout = window.setTimeout;
        var clearTimeout = window.clearTimeout;

        var CONNECTING = 0;
        var OPEN = 1;
        var CLOSING = 2;
        var CLOSED = 3;

        var urlPattern = /^wdjs\:\/\//i;

        /* temporarily defining setImmediate/clearImmediate here */
        /* TODO: should be a more reliable implementation as a standalone module */
        var setImmediate = function (callback) {
            return setTimeout(callback, 0);
        };

        /* BackendSocket provides an API similar to WebSocket API */
        /* IO.Backend has an instance of `BackendSocket('wdjs://window/events')` */
        /* wdjs:// means Wandoujia Streaming and we might rename this later */
        var BackendSocket = function (url) {
            var self = this;

            var readyState = CONNECTING;
            var openHandler;
            var errorHandler;
            var closeHandler;
            var messageHandler;

            if (!urlPattern.test(url)) {
                throw new Error('URL should be started with "wdjs://"');
            }

            Object.defineProperty(this, 'readyState', {
                get: function () { return readyState; }
            });

            Object.defineProperty(this, 'extensions', {
                /* not implemented so always empty string */
                value: ''
            });

            Object.defineProperty(this, 'protocol', {
                /* not implemented so always empty string */
                value: ''
            });

            Object.defineProperty(this, 'onopen', {
                get : function () { return openHandler; },
                set : function (handler) { openHandler = handler; return self; }
            });

            Object.defineProperty(this, 'onerror', {
                get : function () { return errorHandler; },
                set : function (handler) { errorHandler = handler; return self; }
            });

            Object.defineProperty(this, 'onclose', {
                get : function () { return closeHandler; },
                set : function (handler) { closeHandler = handler; return self; }
            });

            Object.defineProperty(this, 'onmessage', {
                get : function () { return messageHandler; },
                set : function (handler) { messageHandler = handler; return self; }
            });

            this.close = function () {
                if (readyState === CLOSING || readyState === CLOSED) {
                    return;
                }
                readyState = CLOSING;
                setImmediate(function () {
                    readyState = CLOSED;
                    if (typeof closeHandler === 'function') {
                        closeHandler();
                    }
                });
            };

            this.send = function () {
                throw new Error('send is disabled and not implemented in BackendSocket');
            };

            var showLog = false;

            /* BackendSocket is changed from connecting to open immediately after being created */
            setImmediate(function () {
                if (readyState !== CONNECTING) {
                    /* if close method is called even before onopen is called */
                    return;
                }

                window.OneRingStreaming('*', function (deviceId, channel, data) {
                    if (typeof messageHandler === 'function' && !!channel && !!data) {
                        var msg = {
                            deviceId : deviceId,
                            channel : channel,
                            data : data
                        };

                        messageHandler({
                            data : msg
                        });

                        if (showLog) {
                            console.log(msg);
                        }
                    }
                });

                readyState = OPEN;
                if (typeof openHandler === 'function') {
                    openHandler();
                }
            });

            window.blackSheepWall = function () {
                showLog = true;
            };
        };

        return BackendSocket;
    });
}(this));
