/*global define*/
(function (window) {
    define([
        'underscore',
        'jquery',
        'Configuration',
        'IO',
        'photo/collections/PhotoCollection'
    ], function (
        _,
        $,
        CONFIG,
        IO,
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
                if (!libraryPhotoCollection) {
                    libraryPhotoCollection = new LibraryPhotoCollection();
                    libraryPhotoCollection.trigger('update');
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
