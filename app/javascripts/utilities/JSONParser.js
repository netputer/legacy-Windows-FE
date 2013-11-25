/*global define*/
(function (window) {
    define([
        'Configuration'
    ], function (
        CONFIG
    ) {
        var queue = [];
        var running = false;

        var worker = new window.Worker(CONFIG.BASE_PATH + 'workers/jsonparser.js');

        var JSONParser = {};

        var run = function (data, callback, context) {
            var handler = function (evt) {
                running = false;
                worker.removeEventListener('message', handler);

                callback.call(context || this, evt.data);

                if (queue.length > 0) {
                    var target = queue.shift();
                    run(target.data, target.callback, target.context);
                }
            };

            worker.addEventListener('message', handler);
            worker.postMessage(data);
            running = true;
        };

        JSONParser.parse = function (data, callback, context) {
            if (!running) {
                run(data, callback, context);
            } else {
                queue.push({
                    data : data,
                    callback : callback,
                    context : context
                });
            }
        };

        return JSONParser;
    });
}(this));
