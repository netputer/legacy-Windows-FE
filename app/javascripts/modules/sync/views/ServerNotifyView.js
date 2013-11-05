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
        'backuprestore/BackupRestoreService'
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
                        'background-image' : 'url(' + this.options.icon + ')'
                    });
                }

                log({
                    'event' : 'debug.sync.server.notify.show'
                });

                return this;
            },
            clickButtonOpen : function () {
                IO.requestAsync({
                    url : CONFIG.actions.OPEN_URL_HELPER,
                    data : {
                        url : this.options.redirect_url
                    }
                });

                BackupRestoreService.closeAllNotificationInHelperAsync();

                log({
                    'event' : 'debug.sync.server.notify.show.open'
                });
            },
            events : {
                'click .button-open' : 'clickButtonOpen'
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
