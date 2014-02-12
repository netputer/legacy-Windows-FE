/*global console, define*/
/*jslint bitwise: true*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'ProjectConfig',
        'Configuration',
        'Environment',
        'utilities/QueryString',
        'IOBackendDevice'
    ], function (
        Backbone,
        _,
        ProjectConfig,
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
            ENABLE_APP_UPGRADE : {
                get : function () {
                    return SETTING & ENABLE_APP_UPGRADE;
                }
            },
            ENABLE_DEBUG : {
                get : function () {
                    return !(SETTING & ENABLE_DEBUG);
                }
            },
            RECORD_BROWSE_HISTORY : {
                get : function () {
                    return SETTING & RECORD_BROWSE_HISTORY;
                }
            }
        });

        var FunctionSwitch = _.extend({}, Backbone.Events);
        var IS_CHINESE_VERSION = Environment.get('locale') === CONFIG.enums.LOCALE_DEFAULT ||
                                        Environment.get('locale') === CONFIG.enums.LOCALE_ZH_CN;

        Object.defineProperties(FunctionSwitch, {
            ENABLE_APP : {
                get : function () {
                    return !ProjectConfig.get('HIDE_NAV_APP');
                }
            },
            ENABLE_APP_COMMENT : {
                get : function () {
                    return IS_CHINESE_VERSION;
                }
            },
            ENABLE_APP_INSTALLED : {
                get : function () {
                    return !ProjectConfig.get('HIDE_NAV_APP_INSTALLED');
                }
            },
            ENABLE_APP_PANEL : {
                get : function () {
                    return !ProjectConfig.get('HIDE_APP_PANEL');
                }
            },
            ENABLE_APP_PERMISSION : {
                get : function () {
                    return IS_CHINESE_VERSION;
                }
            },
            ENABLE_APP_RECOMMEND : {
                get : function () {
                    return IS_CHINESE_VERSION;
                }
            },
            ENABLE_APP_SEARCH : {
                get : function () {
                    return IS_CHINESE_VERSION;
                }
            },
            ENABLE_APP_SYS : {
                get : function () {
                    return !ProjectConfig.get('HIDE_NAV_APP_SYS');
                }
            },
            ENABLE_APP_UPDATABLE : {
                get : function () {
                    return !ProjectConfig.get('HIDE_NAV_APP_UPDATABLE');
                }
            },
            ENABLE_APP_UPGRADE : {
                get : function () {
                    return IS_CHINESE_VERSION &&
                                PRIVACY.ENABLE_APP_UPGRADE &&
                                !ProjectConfig.get('DISABLE_APP_UPGRADE');
                }
            },
            ENABLE_APP_WASH : {
                get : function () {
                    return IS_CHINESE_VERSION;
                }
            },
            ENABLE_AUTOBACKUP_POPUP : {
                get : function () {
                    return IS_CHINESE_VERSION &&
                                !Environment.get('internetBar');
                }
            },
            ENABLE_BACKUP_RESTORE : {
                get : function () {
                    return !ProjectConfig.get('HIDE_NAV_BACKUP_RESTORE');
                }
            },
            ENABLE_BACKUP_APP_DATA : {
                get : function () {
                    return IS_CHINESE_VERSION;
                }
            },
            ENABLE_CLOUD_BACKUP_RESTORE : {
                get : function () {
                    return IS_CHINESE_VERSION;
                }
            },
            ENABLE_CONTACT : {
                get : function () {
                    return !ProjectConfig.get('HIDE_NAV_CONTACT');
                }
            },
            ENABLE_CONTACT_ALL : {
                get : function () {
                    return !ProjectConfig.get('HIDE_NAV_CONTACT_ALL');
                }
            },
            ENABLE_CONTACT_HAS_PHONE : {
                get : function () {
                    return !ProjectConfig.get('HIDE_NAV_CONTACT_HAS_PHONE');
                }
            },
            ENABLE_CONTACT_STARRED : {
                get : function () {
                    return !ProjectConfig.get('HIDE_NAV_CONTACT_STARRED');
                }
            },
            ENABLE_DORAEMON : {
                get : function () {
                    return IS_CHINESE_VERSION &&
                                !ProjectConfig.get('DISABLE_DORAEMON');
                }
            },
            ENABLE_DUAL_SIM : {
                get : function () {
                    return IS_CHINESE_VERSION;
                }
            },
            ENABLE_MUSIC : {
                get : function () {
                    return !ProjectConfig.get('HIDE_NAV_MUSIC');
                }
            },
            ENABLE_MY_APPS : {
                get : function () {
                    return IS_CHINESE_VERSION;
                }
            },
            ENABLE_MY_MUTIL_SOCIAL_PLATFORM : {
                get : function () {
                    return IS_CHINESE_VERSION;
                }
            },
            ENABLE_OPTIMIZE : {
                get : function () {
                    return IS_CHINESE_VERSION;
                }
            },
            ENABLE_PHOTO_DOWNLOAD_POPUP : {
                get : function () {
                    return IS_CHINESE_VERSION &&
                                !Environment.get('internetBar');
                }
            },
            ENABLE_PHOTO_SYNC : {
                get : function () {
                    return IS_CHINESE_VERSION;
                }
            },
            ENABLE_PHOTO_SYNC_DOWNLOAD : {
                get : function () {
                    return IS_CHINESE_VERSION &&
                                !Environment.get('internetBar');
                }
            },
            ENABLE_PIC : {
                get : function () {
                    return !ProjectConfig.get('HIDE_NAV_PIC');
                }
            },
            ENABLE_PIC_GALLERY : {
                get : function () {
                    return !ProjectConfig.get('HIDE_NAV_PIC_GALLERY');
                }
            },
            ENABLE_PIC_PHONE_LIB : {
                get : function () {
                    return !ProjectConfig.get('HIDE_NAV_PIC_PHONE_LIB');
                }
            },
            ENABLE_SHARE_SET_WALLPAPER : {
                get : function () {
                    return IS_CHINESE_VERSION;
                }
            },
            ENABLE_SHARE_UNINSTALL : {
                get : function () {
                    return IS_CHINESE_VERSION;
                }
            },
            ENABLE_SMS : {
                get : function () {
                    return !ProjectConfig.get('HIDE_NAV_SMS');
                }
            },
            ENABLE_SMS_ALL : {
                get : function () {
                    return !ProjectConfig.get('HIDE_NAV_SMS_ALL');
                }
            },
            ENABLE_SMS_UNREAD : {
                get : function () {
                    return !ProjectConfig.get('HIDE_NAV_SMS_UNREAD');
                }
            },
            ENABLE_SUGGESTION_INSTALL : {
                get : function () {
                    return IS_CHINESE_VERSION;
                }
            },
            ENABLE_TASKMANAGER_ACTION : {
                get : function () {
                    return !ProjectConfig.get('DISABLE_TASKMANAGER_ACTION');
                }
            },
            ENABLE_USER_GUIDE : {
                get : function () {
                    return IS_CHINESE_VERSION &&
                                !ProjectConfig.get('DISABLE_USER_GUIDE');
                }
            },
            ENABLE_VIDEO : {
                get : function () {
                    return !ProjectConfig.get('HIDE_NAV_VIDEO');
                }
            },
            ENABLE_WDAPK : {
                get : function () {
                    return IS_CHINESE_VERSION;
                }
            },
            ENABLE_WELCOME : {
                get : function () {
                    return !ProjectConfig.get('HIDE_NAV_WELCOME');
                }
            },
            ENABLE_WELCOME_FEED : {
                get : function () {
                    return !ProjectConfig.get('DISABLE_WELCOME_FEED');
                }
            },
            IS_CHINESE_VERSION : {
                get : function () {
                    return IS_CHINESE_VERSION;
                }
            },
            PRIVACY : {
                get : function () {
                    return PRIVACY;
                }
            },
            SHOW_FIRST_EXTENSION : {
                get : function () {
                    return ProjectConfig.get('SHOW_FIRST_EXTENSION');
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
