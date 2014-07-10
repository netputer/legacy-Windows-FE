/*global define*/
(function (window) {
    define([
        'jquery',
        'underscore',
        'IO',
        'Configuration',
        'Device',
        'Environment',
        'utilities/StringUtil',
        'app/collections/AppsCollection',
        'app/AppService',
        'app/wash/collections/AppsQueryResultCollection'
    ], function (
        $,
        _,
        IO,
        CONFIG,
        Device,
        Environment,
        StringUtil,
        AppsCollection,
        AppService,
        AppsQueryResultCollection
    ) {
        console.log('XibaibaiService - File loaded. ');

        var XibaibaiService = {};

        XibaibaiService.scanAppsAsync = function () {
            var deferred = $.Deferred();

            var appsCollection = AppsCollection.getInstance();

            if (appsCollection.loading || appsCollection.syncing) {
                var refreshHandler = function () {
                    if (!appsCollection.loading && !appsCollection.syncing) {
                        this.scanAppsAsync();
                        appsCollection.off('refresh', refreshHandler);
                    }
                };
                appsCollection.on('refresh', refreshHandler, this);
            } else {
                var apps = appsCollection.getNormalApps();

                if (apps.length === 0) {
                    deferred.resolve(AppsQueryResultCollection.getInstance([]));
                } else {
                    AppService.scanMD5Async(_.pluck(apps, 'id')).done(function (resp) {
                        var appData = [];

                        _.each(resp.body.success, function (data) {
                            var app = appsCollection.get(data.item);

                            if (app && !app.get('base_info').ignore_wash) {
                                var signatures = app.get('base_info').signature;
                                if (signatures) {
                                    signatures = signatures.split(',');
                                    signatures = _.map(signatures, function (signature) {
                                        return StringUtil.MD5(signature.toUpperCase());
                                    });

                                    appData.push({
                                        packageName : data.item,
                                        md5 : data.value,
                                        signature : signatures.join(','),
                                        title : app.get('base_info').name,
                                        isSysApp : app.isSystem
                                    });

                                    app.set({
                                        fileMd5 : data.value,
                                        signatures : signatures.join(',')
                                    }, {
                                        silent : true
                                    });
                                }
                            }
                        });

                        var data = JSON.stringify({
                            sdkVersion : Device.get('SDKVersion'),
                            isRoot : Device.get('isRoot'),
                            apks : appData
                        });

                        IO.requestAsync({
                            type : 'post',
                            url : CONFIG.actions.APP_WASH_SCAN,
                            data : {
                                id : 'wandoujia_windows',
                                udid : Environment.get('deviceId') || '',
                                version : Environment.get('backendVersion'),
                                token : StringUtil.MD5('wandoujia_windows' + CONFIG.enums.APP_WASH_AUTH_KEY + data),
                                data : data
                            },
                            dataType: 'json',
                            success : function (resp) {
                                deferred.resolve(AppsQueryResultCollection.getInstance(resp));
                            },
                            error : deferred.reject
                        });
                    }).fail(deferred.reject);
                }
            }

            return deferred.promise();
        };

        return XibaibaiService;
    });
}(this));
