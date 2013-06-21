/*global define*/
(function (window, undefined) {
    define([
        'underscore',
        'Configuration',
        'photo/collections/PhotoCollection'
    ], function (
        _,
        CONFIG,
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
                    phonePhotoCollection.trigger('update');
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
