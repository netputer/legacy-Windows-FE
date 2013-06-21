/*global define*/
(function (window, undefined) {
    define([
        'underscore',
        'Environment'
    ], function (
        _,
        Environment
    ) {
        console.log('Settings - File loaded.');
        var localStorage = window.localStorage;

        var Settings = {};

        var DEVICE_SETTINGS_KEY = 'wdj_user_config_' + Environment.get('deviceId');
        var GLOBAL_SETTINGS_KEY = 'wdj_user_config_global';

        var deviceSettings = JSON.parse(localStorage.getItem(DEVICE_SETTINGS_KEY) || JSON.stringify({}));
        var globalSettings = JSON.parse(localStorage.getItem(GLOBAL_SETTINGS_KEY) || JSON.stringify({}));

        if (Environment.get('deviceId') === 'Default') {
            Environment.once('change:deviceId', function (Environment, deviceId) {
                DEVICE_SETTINGS_KEY = 'wdj_user_config_' + deviceId;
                deviceSettings = JSON.parse(localStorage.getItem(DEVICE_SETTINGS_KEY) || JSON.stringify({}));
            });
        }

        Settings.get = function (key) {
            var value;
            if (arguments.length === 0) {
                value = _.extend({}, globalSettings, deviceSettings);
            } else {
                value = deviceSettings[key] !== undefined ? deviceSettings[key] : globalSettings[key];
            }
            return value;
        };

        Settings.set = function (key, value, deviceId) {
            if (deviceId === true || deviceId === Environment.get('deviceId')) {
                deviceSettings[key] = value;
                localStorage.setItem(DEVICE_SETTINGS_KEY, JSON.stringify(deviceSettings));
            } else {
                globalSettings[key] = value;
                localStorage.setItem(GLOBAL_SETTINGS_KEY, JSON.stringify(globalSettings));
            }
        };

        Settings.remove = function (key, deviceId) {
            if (deviceId === true || deviceId === Environment.get('deviceId')) {
                delete deviceSettings[key];
                localStorage.setItem(DEVICE_SETTINGS_KEY, JSON.stringify(deviceSettings));
            } else {
                delete globalSettings[key];
                localStorage.setItem(GLOBAL_SETTINGS_KEY, JSON.stringify(globalSettings));
            }
        };

        Settings.clear = function (deviceId) {
            throw new Error('Settings.clear is not implemented because it\'s not well defined');
        };

        window.Settings = Settings;

        return Settings;
    });
}(this));
