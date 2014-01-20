/*global define*/
(function (window) {
    define([
        'underscore',
        'Distributor',
        'Log',
        'jquery',
        'ParserFactory'
    ], function (
        _,
        Distributor,
        log,
        $,
        ParserFactory
    ) {
        var PerformanceTracker =  {};
        var SYS_INFO = {};

        window.getSysInfo = function (result) {
            SYS_INFO = JSON.parse(result);

            _.each(SYS_INFO, function (value, key) {
                SYS_INFO[key] = $.trim(value);
            });
        };

        PerformanceTracker.launch = function () {
            wandoujia.getSystemInfo('getSysInfo');
        };

        window.recordeFPS = function (result, data) {

            ParserFactory.addTask([result, data], function(evt) {
                log(_.extend({
                    'event' : 'ui.show.performance'
                }, evt[0], evt[1]));
            });
        };

        return PerformanceTracker;
    });
}(this));
