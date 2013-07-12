/*global define*/
/**
 * @author lixiaopeng@wandoujia.com
 **/

(function (window) {
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

        var history = window.history;

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

        WindowController.navigationState = function (id) {
            var $iframe;
            var branch;

            if (!id) {
                window.externalCall('', 'navigation', JSON.stringify({
                    id : '',
                    canGoBack : false,
                    canGoForward : false
                }));
            } else {
                $iframe = $(id);
                branch = $iframe.attr('branch');
                window.externalCall('', 'navigation', JSON.stringify({
                    id : id,
                    canGoBack : history.backCount(id, branch) ? true : false,
                    canGoForward : history.forwardCount(id, branch) ? true : false
                }));
            }
        };

        return WindowController;
    });
}(this));
