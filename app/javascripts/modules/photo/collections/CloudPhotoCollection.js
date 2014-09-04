/*global define*/
(function (window) {
    define([
        'underscore',
        'Configuration',
        'Account',
        'Device',
        'IO',
        'photo/collections/PhotoCollection'
    ], function (
        _,
        CONFIG,
        Account,
        Device,
        IO,
        PhotoCollection
    ) {
        console.log('CloudPhotoCollection - File loaded. ');

        var CloudPhotoCollection = PhotoCollection.getClass().extend({
            url : CONFIG.actions.PHOTO_CLOUD_SHOW,
            data : {
                photo_type : CONFIG.enums.PHOTO_CLOUD_TYPE
            },
            getThumbsAsync : function (ids) {
                // thumbnails of cloud photo already got on show, need not to get them again
                return;
            },
            syncAsync : function () {

                var deferred = $.Deferred();

                this.syncing = true;
                this.trigger('syncStart');

                IO.requestAsync({
                    url : CONFIG.actions.PHOTO_CLOUD_SYNC,
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('PhotoCollection - Photo sync success.');

                            deferred.resolve(resp);
                        } else {
                            console.error('PhotoCollection - Cloud Photo sync failed. Error info: ' + resp.state_line);

                            this.syncing = false;
                            this.trigger('syncEnd');
                            deferred.reject(resp);
                        }
                    }.bind(this)
                });

                return deferred.promise();
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
