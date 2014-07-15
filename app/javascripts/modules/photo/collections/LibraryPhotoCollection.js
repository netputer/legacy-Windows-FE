/*global define*/
(function (window) {
    define([
        'underscore',
        'jquery',
        'Configuration',
        'IO',
        'Device',
        'photo/collections/PhotoCollection'
    ], function (
        _,
        $,
        CONFIG,
        IO,
        Device,
        PhotoCollection
    ) {
        console.log('LibraryPhotoCollection - File loaded. ');

        var LibraryPhotoCollection = PhotoCollection.getClass().extend({
            data : {
                photo_type : CONFIG.enums.PHOTO_LIBRARY_TYPE
            },
            ignoreThreadAsync : function (path) {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.PHOTO_IGNORE_FOLDER,
                    data : {
                        folder : path
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            this.each(function (photo) {
                                if (photo.get('key') === path) {
                                    photo.set({
                                        isIgnore : true
                                    });
                                }
                            });
                            deferred.resolve(resp);
                        } else {
                            deferred.reject(resp);
                        }
                    }.bind(this)
                });

                return deferred.promise();
            }
        });

        var libraryPhotoCollection;

        var factory = _.extend({
            getInstance : function () {

                var listenHandler;
                var events = 'change:isConnected change:isSameWifi';

                if (!libraryPhotoCollection) {
                    libraryPhotoCollection = new LibraryPhotoCollection();

                    if (window.SnapPea.enablePim()) {
                        libraryPhotoCollection.trigger('update');
                    } else {
                        listenHandler = function (Device) {

                            if (window.SnapPea.enablePim()) {
                                this.trigger('update');
                                this.stopListening(this, events, listenHandler);
                            }
                        };

                        libraryPhotoCollection.listenTo(Device, events, listenHandler);
                    }
                }
                return libraryPhotoCollection;
            },
            dispose : function () {
                libraryPhotoCollection.dispose();
                libraryPhotoCollection = undefined;
            }
        });

        return factory;
    });
}(this));
