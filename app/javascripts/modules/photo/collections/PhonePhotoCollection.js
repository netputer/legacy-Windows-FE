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
                if (!phonePhotoCollection) {
                    phonePhotoCollection = new PhonePhotoCollection();

                    if (Device.get('isUSB')) {
                        phonePhotoCollection.trigger('update');
                    } else {
                        Device.once('change:isUSB', function (Device, isUSB) {
                            if (isUSB) {
                                phonePhotoCollection.trigger('update');
                            }
                        });
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
