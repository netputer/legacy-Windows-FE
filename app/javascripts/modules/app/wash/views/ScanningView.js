/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'utilities/StringUtil',
        'IO',
        'Configuration',
        'Device',
        'Environment',
        'Internationalization',
        'ui/TemplateFactory',
        'app/collections/AppsCollection',
        'app/wash/collections/AppsQueryResultCollection',
        'app/AppService'
    ], function (
        Backbone,
        _,
        doT,
        StringUtil,
        IO,
        CONFIG,
        Device,
        Environment,
        i18n,
        TemplateFactory,
        AppsCollection,
        AppsQueryResultCollection,
        AppService
    ) {
        console.log('ScanningView - File loaded.');

        var appsCollection;

        var cancel = false;

        var ScanningView = Backbone.View.extend({
            className : 'w-app-wash-scanning',
            template : doT.template(TemplateFactory.get('wash', 'wash-scanning')),
            initialize : function () {
                appsCollection = AppsCollection.getInstance();
            },
            setProgress : function (value) {
                this.$el.append(this.$('progress').detach().attr({
                    value : value,
                    max : 100
                }));
            },
            queryAppInfo : function (datas) {
                this.$('.title').html(i18n.app.QUERYING);
                this.$('.desc').html(i18n.app.QUERYING_TIP);

                var appData = [];
                _.each(datas, function (data) {
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
                        udid : Device.get('udid') || '',
                        version : Environment.get('backendVersion'),
                        token : StringUtil.MD5('wandoujia_windows' + CONFIG.enums.APP_WASH_AUTH_KEY + data),
                        data : data
                    },
                    dataType: 'json',
                    success : function (resp) {
                        if (!cancel) {
                            this.trigger('next', AppsQueryResultCollection.getInstance(resp));
                            this.remove();
                        }
                    }.bind(this),
                    error : function () {
                        this.trigger('error');
                        this.remove();
                    }.bind(this)
                });
            },
            startQueryMD5 : function () {
                cancel = false;

                if (appsCollection.loading || appsCollection.syncing) {
                    var refreshHandler = function () {
                        if (!appsCollection.loading && !appsCollection.syncing) {
                            this.startQueryMD5();
                            appsCollection.off('refresh', refreshHandler);
                        }
                    };
                    appsCollection.on('refresh', refreshHandler, this);
                } else {
                    var apps = appsCollection.getNormalApps();

                    if (apps.length === 0) {
                        this.trigger('next', AppsQueryResultCollection.getInstance([]));
                        this.remove();
                    } else {
                        var session = _.uniqueId('app_wash_md5_');
                        AppService.scanMD5Async(_.pluck(apps, 'id'), session).done(function (resp) {
                            if (!cancel) {
                                this.queryAppInfo(resp.body.success);
                            }
                        }.bind(this)).fail(function () {
                            this.trigger('error');
                            this.remove();
                        }.bind(this));

                        var handler = IO.Backend.onmessage({
                            'data.channel' : session
                        }, function (data) {
                            this.setProgress(data.current / data.total * 90);
                            if (data.current >= data.total || cancel) {
                                IO.Backend.offmessage(handler);
                            }
                        }, this);
                    }
                }
            },
            render : function () {
                this.$el.html(this.template({}));
                return this;
            },
            cancel : function () {
                cancel = true;
                this.remove();
            }
        });

        var factory = _.extend({
            getInstance : function () {
                return new ScanningView();
            }
        });

        return factory;
    });
}(this));
