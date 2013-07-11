/*global define*/
(function (window) {
    define([
        'backbone',
        'IO',
        'Configuration',
        'jquery',
        'Device'
    ], function (
        Backbone,
        IO,
        CONFIG,
        $,
        Device
    ) {
        console.log('PhotoModel - File loaded. ');

        var PhotoModel = Backbone.Model.extend({
            defaults : {
                isIgnore : false,
                selected : false,
                originalPic : '',
                orientation : 0,
                loading : false,
                error : false,
                widthLtHeight : true
            },
            getThumbnailAsync : function () {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.PHOTO_THUMBNAIL,
                    data : {
                        photo_id : this.id
                    },
                    success : function(resp) {
                        if (resp.state_code === 200) {
                            this.set({
                                thumb : 'file:///' + resp.body.value
                            });
                            deferred.resolve(resp);
                        } else {
                            this.set({
                                error : true
                            });
                            deferred.reject(resp);
                        }
                    }.bind(this)
                });

                return deferred.promise();
            },
            exportAsync : function () {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.PHOTO_GET,
                    data: {
                        photo_id: this.id
                    },
                    success: function (resp) {
                        if (resp.state_code === 200) {
                            deferred.resolve(resp);
                        } else {
                            deferred.reject(resp);
                        }
                        this.set({
                            loading : false
                        });
                    }.bind(this)
                });

                return deferred.promise();
            },
            deleteAsync : function () {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.PHOTO_DELETE,
                    data : {
                        photo_id_list : this.id
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            if (this.collection) {
                                this.collection.remove(this);
                            }
                            deferred.resolve(resp);
                        } else {
                            deferred.reject(resp);
                        }
                    }.bind(this)
                });

                return deferred.promise();
            },
            rotateAsync : function (orientation) {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url: CONFIG.actions.PHOTO_ROTATE,
                    data : {
                        photo_id : this.id,
                        orientation : orientation,
                        is_cloud : Number(this.get('is_cloud'))
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            this.set({
                                orientation : orientation
                            });
                            deferred.resolve(resp);
                        } else {
                            deferred.reject(resp);
                        }
                    }.bind(this)
                });

                return deferred.promise();
            },
            setAsWallpaperAsync : function () {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.PHOTO_SET_WALLPAPER,
                    data : {
                        photo_id : this.id,
                        is_cloud : Number(this.get('is_cloud'))
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            deferred.resolve(resp);
                        } else {
                            deferred.reject(resp);
                        }
                    }
                });

                return deferred.promise();
            },
            getOriginalPicAsync : function () {
                var deferred = $.Deferred();

                if (!this.get('loading')) {
                    this.set({
                        loading : true
                    });
                    IO.requestAsync({
                        url : CONFIG.actions.PHOTO_GET,
                        data: {
                            photo_id: this.id,
                            is_cloud : Number(this.get('is_cloud'))
                        },
                        success: function (resp) {
                            if (resp.state_code === 200) {
                                this.set({
                                    originalPic : 'file:///' + resp.body.path,
                                    orientation : parseInt(resp.body.orientation, 10)
                                });
                                deferred.resolve(resp);
                            } else {
                                deferred.reject(resp);
                            }
                            this.set({
                                loading : false
                            });
                        }.bind(this)
                    });
                } else {
                    this.once('change:loading', function () {
                        deferred.resolve();
                    });
                }

                return deferred.promise();
            }
        });

        return PhotoModel;
    });
}(this));
