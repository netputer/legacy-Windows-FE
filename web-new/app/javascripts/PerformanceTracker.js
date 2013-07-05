/*global define*/
(function (window) {
    define([
        'Distributor',
        'Log',
        'jquery'
    ], function (
        Distributor,
        log,
        $
    ) {
        var PerformanceTracker =  {};

        PerformanceTracker.launch = function () {
            if (Distributor.PERFORMANCE_TRACK) {
                $(function (argument) {
                    var msg = {'event' : 'debug.fe.timing'};
                    var k;
                    for (k in window.performance.timing) {
                        if (window.performance.timing.hasOwnProperty(k)) {
                            msg[k] = window.performance.timing[k];
                        }
                    }
                    log(msg);
                });

                var i = 1;

                var logMemory = function () {
                    var msg = {
                        'event' : 'debug.fe.memory',
                        'count' : i
                    };
                    var k;
                    for (k in window.performance.memory) {
                        if (window.performance.memory.hasOwnProperty(k)) {
                            msg[k] = window.performance.memory[k];
                        }
                    }
                    log(msg);
                    i++;
                };

                logMemory.call(this);

                setInterval(logMemory, 1000 * 60 * 2);
            }
        };

        return PerformanceTracker;
    });
}(this));
