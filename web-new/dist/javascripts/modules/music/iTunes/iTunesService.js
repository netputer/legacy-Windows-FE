/*global define*/
(function (window, undefined) {
    define([
        'backbone',
        'underscore',
        'jquery',
        'IO',
        'Configuration',
        'Log'
    ], function (
        Backbone,
        _,
        $,
        IO,
        CONFIG,
        Log
    ) {
        console.log('iTunesService - File loaded. ');

        var iTunesService = _.extend(function () {}, Backbone.Events);

        iTunesService.checkiTunesAsync = function () {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.ITUNES_IMPORT_CHECK,
                success : function (resp) {
                    if (resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        return iTunesService;
    });
}(this));
