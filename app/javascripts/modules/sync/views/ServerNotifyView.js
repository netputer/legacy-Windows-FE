/*global define*/
(function (window) {
    define([
        'underscore',
        'backbone',
        'jquery',
        'doT',
        'IO',
        'Account',
        'Internationalization',
        'Configuration',
        'Log',
        'ui/Panel',
        'ui/TemplateFactory',
        'utilities/StringUtil',
        'welcome/WelcomeService',
        'new_backuprestore/BackupRestoreService'
    ], function (
        _,
        Backbone,
        $,
        doT,
        IO,
        Account,
        i18n,
        CONFIG,
        log,
        Panel,
        TemplateFactory,
        StringUtil,
        WelcomeService,
        BackupRestoreService
    ) {

        console.log('ServerNotifyView - File loaded.');

        var ServerNotifyView = Backbone.View.extend({
            className : 'w-auto-backup-complete-notify',
            template : doT.template(TemplateFactory.get('sync', 'server-notify')),
            render : function () {
                this.$el.html(this.template({
                    title : this.options.title,
                    desc : this.options.desc
                }));

                if (this.options.icon !== '') {
                    this.$('.pic-ctn').css({
                        'background-image' : 'url(' + this.options.icon + ')',
                        'background-position' : '0 0',
                        'background-size' : 'contain'
                    });
                }

                log({
                    'event' : 'debug.sync.server.notify.show'
                });

                return this;
            },
            clickButtonOpen : function () {
                if (this.options.componentId) {
                    // Open doraemon
                    IO.requestAsync({
                        url : CONFIG.actions.OPEN_WANDUJIA,
                        data : {
                            doraemon_id : parseInt(this.options.componentId, 10),
                            doraemon_url : this.options.dataUrl,
                            source : 'server_notify'
                        }
                    });
                } else {
                    // Open browser
                    IO.requestAsync({
                        url : CONFIG.actions.OPEN_URL_HELPER,
                        data : {
                            url : this.options.redirectUrl
                        }
                    });
                }

                BackupRestoreService.closeAllNotificationInHelperAsync();

                log({
                    'event' : 'debug.sync.server.notify.show.open'
                });
            },
            events : {
                'click' : 'clickButtonOpen'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new ServerNotifyView(args);
            }
        });
        return factory;
    });
}(this));
