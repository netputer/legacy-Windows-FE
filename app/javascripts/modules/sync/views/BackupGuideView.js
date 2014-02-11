/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'jquery',
        'doT',
        'IO',
        'Internationalization',
        'Configuration',
        'Log',
        'ui/TemplateFactory',
        'utilities/StringUtil',
        'welcome/WelcomeService',
        'new_backuprestore/BackupRestoreService'
    ], function (
        Backbone,
        _,
        $,
        doT,
        IO,
        i18n,
        CONFIG,
        log,
        TemplateFactory,
        StringUtil,
        WelcomeService,
        BackupRestoreService
    ) {

        console.log('BackupGuideView - File loaded.');

        var BackupGuideView = Backbone.View.extend({
            className : 'w-backup-guide',
            template : doT.template(TemplateFactory.get('sync', 'backup-guide')),
            render : function () {
                var content = this.options.day > 0 ?
                                StringUtil.format(i18n.new_backuprestore.BACKUP_GUIDE_TIP_DAY, this.options.day) : i18n.new_backuprestore.BACKUP_GUIDE_TIP;
                this.$el.html(this.template({
                    content : content
                }));

                var $notifySetting = $(doT.template(TemplateFactory.get('misc', 'notify-setting'))({})).addClass('setting-ctn');
                this.$('.footer-ctn').prepend($notifySetting);

                log({
                    'event' : 'debug.sync.backup.guide.show'
                });

                return this;
            },
            clickButtonSetting : function () {
                WelcomeService.openNotifySettingWindowAsync();

                log({
                    'event' : 'ui.click.sync.backup.guide.setting'
                });
            },
            clickButtonBackup : function () {
                IO.requestAsync({
                    url : CONFIG.actions.PUBLISH_EVENT,
                    data : {
                        channel : CONFIG.events.SYNC_BACKUP_START,
                        value : JSON.stringify({
                            id : this.options.day
                        })
                    }
                });

                BackupRestoreService.closeAllNotificationAsync();

                log({
                    'event' : 'ui.click.sync.backup.guideStart'
                });
            },
            events : {
                'click .button-setting' : 'clickButtonSetting',
                'click .button-open' : 'clickButtonBackup'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new BackupGuideView(args);
            }
        });
        return factory;
    });
}(this));
