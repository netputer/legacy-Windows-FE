/*global define*/
(function (window) {
    define([
        'i18n!nls/ui',
        'i18n!nls/misc',
        'i18n!nls/app',
        'i18n!nls/backup_restore',
        'i18n!nls/contact',
        'i18n!nls/music',
        'i18n!nls/photo',
        'i18n!nls/taskManager',
        'i18n!nls/video',
        'i18n!nls/welcome',
        'i18n!nls/message',
        'i18n!nls/optimize',
        'i18n!nls/sync',
        'i18n!nls/new_backuprestore'
    ], function (
        ui,
        misc,
        app,
        backup_restore,
        contact,
        music,
        photo,
        taskManager,
        video,
        welcome,
        message,
        optimize,
        sync,
        new_backuprestore
    ) {
        console.log('Internationalization - File loaded.');

        var i18n = {
            ui : ui,
            misc : misc,
            app : app,
            backup_restore : backup_restore,
            contact : contact,
            music : music,
            photo : photo,
            taskManager : taskManager,
            video : video,
            welcome : welcome,
            message : message,
            optimize : optimize,
            sync : sync,
            new_backuprestore : new_backuprestore
        };

        window.i18n = window.i18n || i18n;

        return i18n;
    });
}(this));
