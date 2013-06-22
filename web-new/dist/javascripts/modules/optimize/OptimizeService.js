(function(window, undefined) {
    define(['IO'], function(IO) {
        console.log('OptimizeService - File loaded.');

        var OptimizeService = {};

        OptimizeService.scanAsync = function(session) {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.OPTIMIZE_SCAN,
                data : {
                    session : session || ''
                },
                success : function(resp) {
                    if(resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });
            
            return deferred.promise();
        };

        OptimizeService.checkAsync = function() {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.OPTIMIZE_CHECK,
                success : function(resp) {
                    if(resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        OptimizeService.installAsync = function() {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.OPTIMIZE_INSTALL,
                success : function(resp) {
                    if(resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        OptimizeService.optimizeCacheAsync = function() {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.OPTIMIZE_CACHE,
                success : function(resp) {
                    if(resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        OptimizeService.optimizeRamAsync = function(packageNames) {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.OPTIMIZE_RAM,
                data : {
                    tasks : packageNames.join(',')
                },
                success : function(resp) {
                    if(resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        OptimizeService.cancelAsync = function() {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.OPTIMIZE_CANCEL,
                success : function(resp) {
                    if(resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        OptimizeService.enums = {
            CHECK_STATE_INVALID : 0,
            CHECK_STATE_NO_APL : 1,
            CHECK_STATE_OLD_VERSION : 2,
            CHECK_STATE_READY : 3,
            OPTIMIZE_TYPE_VIRUS : 0,
            OPTIMIZE_TYPE_CACHE : 1,
            OPTIMIZE_TYPE_RAM : 2
        };

        return OptimizeService;
    });
})(this);