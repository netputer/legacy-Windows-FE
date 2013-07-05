/*global define*/
(function (window) {
    define([
        'jquery',
        'backbone',
        'underscore',
        'doT',
        'Internationalization',
        'Log',
        'ui/TemplateFactory',
        'ui/PopupTip',
        'IO',
        'Device',
        'Configuration',
        'utilities/StringUtil',
        'guide/views/CardView',
        'app/collections/AppsCollection',
        'task/TaskService'
    ], function (
        $,
        Backbone,
        _,
        doT,
        i18n,
        log,
        TemplateFactory,
        PopupTip,
        IO,
        Device,
        CONFIG,
        StringUtil,
        CardView,
        AppsCollection,
        TaskService
    ) {
        var StarterView = CardView.getClass().extend({
            className : CardView.getClass().prototype.className + ' w-guide-starter',
            template : doT.template(TemplateFactory.get('guide', 'starter')),
            loadAppsAsync : function () {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.APP_STARTER,
                    success : function (resp) {
                        this.apps = resp[0].apps.splice(0, 8).concat(resp[1].apps.splice(0, 4));
                        deferred.resolve();
                    }.bind(this),
                    error : deferred.reject
                });

                return deferred.promise();
            },
            checkAppsAsync : function () {
                var deferred = $.Deferred();

                var appsCollection = AppsCollection.getInstance();
                var refreshHandler = function (appsCollection) {
                    if (!appsCollection.syncing && !appsCollection.loading && Device.get('isConnected')) {
                        this.stopListening(appsCollection, 'refresh', refreshHandler);
                        if (appsCollection.getNormalApps().length <= 20) {
                            deferred.resolve();
                        }
                    }
                };

                this.listenTo(appsCollection, 'refresh', refreshHandler);
                appsCollection.trigger('update');

                return deferred.promise();
            },
            checkAsync : function () {
                var deferred = $.Deferred();

                $.when(this.loadAppsAsync(), this.checkAppsAsync()).done(function () {
                    log({
                        'event' : 'debug.guide_starter_show'
                    });
                    deferred.resolve();
                }).fail(deferred.reject);

                return deferred.promise();
            },
            render : function () {
                this.$el.html(this.template({
                    action : this.options.action,
                    apps : this.apps
                }));

                this.$('[data-title]').each(function () {
                    var tip = new PopupTip({
                        $host : $(this)
                    });
                });

                return this;
            },
            clickButtonInstall : function (evt) {
                var $target = $(evt.currentTarget);
                var model = new Backbone.Model({
                    source : 'starter',
                    downloadUrl : decodeURIComponent($target.data('url')),
                    title : $target.data('name'),
                    iconPath : $target.data('icon')
                });

                TaskService.addTask(CONFIG.enums.TASK_TYPE_INSTALL, CONFIG.enums.MODEL_TYPE_APPLICATION, model);

                log({
                    'event' : 'ui.click.guide_starter_install'
                });
            },
            clickButtonSkip : function () {
                StarterView.__super__.clickButtonSkip.call(this);
                log({
                    'event' : 'ui.click.guide_starter_skip'
                });
            },
            clickButtonAction : function () {
                var apps = _.map(this.apps, function (app) {
                    return {
                        downloadUrl : app.apks[0].downloadUrl.url,
                        title : app.title,
                        iconSrc : app.icons.px68,
                        versionName : app.apks[0].versionName,
                        versionCode : app.apks[0].versionCode,
                        size : app.apks[0].bytes,
                        packageName : app.apks[0].packageName
                    };
                }, this);

                TaskService.batchDownloadAsync(apps, 'starter-one-key-install');

                this.trigger('next');

                log({
                    'event' : 'ui.click.guide_starter_install_all'
                });
            },
            events : {
                'click .button-install' : 'clickButtonInstall'
            }
        });

        var factory = _.extend({
            getInstance : function () {
                return new StarterView({
                    action : i18n.welcome.GUIDE_STARTER_INSTALL_ALL
                });
            }
        });

        return factory;
    });
}(this));
