/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'Configuration',
        'Log',
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
        log,
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

                        log({
                            'event' : 'ui.show.welcome_card',
                            'type' : this.model.get('type')
                        });
                    }
                }.bind(this));
                return this;
            },
            hide : function () {
                Settings.set('welcome_feed_cloud_photo', true, true);
            },
            clickButtonAction : function () {
                if (Account.get('isLogin')) {
                    SyncService.setPhotoSyncSwitchAsync(true).done(SyncService.uploadPhotoAsync);
                    this.remove();
                    this.hide();
                    return;
                }

                Account.regAsync('', 'guide-cloud-photo');

                var handler = IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.ACCOUNT_STATE_CHANGE
                }, function (message) {
                    if (message.auth) {
                        SyncService.setPhotoSyncSwitchAsync(true).done(SyncService.uploadPhotoAsync);
                        this.remove();
                        this.hide();
                        IO.Backend.Device.offmessage(handler);
                    }
                }, this);

                log({
                    'event' : 'ui.click.welcome_card_action',
                    'type' : this.model.get('type'),
                    'index' : this.getIndex(),
                    'action' : 'cloud-photo'
                });
            },
            clickButtonIgnore : function () {
                this.remove();
                this.hide();
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
