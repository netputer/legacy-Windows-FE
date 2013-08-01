/*global define, console*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'jquery',
        'IOBackendDevice',
        'Configuration'
    ], function (
        Backbone,
        _,
        $,
        IO,
        CONFIG
    ) {
        console.log('WelcomeService - File loaded.');

        var WelcomeService = _.extend({}, Backbone.Events);

        WelcomeService.openAutobackupFileAsync = function () {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.OPEN_AUTO_BACKUP_FILE,
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

        WelcomeService.getAutoBackupDateAsync = function () {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.GET_LATEST_AUTO_BACKUP,
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

        WelcomeService.getSystemSettingAsync = function (settingName) {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.GET_SYSTEM_SETTING,
                data : {
                    setting_name : settingName
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

        WelcomeService.openNotifySettingWindowAsync = function () {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.OPEN_NOTIFY_SETTING,
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

        WelcomeService.openNotifySettingWindowHelperAsync = function () {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.OPEN_NOTIFY_SETTING_HELPER,
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

        return WelcomeService;
    });
}(this));
