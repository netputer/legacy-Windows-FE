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
        'Settings',
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
        Settings,
        StringUtil,
        CardView,
        AppsCollection,
        TaskService
    ) {
        var queryResponse;

        var StarterView = CardView.getClass().extend({
            className : CardView.getClass().prototype.className + ' w-guide-starter',
            template : doT.template(TemplateFactory.get('guide', 'starter')),
            initialize : function () {
                var apps = [];
                Object.defineProperties(this, {
                    apps : {
                        set : function (value) {
                            apps = value;
                        },
                        get : function () {
                            return apps;
                        }
                    }
                });

                this.on('next', function () {
                    Settings.set('user_guide_shown_starter' + this.options.type, true, true);
                }, this);
            },
            loadAppsAsync : function () {
                var deferred = $.Deferred();

                if (!queryResponse) {
                    IO.requestAsync({
                        url : CONFIG.actions.APP_STARTER,
                        data : {
                            f : 'windows'
                        },
                        success : function (resp) {
                            this.queryResults = resp;
                            queryResponse = resp;
                            deferred.resolve();
                        }.bind(this),
                        error : deferred.reject
                    });
                } else {
                    setTimeout(function () {
                        this.queryResults = queryResponse;
                        deferred.resolve();
                    }.bind(this));
                }

                return deferred.promise();
            },
            checkAppsAsync : function () {
                var deferred = $.Deferred();

                var appsCollection = AppsCollection.getInstance();
                var refreshHandler = function () {
                    if (!appsCollection.syncing && !appsCollection.loading && Device.get('isConnected')) {
                        this.stopListening(appsCollection, 'refresh', refreshHandler);
                        this.stopListening(Device, 'change:isConnected', refreshHandler);
                        deferred.resolve();
                    }
                };

                if (!appsCollection.syncing && !appsCollection.loading && Device.get('isConnected')) {
                    setTimeout(deferred.resolve);
                } else {
                    this.listenTo(appsCollection, 'refresh', refreshHandler);
                    this.listenTo(Device, 'change:isConnected', refreshHandler);
                    appsCollection.trigger('update');
                }

                return deferred.promise();
            },
            checkAsync : function () {
                var deferred = $.Deferred();

                if (Settings.get('user_guide_shown_starter' + this.options.type)) {
                    setTimeout(deferred.reject);
                } else {
                    $.when(this.loadAppsAsync(), this.checkAppsAsync()).done(function () {
                        var appsCollection = AppsCollection.getInstance();

                        var i;
                        var apps = this.queryResults[this.options.type].apps;
                        var length = apps.length;
                        var app;
                        for (i = 0; i < length; i++) {
                            app = apps[i];
                            if (appsCollection.get(app.packageName) === undefined) {
                                this.apps.push(app);
                            }
                            if (this.apps.length === 12) {
                                break;
                            }
                        }

                        log({
                            'event' : 'debug.guide_starter_show',
                            'type' : this.options.type
                        });

                        deferred.resolve();
                    }.bind(this)).fail(deferred.reject);
                }

                return deferred.promise();
            },
            render : function () {
                _.extend(this.events, StarterView.__super__.events);
                this.delegateEvents();

                this.$el.html(this.template({
                    action : this.options.action,
                    apps : this.apps,
                    type : this.options.type
                }));

                this.$('[data-title]').each(function () {
                    var tip = new PopupTip({
                        $host : $(this)
                    });
                    tip.zero();
                });

                return this;
            },
            clickButtonInstall : function (evt) {
                var $target = $(evt.currentTarget);
                var model = new Backbone.Model({
                    source : 'starter-' + this.options.type,
                    downloadUrl : decodeURIComponent($target.data('url')),
                    title : $target.data('name'),
                    iconPath : $target.data('icon')
                });

                TaskService.addTask(CONFIG.enums.TASK_TYPE_INSTALL, CONFIG.enums.MODEL_TYPE_APPLICATION, model);

                log({
                    'event' : 'ui.click.guide_starter_install',
                    'type' : this.options.type
                });
            },
            clickButtonSkip : function () {
                StarterView.__super__.clickButtonSkip.call(this);
                log({
                    'event' : 'ui.click.guide_starter_skip',
                    'type' : this.options.type
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

                TaskService.batchDownloadAsync(apps, 'starter-one-key-install-' + this.options.type);

                this.trigger('next');

                log({
                    'event' : 'ui.click.guide_starter_install_all',
                    'type' : this.options.type
                });
            },
            events : {
                'click .button-install' : 'clickButtonInstall'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new StarterView(_.extend({
                    action : i18n.welcome.GUIDE_STARTER_INSTALL_ALL
                }, args));
            }
        });

        return factory;
    });
}(this));
