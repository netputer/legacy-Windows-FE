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
        'Internationalization',
        'ui/TemplateFactory',
        'utilities/StringUtil',
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
        i18n,
        TemplateFactory,
        StringUtil,
        WelcomeService,
        BackupRestoreService
    ) {

        console.log('DownloadPhotoNotifyView - File loaded.');

        var DownloadPhotoNotifyView = Backbone.View.extend({
            className : 'w-download-photo-notify',
            template : doT.template(TemplateFactory.get('sync', 'download-photo-notify')),
            initialize : function () {
                IO.Backend.onmessage({
                    'data.channel' : CONFIG.events.SYNC_PHOTO_NOTIFY_UPDATE
                }, function (message) {
                    this.options.num = parseInt(message, 10);
                    this.$('.header-text').text(StringUtil.format(i18n.new_backuprestore.PHOTO_DOWNLOAD_NOTIFY_TITLE, message));

                    log({
                        'event' : 'debug.sync.photo.notify.update',
                        'is_helper' : this.options.helper
                    });
                }, this);
            },
            render : function () {
                this.$el.html(this.template({
                    num : this.options.num
                }));

                var $notifySetting = $(doT.template(TemplateFactory.get('misc', 'notify-setting'))({})).addClass('setting-ctn');
                this.$('.footer-ctn').prepend($notifySetting);

                log({
                    'event' : 'debug.sync.photo.notify.show',
                    'is_helper' : this.options.helper
                });

                return this;
            },
            clickButtonSetting : function () {
                if (this.options.helper) {
                    WelcomeService.openNotifySettingWindowHelperAsync();
                } else {
                    WelcomeService.openNotifySettingWindowAsync();
                }

                log({
                    'event' : 'ui.click.sync.photo.notify.setting',
                    'is_helper' : this.options.helper
                });
            },
            clickButtonOpen : function () {
                if (this.options.helper) {
                    IO.requestAsync({
                        url : CONFIG.actions.OPEN_PHOTO_AUTO_BACKUP_FILE_HELPER,
                        data : {
                            num : parseInt(this.options.num, 10)
                        }
                    });
                } else {
                    IO.requestAsync({
                        url : CONFIG.actions.OPEN_PHOTO_AUTO_BACKUP_FILE,
                        data : {
                            num : parseInt(this.options.num, 10)
                        }
                    });
                }
                BackupRestoreService.closeAllNotificationAutoAsync(this.options.helper);

                log({
                    'event' : 'ui.click.sync.photo.notify.open',
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
                return new DownloadPhotoNotifyView(args);
            }
        });
        return factory;
    });
}(this));
