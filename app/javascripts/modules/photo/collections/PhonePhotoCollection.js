/*global define*/
(function (window) {
    define([
        'underscore',
        'Configuration',
        'Device',
        'photo/collections/PhotoCollection'
    ], function (
        _,
        CONFIG,
        Device,
        PhotoCollection
    ) {
        console.log('PhonePhotoCollection - File loaded. ');

        var PhonePhotoCollection = PhotoCollection.getClass().extend({
            data : {
                photo_type : CONFIG.enums.PHOTO_PHONE_TYPE
            }
        });

        var phonePhotoCollection;

        var factory = _.extend({
            getInstance: function () {

                var listenHandler;
                var events = 'change:isConnected change:isSameWifi';

                if (!phonePhotoCollection) {
                    phonePhotoCollection = new PhonePhotoCollection();

                    if (window.SnapPea.isPimEnabled) {
                        phonePhotoCollection.trigger('update');
                    } else {
                        listenHandler = function (Device) {

                            if (window.SnapPea.isPimEnabled) {
                                this.trigger('update');
                                this.stopListening(this, events, listenHandler);
                            }
                        };

                        phonePhotoCollection.listenTo(Device, events, listenHandler);
                    }
                }
                return phonePhotoCollection;
            },
            dispose : function () {
                phonePhotoCollection.dispose();
                phonePhotoCollection = undefined;
            }
        });

        return factory;
    });
}(this));
