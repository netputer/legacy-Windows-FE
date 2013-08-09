/*global define*/
(function (window) {
    define([
        'backbone',
        'jquery',
        'underscore',
        'IO',
        'Internationalization',
        'Configuration',
        'utilities/StringUtil',
        'Device',
        'app/models/AppBaseModel'
    ], function (
        Backbone,
        $,
        _,
        IO,
        i18n,
        CONFIG,
        StringUtil,
        Device,
        AppBaseModel
    ) {
        console.log('AppModel - File loaded. ');

        var AppModel = AppBaseModel.extend({
            defaults : {
                installed : true,
                isUpdating : false,
                progress : 0,
                isWeb : false,
                loaded : false
            },
            parse : function (attrs) {
                delete attrs.base_info.requested_permission;
                delete attrs.base_info.pinyin;

                var baseInfo = attrs.base_info;

                if (!baseInfo.version_name) {
                    baseInfo.version_name = baseInfo.version_code.toString();
                    delete baseInfo.version_code;
                }

                if (!baseInfo.icon) {
                    baseInfo.icon = CONFIG.enums.TASK_DEFAULT_ICON_PATH_APP;
                } else {
                    if (!/http:\/\//.test(baseInfo.icon)) {
                        baseInfo.icon = 'file:///' + baseInfo.icon;
                    }
                }


                if (attrs.is_blocked) {
                    attrs.update = 4;
                } else {
                    if (attrs.isWeb) {
                        attrs.update = 0;
                    } else {
                        attrs.update = (!attrs.is_blocked &&
                                            attrs.upgrade_info.packageName !== undefined &&
                                            StringUtil.isURL(attrs.upgrade_info.downloadUrl)) ? 1 : 2;
                    }
                }

                // Pretreatment permission info
                var permissionInfos = _.sortBy(baseInfo.permission_info, function (permissionInfo) {
                    return -permissionInfo.protection_level;
                });
                var permissionStr;
                _.each(permissionInfos.concat(), function (permissionInfo) {
                    permissionStr = i18n.app[permissionInfo.name];
                    if (permissionStr) {
                        permissionInfo.name = permissionStr;
                    } else {
                        permissionInfos.splice(permissionInfos.indexOf(permissionInfo), 1);
                    }
                });
                baseInfo.permission_info = permissionInfos;

                attrs.base_info = baseInfo;
                return attrs;
            },
            initialize : function () {
                AppModel.__super__.initialize.apply(this, arguments);
                Object.defineProperties(this, {
                    isSystem : {
                        get : function () {
                            return this.get('base_info').is_system === true;
                        }
                    },
                    isCritical : {
                        get : function () {
                            return this.get('base_info').is_critical_app;
                        }
                    },
                    updateInfo : {
                        get : function () {
                            return new Backbone.Model(this.get('upgrade_info'));
                        }
                    },
                    isUpdatable : {
                        get : function () {
                            return !this.isIgnoredUpdate &&
                                    this.get('upgrade_info').packageName !== undefined &&
                                    StringUtil.isURL(this.get('upgrade_info').downloadUrl);
                        }
                    },
                    isIgnoredUpdate : {
                        get : function () {
                            return this.get('is_blocked') === true;
                        }
                    },
                    isMovable : {
                        get : function () {
                            var isMovable;
                            var movable = !this.isSystem &&
                                            (this.get('base_info').installed_location === CONFIG.enums.INSTALL_LOCATION_DEVICE) &&
                                            (Device.get('SDKVersion') >= 8);
                            if (Device.get('isWifi') || Device.get('isInternet')) {
                                isMovable = movable && (this.get('base_info').is_moveable === true);
                            } else {
                                isMovable = movable;
                            }
                            return isMovable;
                        }
                    },
                    isMovableToDevice : {
                        get : function () {
                            return !this.isSystem &&
                                    (this.get('base_info').installed_location === CONFIG.enums.INSTALL_LOCATION_EXTENTION) &&
                                    (Device.get('SDKVersion') >= 8);
                        }
                    },
                    isSuggestMove : {
                        get : function () {
                            return this.isMovable && (this.get('base_info').suggest_move === true);
                        }
                    }
                });
            },
            markEnjoyStateAsync : function (enjoy) {
                var deferred = $.Deferred();

                var packageName = this.get('base_info').package_name;
                IO.requestAsync({
                    url : CONFIG.actions.APP_ENJOY,
                    data : {
                        package_name : packageName,
                        version_code : this.get('base_info').version_code,
                        enjoy : enjoy
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('AppModel - Mark "' + packageName + '" enjoy state success.');
                            deferred.resolve(resp);
                        } else {
                            console.error('AppModel - Mark "' + packageName + '" enjoy state failed. Error info: ' + resp.state_line);
                            deferred.reject(resp);
                        }
                    }
                });

                return deferred.promise();
            },
            uninstallAsync: function () {
                var deferred = $.Deferred();
                var baseInfo = this.get('base_info');
                this.set('running', true);

                IO.requestAsync({
                    url : CONFIG.actions.APP_UNINSTALL,
                    data : {
                        package_name : baseInfo.package_name
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('AppModel - "' + baseInfo.name + '" uninstall success.');

                            if (this.collection && !resp.body.failed) {
                                var collection = this.collection;
                                collection.remove(this);
                                collection.trigger('refresh', collection);
                            } else {
                                this.set('running', false);
                            }

                            deferred.resolve(resp);
                        } else {
                            this.set('running', false);
                            console.error('AppModel - "' + baseInfo.name + '" uninstall failed. Error info: ' + resp.state_line);
                            deferred.reject(resp);
                        }
                    }.bind(this)
                });

                return deferred.promise();
            },
            ignoreUpdateAsync : function () {
                var deferred = $.Deferred();

                if (!this.get('is_blocked')) {
                    this.set('running', true);

                    var packageName = this.get('base_info').package_name;
                    IO.requestAsync({
                        url : CONFIG.actions.APP_IGNORE_UPDATE,
                        data : {
                            package_name : packageName
                        },
                        success : function (resp) {
                            this.set('running', false);

                            if (resp.state_code === 200) {
                                console.log('AppModel - Ignore "' + packageName + '" success.');

                                this.set({
                                    is_blocked : true,
                                    update : 4
                                });

                                deferred.resolve(resp);
                            } else {
                                console.error('AppModel - Ignore "' + packageName + '" failed. Error info: ' + resp.state_line);

                                deferred.reject(resp);
                            }
                        }.bind(this)
                    });
                } else {
                    deferred.resolve();
                }

                return deferred.promise();
            },
            hideWebAppAsync : function () {
                var deferred = $.Deferred();

                if (!this.get('is_blocked')) {
                    this.set('running', true);

                    var packageName = this.get('base_info').package_name;
                    IO.requestAsync({
                        url : CONFIG.actions.APP_HIDE_WEB_APPS,
                        data : {
                            package_name : packageName
                        },
                        success : function (resp) {
                            this.set('running', false);

                            if (resp.state_code === 200) {
                                console.log('AppModel - Hide "' + packageName + '" success.');

                                if (this.collection) {
                                    var collection = this.collection;
                                    if (collection.isWeb) {
                                        collection.remove(this);
                                    }
                                    collection.trigger('refresh', collection);
                                }

                                deferred.resolve(resp);
                            } else {
                                console.error('AppModel - Hide "' + packageName + '" failed. Error info: ' + resp.state_line);

                                deferred.reject(resp);
                            }
                        }.bind(this)
                    });
                } else {
                    deferred.resolve();
                }

                return deferred.promise();
            },
            unignoreUpdateAsync : function () {
                var deferred = $.Deferred();

                if (this.get('is_blocked')) {
                    this.set('running', true);

                    var packageName = this.get('base_info').package_name;
                    IO.requestAsync({
                        url : CONFIG.actions.APP_UNIGNORE_UPDATE,
                        data : {
                            package_name : packageName
                        },
                        success : function (resp) {
                            this.set('running', false);

                            if (resp.state_code === 200) {
                                console.log('AppModel - Unignore "' + packageName + '" success.');

                                this.set({
                                    is_blocked : false,
                                    update : this.isUpdatable ? 1 : 0,
                                    running : false
                                });

                                deferred.resolve(resp);
                            } else {
                                console.error('AppModel - Unignore "' + packageName + '" failed. Error info: ' + resp.state_line);

                                deferred.reject(resp);
                            }
                        }.bind(this)
                    });
                } else {
                    deferred.resolve();
                }

                return deferred.promise();
            },
            getCommentaryAsync : function () {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.APP_GET_COMMENT,
                    data : {
                        package_name : this.get('base_info').package_name,
                        version_code : this.get('base_info').version_code
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('AppModel - Get comment success.');
                            deferred.resolve(resp);
                        } else {
                            console.error('AppModel - Get comment faild. Error info: ' + resp.state_line);
                            deferred.reject(resp);
                        }
                    }
                });

                return deferred.promise();
            },
            queryAppInfoAsync : function () {
                var deferred = $.Deferred();

                if (this.get('loaded')) {
                    deferred.resolve(this.toJSON());
                } else {
                    IO.requestAsync({
                        url : CONFIG.actions.APP_QUERY_INFO,
                        data : {
                            pns : this.get('base_info').package_name,
                            from : 'client.dora.app.list',
                            opt_fields : [
                                'title',
                                'icons.px36',
                                'icons.px48',
                                'categories',
                                'likesCount',
                                'likesRate',
                                'apks.downloadUrl.url',
                                'apks.bytes',
                                'apks.versionName',
                                'apks.versionCode'
                            ].join(',')
                        },
                        success : function (resp) {
                            resp = resp[0];

                            this.set({
                                base_info : _.extend(this.get('base_info'), {
                                    name : resp.title,
                                    downloadUrl : resp.apks[0].downloadUrl,
                                    icon : resp.icons.px36,
                                    icon48 : resp.icons.px48,
                                    version_name : resp.apks[0].versionName,
                                    apk_size : resp.apks[0].bytes
                                }),
                                upgrade_info : {},
                                loaded : true
                            });
                            deferred.resolve(resp);
                        }.bind(this),
                        error : function (resp) {
                            deferred.reject(resp);
                        }
                    });
                }

                return deferred.promise();
            }
        });

        return AppModel;
    });
}(this));
