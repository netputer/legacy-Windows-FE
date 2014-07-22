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
                var fetchUrl = CONFIG.actions.APP_STARTER;

                if (this.options.type === 1) {
                    fetchUrl = CONFIG.actions.APP_GAME;
                }

                IO.requestAsync({
                    url : fetchUrl,
                    data : {
                        f : 'windows',
                        pos : 'w/nux',
                        opt_fields : [
                            'apps.downloadCount',
                            'apps.likesRate',
                            'apps.tagline',
                            'apps.title',
                            'apps.icons.px68',
                            'apps.ad',
                            'apps.apks.downloadUrl.url',
                            'apps.apks.bytes',
                            'apps.apks.packageName',
                            'apps.apks.versionCode',
                            'apps.apks.versionName'
                        ].join(',')
                    },
                    success : function (resp) {
                        this.queryResults = resp;
                        deferred.resolve();
                    }.bind(this),
                    error : deferred.reject
                });

                return deferred.promise();
            },
            checkAsync : function () {
                var deferred = $.Deferred();

                if (Settings.get('user_guide_shown_starter' + this.options.type)) {
                    setTimeout(deferred.reject);
                } else {
                    this.loadAppsAsync().done(function () {
                        var apps = this.queryResults[this.options.type].apps;
                        var length = apps.length;
                        if (length === 0) {
                            deferred.reject();
                        }

                        var appLength = this.apps.length;
                        var delta = 0;
                        var spliceArr = [];
                        if (appLength < 14) {
                            delta = 14 - appLength;
                            if (length > delta) {
                                spliceArr = apps.splice(0, delta);
                            } else {
                                spliceArr = apps;
                            }
                            this.apps = this.apps.concat(spliceArr);
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

                $target.html(i18n.app.INSTALLING).prop({
                    disabled : true
                });

                var successHandler, failedHandler;

                successHandler = IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.APP_INSTALL_SUCCESS
                }, function (data) {
                    if ($target.data('packagename') === data.package_name) {
                        $target.html(i18n.misc.NAV_APP_INSTALLED).prop({
                            disabled : true
                        });
                    }

                    IO.Backend.Device.offmessage(successHandler);
                    IO.Backend.Device.offmessage(failedHandler);
                }, this);

                failedHandler = IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.APP_INSTALL_FAILED
                }, function (data) {
                    if ($target.data('packagename') === data.package_name) {
                        $target.html(i18n.app.INSTALL).prop({
                            disabled : false
                        });
                    }

                    IO.Backend.Device.offmessage(successHandler);
                    IO.Backend.Device.offmessage(failedHandler);
                }, this);

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
