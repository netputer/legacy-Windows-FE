/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'IO',
        'Configuration',
        'Log',
        'ui/Panel',
        'ui/TemplateFactory',
        'welcome/WelcomeService',
        'new_backuprestore/BackupRestoreService'
    ], function (
        Backbone,
        _,
        doT,
        $,
        IO,
        CONFIG,
        log,
        Panel,
        TemplateFactory,
        WelcomeService,
        BackupRestoreService
    ) {

        console.log('OpenSyncNotifyView - File loaded.');

        var OpenSyncNotifyView = Backbone.View.extend({
            className : 'w-open-sync-notify',
            template : doT.template(TemplateFactory.get('sync', 'open-sync')),
            render : function () {
                this.$el.html(this.template({
                    num : this.options.num
                }));

                var $notifySetting = $(doT.template(TemplateFactory.get('misc', 'notify-setting'))({})).addClass('setting-ctn');
                this.$('.footer-ctn').prepend($notifySetting);

                log({
                    'event' : 'debug.sync.push_open_sync_notify_show',
                    'is_helper' : this.options.helper
                });

                return this;
            },
            clickButtonOpen : function () {
                if (this.options.helper) {
                    IO.requestAsync({
                        url : CONFIG.actions.OPEN_SYNC_AND_START_HELPER
                    });
                } else {
                    IO.requestAsync({
                        url : CONFIG.actions.OPEN_SYNC_AND_START
                    });
                }

                BackupRestoreService.closeAllNotificationAutoAsync(this.options.helper);

                log({
                    'event' : 'ui.click.push_open_sync_open',
                    'is_helper' : this.options.helper
                });
            },
            clickButtonSetting : function () {
                if (this.options.helper) {
                    WelcomeService.openNotifySettingWindowHelperAsync();
                } else {
                    WelcomeService.openNotifySettingWindowAsync();
                }

                log({
                    'event' : 'ui.click.push_open_sync_setting',
                    'is_helper' : this.options.helper
                });
            },
            events : {
                'click .button-setting' : 'clickButtonSetting',
                'click .button-open' : 'clickButtonOpen'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new OpenSyncNotifyView(args);
            }
        });
        return factory;
    });
}(this));
