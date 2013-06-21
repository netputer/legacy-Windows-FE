/*global define*/
/**
 * @author lixiaopeng@wandoujia.com
 **/

(function (window, undefined) {
    define([
        'backbone',
        'underscore',
        'jquery',
        'IO',
        'Configuration'
    ], function (
        Backbone,
        _,
        $,
        IO,
        CONFIG
    ) {
        console.log('WindowController - File loaded');

        var WindowController = function () {};
        WindowController.blockWindowAsync = function () {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.BLOCK_WINDOW,
                data : {
                    blocking : 1
                },
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

        WindowController.releaseWindowAsync = function () {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.BLOCK_WINDOW,
                data : {
                    blocking : 0
                },
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

        return WindowController;
    });
}(this));
