/*global define*/
(function (window) {
    define([
        'underscore',
        'Log',
        'jquery'
    ], function (
        _,
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

            var ran = _.random(0, 1);
            if (ran) {
                log(_.extend({
                    'event' : 'ui.show.performance'
                }, data, result, SYS_INFO));
            }
        };

        return PerformanceTracker;
    });
}(this));
