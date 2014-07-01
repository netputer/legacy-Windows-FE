/*global define*/
/**
 * @author lixiaopeng@wandoujia.com
 **/

(function (window) {
    define([
        'jquery',
        'IO',
        'Configuration'
    ], function (
        $,
        IO,
        CONFIG
    ) {
        console.log('WindowController - File loaded. ');

        var WindowController = {};

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

        WindowController.ShowWidzard = function (module) {
            if (_.isUndefined(module)) {
                module = '';
            }
            window.externalCall('', 'ShowWizard', module);
        };

        return WindowController;
    });
}(this));
