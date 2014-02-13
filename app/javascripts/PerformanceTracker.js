/*global define*/
(function (window) {
    define([
        'underscore',
        'Distributor',
        'Log',
        'jquery'
    ], function (
        _,
        Distributor,
        log,
        $
    ) {
        var PerformanceTracker =  {};
        var SYS_INFO = {};

        window.getSysInfo = function (result) {
            SYS_INFO = JSON.parse(result);

            _.each(SYS_INFO, function (value, key) {
                SYS_INFO[key] = value.replace(/\s/g, '');
            });
        };

        PerformanceTracker.launch = function () {
            wandoujia.getSystemInfo('getSysInfo');
        };

        window.recordFPS = function (result, index) {
            var data = wandoujia.data[index];
            delete wandoujia.data[index];

            result = JSON.parse(result);
            log(_.extend({
                'event' : 'ui.show.performance'
            }, data, result, SYS_INFO));
        };

        return PerformanceTracker;
    });
}(this));
