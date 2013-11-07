/*global define*/
(function (window) {
    define([
        'jquery',
        'underscore',
        'Configuration',
        'Device',
        'IOBackendDevice',
        'FunctionSwitch',
        'Settings',
        'Environment',
        'Log',
        'Internationalization',
        'ui/Notification',
        'backuprestore/BackupRestoreService',
        'welcome/WelcomeService'
    ], function (
        $,
        _,
        CONFIG,
        Device,
        IO,
        FunctionSwitch,
        Settings,
        Environment,
        log,
        i18n,
        Notification,
        BackupRestoreService,
        WelcomeService
    ) {
        console.log('SyncModule - File loaded. ');

        var SyncModule = {};

        var showAutoBackupNotifyWindow = function (message) {
            if (!FunctionSwitch.ENABLE_AUTOBACKUP_POPUP) {
                return;
            }

            var typeName = {};
            typeName[CONFIG.enums.SYNC_DATA_TYPE_CONTACTS] = '联系人 ';
            typeName[CONFIG.enums.SYNC_DATA_TYPE_SMS] = '短信 ';
            typeName[CONFIG.enums.SYNC_DATA_TYPE_PHOTO] = '照片 ';
            typeName[CONFIG.enums.SYNC_DATA_TYPE_APP] = '应用 ';

            var content = '';
            _.each(message.result, function (cur) {
                if (cur.total > 0 && cur.total === cur.success) {
                    var name = typeName[cur.data_type] || '';
                    if (content.indexOf(name) < 0) {
                        content += name;
                    }
                }
            });

            // don't show the notify window if nothing changed this time
            if (content.length === 0) {
                return;
            }
            content.substr(0, content.length - 1);

            var handler;
            var notification = new Notification({
                type : 'html',
                url : CONFIG.BASE_PATH + 'modules/sync/auto_backup_complete.html' +
                        Environment.get('search') +
                        '&content=' + encodeURIComponent(content),
                title : '豌豆荚自动备份提醒',
                onclose : function () {
                    clearTimeout(handler);
                }
            });
            notification.show();
            handler = setTimeout(function () {
                BackupRestoreService.closeAllNotificationAsync();
            }, 15 * 1000);
        };

        var showNotifiyWindow = function () {
            var autoBackupHandler = IO.Backend.Device.onmessage({
                'data.channel' : CONFIG.events.AUTO_BACKUP_COMPLETE
            }, function (message) {
                WelcomeService.getSystemSettingAsync(CONFIG.enums.SETTING_AUTO_BACKUP_COMPLETE).done(function (resp) {
                    if (resp.body.value) {
                        showAutoBackupNotifyWindow(message);
                    }
                });
                IO.Backend.Device.offmessage(autoBackupHandler);
            });
        };

        if (Device.get('isAutoBackup')) {
            showNotifiyWindow.call(this);
        } else {
            Device.once('change:isAutoBackup', function () {
                showNotifiyWindow.call(this);
            });
        }

        IO.Backend.Device.onmessage({
            'data.channel' : CONFIG.events.DOWNLOAD_PHOTO_COMPLETE
        }, function () {
            if (!Settings.get('ios.banner.isclosed')) {
                $.ajax({
                    url : CONFIG.enums.IOS_SHOW_ADVERTISEMENT,
                    data : {
                        pcid : Environment.get('pcId')
                    },
                    success : function (resp) {
                        if (resp.type) {
                            var notification = new Notification({
                                type : 'html',
                                url : CONFIG.BASE_PATH + 'modules/sync/ios_advertisement.html?panel=getlink',
                                title : i18n.sync.IOS_ADVERTISMENT,
                                onclose : function () {
                                    Settings.set('ios.banner.isclosed', true);
                                    log({
                                        event: 'ui.click.ios_download_close',
                                        from : 'notification'
                                    });
                                }
                            });
                            notification.show();
                        }
                    }
                });
            }
        });

        return SyncModule;
    });
}(this));
