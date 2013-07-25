/*global define*/
(function (window) {
    define([
        'underscore',
        'Configuration',
        'Account',
        'photo/collections/PhotoCollection'
    ], function (
        _,
        CONFIG,
        Account,
        PhotoCollection
    ) {
        console.log('CloudPhotoCollection - File loaded. ');

        var CloudPhotoCollection = PhotoCollection.getClass().extend({
            data : {
                photo_type : CONFIG.enums.PHOTO_CLOUD_TYPE
            },
            getThumbsAsync : function (ids) {
                // thumbnails of cloud photo already got on show, need not to get them again
                return;
            }
        });

        var cloudPhotoCollection;

        var factory = _.extend({
            getInstance: function () {
                if (!cloudPhotoCollection) {
                    cloudPhotoCollection = new CloudPhotoCollection();
                    if (Account.get('isLogin')) {
                        cloudPhotoCollection.trigger('update');
                    }

                    Account.on('change:isLogin', function (Account, isLogin) {
                        if (!isLogin) {
                            cloudPhotoCollection.reset([]);
                            cloudPhotoCollection.trigger('refresh', cloudPhotoCollection);
                        } else {
                            cloudPhotoCollection.trigger('update');
                        }
                    });
                }
                return cloudPhotoCollection;
            },
            dispose : function () {
                cloudPhotoCollection.dispose();
                cloudPhotoCollection = undefined;
            }
        });

        return factory;
    });
}(this));
