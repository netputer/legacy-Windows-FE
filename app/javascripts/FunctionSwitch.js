/*global console, define*/
/*jslint bitwise: true*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'Configuration',
        'Environment',
        'utilities/QueryString',
        'IOBackendDevice'
    ], function (
        Backbone,
        _,
        CONFIG,
        Environment,
        QueryString,
        IO
    ) {
        console.log('FunctionSwitch - File loaded.');

        var PRIVACY = {};

        var SETTING = '0x' + parseInt(QueryString.get('privacy'), 10).toString(16);
        var RECORD_BROWSE_HISTORY = '0x00000010';
        var ENABLE_APP_UPGRADE = '0x00000001';
        var ENABLE_DEBUG = '0x00000040';

        Object.defineProperties(PRIVACY, {
            RECORD_BROWSE_HISTORY : {
                get : function () {
                    return SETTING & RECORD_BROWSE_HISTORY;
                }
            },
            ENABLE_APP_UPGRADE : {
                get : function () {
                    return SETTING & ENABLE_APP_UPGRADE;
                }
            },
            ENABLE_DEBUG : {
                get : function () {
                    return !(SETTING & ENABLE_DEBUG);
                }
            }
        });

        var FunctionSwitch = _.extend({}, Backbone.Events);

        Object.defineProperties(FunctionSwitch, {
            PRIVACY : {
                get : function () {
                    return PRIVACY;
                }
            },
            IS_CHINESE_VERSION :  {
                get : function () {
                    return Environment.get('locale') === CONFIG.enums.LOCALE_DEFAULT ||
                            Environment.get('locale') === CONFIG.enums.LOCALE_ZH_CN;
                }
            },
            ENABLE_APP_UPGRADE : {
                get : function () {
                    return PRIVACY.ENABLE_APP_UPGRADE &&
                            (Environment.get('locale') === CONFIG.enums.LOCALE_DEFAULT ||
                                Environment.get('locale') === CONFIG.enums.LOCALE_ZH_CN);
                }
            },
            ENABLE_APP_COMMENT : {
                get : function () {
                    return Environment.get('locale') === CONFIG.enums.LOCALE_DEFAULT ||
                            Environment.get('locale') === CONFIG.enums.LOCALE_ZH_CN;
                }
            },
            ENABLE_APP_RECOMMEND : {
                get : function () {
                    return Environment.get('locale') === CONFIG.enums.LOCALE_DEFAULT ||
                            Environment.get('locale') === CONFIG.enums.LOCALE_ZH_CN;
                }
            },
            ENABLE_APP_PERMISSION : {
                get : function () {
                    return Environment.get('locale') === CONFIG.enums.LOCALE_DEFAULT ||
                            Environment.get('locale') === CONFIG.enums.LOCALE_ZH_CN;
                }
            },
            ENABLE_APP_SEARCH : {
                get : function () {
                    return Environment.get('locale') === CONFIG.enums.LOCALE_DEFAULT ||
                            Environment.get('locale') === CONFIG.enums.LOCALE_ZH_CN;
                }
            },
            ENABLE_DORAEMON : {
                get : function () {
                    return Environment.get('locale') === CONFIG.enums.LOCALE_DEFAULT ||
                            Environment.get('locale') === CONFIG.enums.LOCALE_ZH_CN;
                }
            },
            ENABLE_PHOTO_SYNC : {
                get : function () {
                    return Environment.get('locale') === CONFIG.enums.LOCALE_DEFAULT ||
                            Environment.get('locale') === CONFIG.enums.LOCALE_ZH_CN;
                }
            },
            ENABLE_PHOTO_SYNC_DOWNLOAD : {
                get : function () {
                    return (Environment.get('locale') === CONFIG.enums.LOCALE_DEFAULT ||
                                Environment.get('locale') === CONFIG.enums.LOCALE_ZH_CN) &&
                                !Environment.get('internetBar');
                }
            },
            ENABLE_DUAL_SIM : {
                get : function () {
                    return Environment.get('locale') === CONFIG.enums.LOCALE_DEFAULT ||
                            Environment.get('locale') === CONFIG.enums.LOCALE_ZH_CN;
                }
            },
            ENABLE_OPTIMIZE : {
                get : function () {
                    return Environment.get('locale') === CONFIG.enums.LOCALE_DEFAULT ||
                            Environment.get('locale') === CONFIG.enums.LOCALE_ZH_CN;
                }
            },
            ENABLE_WDAPK : {
                get : function () {
                    return Environment.get('locale') === CONFIG.enums.LOCALE_DEFAULT ||
                            Environment.get('locale') === CONFIG.enums.LOCALE_ZH_CN;
                }
            },
            ENABLE_MY_APPS : {
                get : function () {
                    return Environment.get('locale') === CONFIG.enums.LOCALE_DEFAULT ||
                            Environment.get('locale') === CONFIG.enums.LOCALE_ZH_CN;
                }
            },
            ENABLE_SUGGESTION_INSTALL : {
                get : function () {
                    return Environment.get('locale') === CONFIG.enums.LOCALE_DEFAULT ||
                            Environment.get('locale') === CONFIG.enums.LOCALE_ZH_CN;
                }
            },
            ENABLE_MY_MUTIL_SOCIAL_PLATFORM : {
                get : function () {
                    return Environment.get('locale') === CONFIG.enums.LOCALE_DEFAULT ||
                            Environment.get('locale') === CONFIG.enums.LOCALE_ZH_CN;
                }
            },
            ENABLE_SHARE_SET_WALLPAPER : {
                get : function () {
                    return Environment.get('locale') === CONFIG.enums.LOCALE_DEFAULT ||
                            Environment.get('locale') === CONFIG.enums.LOCALE_ZH_CN;
                }
            },
            ENABLE_CLOUD_BACKUP_RESTORE : {
                get : function () {
                    return Environment.get('locale') === CONFIG.enums.LOCALE_DEFAULT ||
                            Environment.get('locale') === CONFIG.enums.LOCALE_ZH_CN;
                }
            },
            ENABLE_SHARE_UNINSTALL : {
                get : function () {
                    return Environment.get('locale') === CONFIG.enums.LOCALE_DEFAULT ||
                            Environment.get('locale') === CONFIG.enums.LOCALE_ZH_CN;
                }
            },
            ENABLE_BACKUP_APP_DATA : {
                get : function () {
                    return Environment.get('locale') === CONFIG.enums.LOCALE_DEFAULT ||
                            Environment.get('locale') === CONFIG.enums.LOCALE_ZH_CN;
                }
            },
            ENABLE_APP_WASH : {
                get : function () {
                    return false;
                    // return Environment.get('locale') === CONFIG.enums.LOCALE_DEFAULT ||
                    //         Environment.get('locale') === CONFIG.enums.LOCALE_ZH_CN;
                }
            },
            ENABLE_AUTOBACKUP_POPUP : {
                get : function () {
                    return (Environment.get('locale') === CONFIG.enums.LOCALE_DEFAULT ||
                                Environment.get('locale') === CONFIG.enums.LOCALE_ZH_CN) &&
                                !Environment.get('internetBar');
                }
            },
            ENABLE_PHOTO_DOWNLOAD_POPUP : {
                get : function () {
                    return (Environment.get('locale') === CONFIG.enums.LOCALE_DEFAULT ||
                                Environment.get('locale') === CONFIG.enums.LOCALE_ZH_CN) &&
                                !Environment.get('internetBar');
                }
            },
            ENABLE_USER_GUIDE : {
                get : function () {
                    return Environment.get('locale') === CONFIG.enums.LOCALE_DEFAULT ||
                            Environment.get('locale') === CONFIG.enums.LOCALE_ZH_CN;
                }
            }
        });

        IO.Backend.Device.onmessage({
            'data.channel' : CONFIG.events.SETTING_PRIVACY
        }, function (data) {
            SETTING = '0x' + parseInt(data, 10).toString(16);
            FunctionSwitch.trigger('change', FunctionSwitch);
        }, true);

        window.FunctionSwitch = FunctionSwitch;

        return FunctionSwitch;
    });
}(this));
