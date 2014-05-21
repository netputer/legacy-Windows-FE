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

        IO.Backend.Device.onmessage = IO.Backend.onmessage;

        window.IO = IO;

        return IO;
    });
}(this));
