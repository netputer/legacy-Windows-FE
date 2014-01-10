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

        var SYS_INFO = {};

        window.getSysInfo = function (result) {
            SYS_INFO = JSON.parse(result);
        };

        PerformanceTracker.launch = function () {
            wandoujia.getSystemInfo('getSysInfo');
        };

        return PerformanceTracker;
    });
}(this));
