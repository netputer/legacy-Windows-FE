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
        TemplateFactory,
        FeedCardView,
        SyncService
    ) {
        var CloudPhotoCardView = FeedCardView.getClass().extend({
            template : doT.template(TemplateFactory.get('welcome', 'cloud-photo')),
            className : FeedCardView.getClass().prototype.className + ' cloud-photo hide',
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
            clickButtonAction : function () {
                if (Account.get('isLogin')) {
                    SyncService.setPhotoSyncSwitchAsync(true).done(SyncService.uploadPhotoAsync);
                    this.remove();
                    return;
                }

                Account.loginAsync();

                var handler = IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.ACCOUNT_STATE_CHANGE
                }, function (message) {
                    if (message.auth) {
                        SyncService.setPhotoSyncSwitchAsync(true).done(SyncService.uploadPhotoAsync);
                        this.remove();
                        IO.Backend.Device.offmessage(handler);
                    }
                }, this);
            },
            clickButtonIgnore : function () {
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
