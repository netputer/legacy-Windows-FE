/*global define*/
(function (window, undefined) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'ui/TemplateFactory',
        'utilities/StringUtil',
        'IO',
        'Log',
        'Configuration',
        'Internationalization',
        'task/TaskService',
        'app/collections/AppsCollection'
    ], function (
        Backbone,
        _,
        doT,
        $,
        TemplateFactory,
        StringUtil,
        IO,
        log,
        CONFIG,
        i18n,
        TaskService,
        AppsCollection
    ) {
        console.log('AppDependencyView - File loaded.');

        var appsCollection;

        var AppDependencyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('doraemon', 'app-dependency')),
            className : 'w-browser-app-dependency',
            initialize : function () {
                appsCollection = appsCollection || AppsCollection.getInstance();

                this.listenTo(this.model, 'change:extension', function (model, extension) {
                    if (extension.android_apps && extension.android_apps.length > 0 && extension.android_apps[0].package_name) {
                        this.loadAppInfoAsync().done(function (resp) {
                            this.renderContent(resp[0]);
                        }.bind(this));
                    }
                });
            },
            renderContent : function (data) {
                this.appModel = new Backbone.Model(data);
                this.$el.html(this.template(this.appModel.toJSON())).slideDown('fast');

                var iconURL = this.appModel.get('icons').px48;
                var icon = new window.Image();
                var $icon = $(icon);
                var loadHandler = function () {
                    this.$('img').attr({
                        src : icon.src
                    });
                    $icon.off('load');
                    $icon.off('error');
                }.bind(this);

                var errorHandler = function () {
                    $icon.off('load');
                    $icon.off('error');
                };
                $icon.on('load', loadHandler);
                $icon.on('error', errorHandler);
                $icon.attr({
                    src : iconURL
                });

                this.listenTo(appsCollection, 'refresh', function (appsCollection) {
                    if (appsCollection.isInstalled(this.model.get('extension').android_apps[0].package_name)) {
                        this.slideUp('fast');
                    }
                });
            },
            loadAppInfoAsync : function () {
                var deferred = $.Deferred();

                var loadInfo = function () {
                    if (!appsCollection.isInstalled(this.model.get('extension').android_apps[0].package_name)) {
                        IO.requestAsync({
                            url : CONFIG.actions.APP_QUERY_INFO,
                            data : {
                                pns : this.model.get('extension').android_apps[0].package_name,
                                from : 'client.dora.app.dependency',
                                opt_fields : ['title', 'downloadCount', 'apks.bytes', 'icons.px48', 'apks.downloadUrl.url'].join(',')
                            },
                            success : function (resp) {
                                deferred.resolve(resp);
                            },
                            error : function (resp) {
                                deferred.reject(resp);
                            }
                        });
                    } else {
                        deferred.reject();
                    }
                };

                if (appsCollection.loading || appsCollection.syncing) {
                    var refreshHandler = function (appsCollection) {
                        loadInfo.call(this);
                        appsCollection.off('refresh', refreshHandler);
                    };
                    appsCollection.on('refresh', refreshHandler, this);
                } else {
                    loadInfo.call(this);
                }

                return deferred.promise();
            },
            render : function () {
                if (this.model.get('extension') && this.model.get('extension').android_apps > 0 && this.model.get('extension').android_apps[0].package_name) {
                    this.loadAppInfoAsync().done(function (resp) {
                        this.renderContent(resp[0]);
                    }.bind(this));
                }
                return this;
            },
            clickButtonClose : function () {
                this.$el.slideUp('fast');

                log({
                    'event' : 'ui.click.dora.app.dependency.install',
                    'id' : this.model.id
                });
            },
            clickButtonInstall : function () {
                TaskService.addTask(CONFIG.enums.TASK_TYPE_INSTALL, CONFIG.enums.MODEL_TYPE_APPLICATION, new Backbone.Model({
                    downloadUrl : this.appModel.get('apks')[0].downloadUrl.url,
                    title : this.appModel.get('title'),
                    iconPath : this.appModel.get('icons').px48,
                    source : 'app-dependency',
                    packageName : this.model.get('extension').android_apps[0].package_name
                }));

                this.$el.slideUp('fast');

                log({
                    'event' : 'ui.click.dora.app.dependency.install',
                    'id' : this.model.id
                });
            },
            events : {
                'click .button-close' : 'clickButtonClose',
                'click .button-install' : 'clickButtonInstall'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new AppDependencyView(args);
            }
        });

        return factory;
    });
}(this));
