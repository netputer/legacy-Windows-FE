/*global define*/
(function (window) {
    define([
        'Distributor',
        'Log'
    ], function (
        Distributor,
        log
    ) {
        var PerformanceTracker =  {};

        PerformanceTracker.launch = function () {
            if (Distributor.PERFORMANCE_TRACK) {
                var msg = {'event' : 'debug.fe.timing'};
                var k;
                for (k in window.performance.timing) {
                    if (window.performance.timing.hasOwnProperty(k)) {
                        msg[k] = window.performance.timing[k];
                    }
                }
                log(msg);
            }

            var logMemory = function () {
                var msg = {'event' : 'debug.fe.memory'};
                var k;
                for (k in window.performance.memory) {
                    if (window.performance.memory.hasOwnProperty(k)) {
                        msg[k] = window.performance.memory[k];
                    }
                }
                log(msg);
            };

            logMemory.call(this);

            setInterval(logMemory, 1000 * 60 * 2);
        };

        return PerformanceTracker;
    });
}(this));
