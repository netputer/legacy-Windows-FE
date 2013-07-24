/*global define, console*/
(function (window) {
    define([
        'underscore',
        'IO',
        'Environment',
        'utilities/FilterFunction'
    ], function (
        _,
        IO,
        Environment,
        FilterFunction
    ) {
        console.log('IOBackendDevice - File loded.');

        IO.Backend.Device = _.extend({}, IO.Backend);

        IO.Backend.Device.onmessage = function (route, callback, listenToAllDevices, context) {

            if (typeof listenToAllDevices !== 'boolean') {
                context = listenToAllDevices;
                listenToAllDevices = false;
            }

            if (!listenToAllDevices) {
                route['data.deviceId'] = Environment.get('deviceId');
            }

            if (Environment.get('deviceId') === 'Default') {
                Environment.once('change:deviceId', function (Environment, deviceId) {
                    _.each(this.callbackList, function (item) {
                        if (item.route['data.deviceId']) {
                            item.route['data.deviceId'] = deviceId;
                            item.filter = FilterFunction.generate(item.route);
                        }
                    });
                }, IO.Backend.Device);
            }

            return IO.Backend.onmessage(route, callback, context);
        };

        window.IO = IO;

        return IO;
    });
}(this));
