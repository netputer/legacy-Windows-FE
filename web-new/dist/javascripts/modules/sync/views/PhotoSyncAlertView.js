(function (window, undefined) {
    define([
        'underscore',
        'jquery',
        'IO',
        'Account',
        'Internationalization',
        'Configuration',
        'Log',
        'ui/Panel',
        'utilities/StringUtil'
    ], function (
        _,
        $,
        IO,
        Account,
        i18n,
        CONFIG,
        log,
        Panel,
        StringUtil
    ) {
        console.log('PhotoSyncAlertView - File loaded. ');

        var PhotoSyncAlertView = Panel.extend({
            className : Panel.prototype.className + ' photo-sync-alert',
            initialize : function () {
                PhotoSyncAlertView.__super__.initialize.apply(this, arguments);
                this.width = 360;
                this.height = 200;
                this.title = i18n.ui.TIP;
                this.disableX = true;
                this.buttons = [{
                    $button : $('<button>').addClass('primary').html(i18n.common.RECOMMEND_YES),
                    eventName : 'YES'
                }, {
                    $button : $('<button>').html(i18n.ui.NO),
                    eventName : 'NO'
                }];

                this.once('show', function () {
                    this.$bodyContent = StringUtil.format(i18n.photo.PHOTO_SYNC, StringUtil.format(CONFIG.enums.PHOTO_SYNC_LINK, Account.get('auth')));
                    log({
                        'event' : 'ui.show.alert.photo.sync'
                    });
                }, this);
            }
        });

        var factory = _.extend({
            getInstance : function () {
                return new PhotoSyncAlertView();
            }
        });

        return factory;
    });
}(this));
