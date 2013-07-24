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

        console.log('AutoBackupCompleteNotifyView - File loaded.');

        var AutoBackupCompleteNotifyView = Backbone.View.extend({
            className : 'w-auto-backup-complete-notify',
            template : doT.template(TemplateFactory.get('sync', 'auto-backup-complete-notify')),
            render : function () {
                this.$el.html(this.template({
                    content : this.options.content ?
                                StringUtil.format(i18n.backup_restore.AUTO_BACKUP_COMPLETE_FINISH_CONTENT, this.options.content)  : ''
                }));

                var $notifySetting = $(doT.template(TemplateFactory.get('misc', 'notify-setting'))({})).addClass('setting-ctn');
                this.$('.footer-ctn').prepend($notifySetting);

                log({
                    'event' : 'debug.sync.auto.backup.complete.tip.show'
                });

                return this;
            },
            clickButtonSetting : function () {
                WelcomeService.openNotifySettingWindowAsync();

                log({
                    'event' : 'ui.click.sync.auto.backup.complete.tip.setting'
                });
            },
            clickButtonOpen : function () {
                IO.requestAsync({
                    url : CONFIG.actions.OPEN_AUTO_BACKUP_FILE
                });

                BackupRestoreService.closeAllNotificationAsync();

                log({
                    'event' : 'ui.click.sync.auto.backup.complete.tip.open'
                });
            },
            events : {
                'click .button-setting' : 'clickButtonSetting',
                'click .button-open' : 'clickButtonOpen'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new AutoBackupCompleteNotifyView(args);
            }
        });
        return factory;
    });
}(this));
