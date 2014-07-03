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

        WindowController.ShowWizard = _.debounce(function (module, forceDisplay) {

            if (_.isUndefined(module)) {
                module = '';
            }

            if (_.isUndefined(forceDisplay)) {
                forceDisplay = false;
            }

            if (forceDisplay || window.SnapPea.isPimModule(SnapPea.CurrentModule)) {
                window.externalCall('', 'ShowWizard', module);
            }

        }, 500);

        WindowController.ShowErrorWizard =function () {
            window.externalCall('', 'ShowErrorWizard');
        };

        return WindowController;
    });
}(this));
