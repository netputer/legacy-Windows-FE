/*global define, console*/
(function (window, undefined) {
    define(['Environment'], function (Environment) {
        console.log('Distributor - File loaded. ');

        var flag = parseInt(Environment.get('pcId').substring(Environment.get('pcId').length - 2, Environment.get('pcId').length), 16);

        var hit = function (probability) {
            return (flag / 255) <= probability;
        };

        var SETTINGS = {
            PERFORMANCE_TRACK : 0.2
        };

        var Distributor = {};

        Object.defineProperties(Distributor, {
            PERFORMANCE_TRACK : {
                get : function () {
                    return hit(SETTINGS.PERFORMANCE_TRACK);
                }
            }
        });

        return Distributor;
    });
}(this));
