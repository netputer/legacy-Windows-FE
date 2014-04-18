/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'Configuration',
        'Account',
        'IOBackendDevice',
        'Internationalization',
        'Settings',
        'ui/TemplateFactory',
        'welcome/views/FeedCardView',
        'sync/SyncService'
    ], function (
        Backbone,
        _,
        doT,
        CONFIG,
        Account,
        IO,
        i18n,
        Settings,
        TemplateFactory,
        FeedCardView,
        SyncService
    ) {
        var CloudPhotoCardView = FeedCardView.getClass().extend({
            template : doT.template(TemplateFactory.get('welcome', 'cloud-photo')),
            className : FeedCardView.getClass().prototype.className + ' vbox cloud-photo hide',
            render : function () {
                this.$el.html(this.template({}));

                SyncService.getIsPhotoSyncOnAsync().done(function (resp) {
                    if (!resp.body.value) {
                        this.$el.removeClass('hide');
                        this.options.parentView.initLayout();
                    }
                }.bind(this));
                return this;
            },
            setSettings : function () {
                Settings.set('welcome_feed_cloud_photo', true, true);
                Settings.set('welcome_feed_cloud_photo_show', new Date().getTime(), true);
            },
            clickButtonAction : function () {

                var turnPhotoAsync = function () {
                    SyncService.setPhotoSyncSwitchAsync(true).done(SyncService.uploadPhotoAsync);
                    this.setSettings();
                    this.remove();
                }.bind(this);

                if (Account.get('isLogin')) {
                    turnPhotoAsync();
                    return;
                }

                Account.openRegDialog('', 'guide-cloud-photo');

                var handler = IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.ACCOUNT_STATE_CHANGE
                }, function (message) {
                    if (message.auth) {
                        turnPhotoAsync();
                        IO.Backend.Device.offmessage(handler);
                    }
                }, this);

                this.log({
                    action : 'cloud-photo'
                });
            },
            clickButtonIgnore : function () {

                this.log({
                    action : 'ignore'
                });

                this.setSettings();
                this.remove();
            },
            events : {
                'click .button-action' : 'clickButtonAction',
                'click .button-ignore' : 'clickButtonIgnore'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new CloudPhotoCardView(args);
            }
        });

        return factory;
    });
}(this));
