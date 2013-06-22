/*global define*/
(function (window) {
    'use strict';

    define([
        'underscore',
        'backbone',
        'Configuration',
        'IOBackendDevice',
        'Account',
        'Log',
        'photo/views/ImportPhotoView',
        'photo/PhotoService',
        'social/SocialService',
        'sync/views/PhotoSyncAlertView'
    ], function (
        _,
        Backbone,
        CONFIG,
        IO,
        Account,
        log,
        ImportPhotoView,
        PhotoService,
        SocialService,
        PhotoSyncAlertView
    ) {
        console.log('IframeMessageListener - File loaded. ');

        var alert = window.alert;

        var IframeMessageListener = _.extend({}, Backbone.Events);

        var handlers = [];

        IframeMessageListener.init = function () {
            handlers.push(IO.Backend.Device.onmessage({
                'data.channel' : CONFIG.events.PHOTO_SHOW_IMPORTOR
            }, function () {
                ImportPhotoView.getInstance().show();
            }));

            handlers.push(IO.Backend.Device.onmessage({
                'data.channel' : CONFIG.events.CUSTOM_IFRAME_PHOTO_SHARE
            }, function (data) {
                data = data.data;
                SocialService.sharePhotoAsync(data.path, data.orientation, data.type, data.size);
            }));

            handlers.push(IO.Backend.Device.onmessage({
                'data.channel' : CONFIG.events.CUSTOM_IFRAME_PHOTO_DELETE
            }, function (data) {
                var isCloud = data.data.models[0].is_cloud;
                PhotoService.deletePhototsAsync(data.data.ids, isCloud);
            }));

            handlers.push(IO.Backend.Device.onmessage({
                'data.channel' : CONFIG.events.CUSTOM_IFRAME_PHOTO_EXPORT
            }, function (data) {
                PhotoService.exportPhotosAsync(data.data.ids, data.data.models);
            }));

            handlers.push(IO.Backend.Device.onmessage({
                'data.channel' : CONFIG.events.CUSTOM_IFRAME_PHOTO_SYNC_ALERT
            }, function (data) {
                var photoSyncAlertView = PhotoSyncAlertView.getInstance();
                photoSyncAlertView.show();

                photoSyncAlertView.once('YES', function () {
                    if (Account.get('isLogin')) {
                        IO.sendCustomEventsAsync(data.data.listenerId, {
                            action : 'yes'
                        });
                    } else {
                        Account.loginAsync('', 'photo-sync');

                        var handler = IO.Backend.Device.onmessage({
                            'data.channel' : CONFIG.events.ACCOUNT_STATE_CHANGE
                        }, function (message) {
                            if (message.auth) {
                                IO.sendCustomEventsAsync(data.data.listenerId, {
                                    action : 'yes'
                                });
                                IO.Backend.Device.offmessage(handler);
                            }
                        });
                    }

                    this.close();

                    log({
                        'event' : 'ui.click.sync.syncphoto.yes'
                    });
                }, photoSyncAlertView);

                photoSyncAlertView.once('NO', function () {
                    IO.sendCustomEventsAsync(data.data.listenerId, {
                        action : 'no'
                    });
                    this.close();
                    log({
                        'event' : 'ui.click.sync.syncphoto.no'
                    });
                }, photoSyncAlertView);
            }));
        };

        IframeMessageListener.destory = function () {
            _.each(handlers, function (handler) {
                IO.Backend.Device.offmessage(handler);
            });
        };

        return IframeMessageListener;
    });
}(this));
