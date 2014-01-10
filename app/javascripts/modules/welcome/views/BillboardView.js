/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'ui/TemplateFactory',
        'Configuration',
        'Log',
        'Environment',
        'IOBackendDevice',
        'browser/views/BrowserModuleView',
        'task/TaskService'
    ], function (
        Backbone,
        _,
        doT,
        TemplateFactory,
        CONFIG,
        log,
        Environment,
        IO,
        BrowserModuleView,
        TaskService
    ) {
        console.log('BillboardView - File loaded. ');

        var readystatechangeHandler = function (evt) {
            var state = evt.originalEvent.srcElement.readyState;
            switch (state) {
            case 'complete':
                this.loading = false;

                this.$('iframe').removeClass('w-layout-hidden');
                break;
            case 'start':
                this.loading = true;
                break;
            }
        };

        var handler;

        var BillboardView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('welcome', 'billboard')),
            className : 'w-welcome-billboard hbox',
            initialize : function () {
                var loading = false;
                Object.defineProperties(this, {
                    loading : {
                        set : function (value) {
                            loading = Boolean(value);
                            if (loading) {
                                this.$('.w-ui-loading').show();
                            } else {
                                this.$('.w-ui-loading').hide();
                            }
                        },
                        get : function () {
                            return loading;
                        }
                    }
                });

                handler = IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.CUSTOM_WELCOME_BILLBOARD_NAVIGATE
                }, function (data) {
                    switch (data.type) {
                    case 'ext':
                        if (parseInt(data.id, 10) === 18) {
                            BrowserModuleView.navigate(data.url);
                        } else {
                            BrowserModuleView.navigateToThirdParty(data.id, '', data.url);
                        }
                        break;
                    case 'download':
                        TaskService.addTask(CONFIG.enums.TASK_TYPE_INSTALL, 'app', new Backbone.Model({
                            downloadUrl : data.url,
                            title : data.name,
                            iconPath : data.icon,
                            source : 'billboard',
                            packageName : data.packageName
                        }));
                        break;
                    }
                });
            },
            render : function () {
                var url;
                if (Environment.get('locale') === CONFIG.enums.LOCALE_DEFAULT ||
                        Environment.get('locale') === CONFIG.enums.LOCALE_ZH_CN) {
                    url = CONFIG.enums.URL_WELCOME_BILLBOARD;
                } else {
                    url = CONFIG.enums.URL_WELCOME_BILLBOARD_EN;
                }

                this.$el.html(this.template({
                    url : url
                }));

                this.$('iframe').on('readystatechange', readystatechangeHandler.bind(this));

                return this;
            },
            remove : function () {
                IO.Backend.Device.offmessage(handler);
                this.$('iframe').off('readystatechange');
                BillboardView.__super__.call(this);
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new BillboardView(args);
            }
        });

        return factory;
    });
}(this));
