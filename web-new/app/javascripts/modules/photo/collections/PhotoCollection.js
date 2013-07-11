/*global define*/
(function (window) {
    define([
        'underscore',
        'backbone',
        'jquery',
        'IOBackendDevice',
        'Environment',
        'Configuration',
        'Device',
        'photo/models/PhotoModel'
    ], function (
        _,
        Backbone,
        $,
        IO,
        Environment,
        CONFIG,
        Device,
        PhotoModel
    ) {
        console.log('PhotoCollection - File loaded. ');

        var PhotoCollection = Backbone.Collection.extend({
            model : PhotoModel,
            url   : CONFIG.actions.PHOTO_SHOW,
            data : {
                photo_type : CONFIG.enums.PHOTO_ALL_TYPE
            },
            comparator : function (photo) {
                return -parseInt(photo.get('date'), 10);
            },
            parse : function (resp) {
                if (resp.state_code === 202 && Device.get('isConnected')) {
                    console.log('PhotoCollection - Photo is syncing.');
                    this.syncing = true;
                    this.trigger('syncStart');
                }

                var result = [];
                resp.body = resp.body || {};
                _.each(resp.body.list, function (lib) {
                    result = result.concat(lib.photo_info);
                    _.each(lib.photo_info, function (photo) {
                        photo.key = lib.key;
                    });
                });
                return result;
            },
            initialize : function () {
                var loading = false;
                var syncing = false;
                Object.defineProperties(this, {
                    loading : {
                        set : function (value) {
                            loading = Boolean(value);
                        },
                        get : function () {
                            return loading;
                        }
                    },
                    syncing : {
                        set : function (value) {
                            syncing = Boolean(value);
                        },
                        get : function () {
                            return syncing;
                        }
                    }
                });

                this.on('update', function () {
                    this.loading = true;
                    this.fetch({
                        success : function (collection, resp) {
                            console.log('PhotoCollection - Collection fetched.');
                            loading = false;
                            collection.trigger('refresh', collection);
                        }
                    });
                }, this);

                this.updateHandler = IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.PHOTO_UPDATED
                }, function (data) {
                    if (syncing) {
                        syncing = false;
                        this.trigger('syncEnd');
                    }
                    if (!!data) {
                        this.trigger('update');
                    }
                }, this);

                this.listenTo(Device, 'change:isMounted', function (Device, isMounted) {
                    if (isMounted) {
                        this.update([]);
                        this.trigger('refresh', this);
                    } else {
                        this.trigger('update');
                    }
                });

                this.on('add', function (photo) {
                    photo.once('remove', function () {
                        this.off();
                    }, photo);
                });
            },
            dispose : function () {
                this.set([]);
                this.off();
                this.stopListening();
                IO.Backend.Device.offmessage(this.updateHandler);
            },
            syncAsync : function () {
                var deferred = $.Deferred();

                this.syncing = true;
                this.trigger('syncStart');

                IO.requestAsync({
                    url : CONFIG.actions.PHOTO_SYNC,
                    data : {
                        photo_type : this.data.photo_type
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('PhotoCollection - Photo sync success.');

                            deferred.resolve(resp);
                        } else {
                            console.error('PhotoCollection - Photo sync failed. Error info: ' + resp.state_line);

                            this.syncing = false;
                            this.trigger('syncEnd');
                            deferred.reject(resp);
                        }
                    }.bind(this)
                });

                return deferred.promise();
            },
            getThumbsAsync : function (ids) {
                var deferred = $.Deferred();

                var session = _.uniqueId('photo_get_thumbnails_');
                var count = 0;
                var handler = IO.Backend.Device.onmessage({
                    'data.channel' : session
                }, function (data) {
                    if (count === ids.length) {
                        IO.Backend.Device.offmessage(handler);
                    }

                    count += data.val.length;
                    if (count === ids.length) {
                        IO.Backend.Device.offmessage(handler);
                    }
                    _.each(data.val, function (item) {
                        this.get(item.key).set({
                            thumb : 'file:///' + item.value,
                            error : false
                        });
                    }, this);
                }, this);

                IO.requestAsync({
                    url : CONFIG.actions.PHOTO_THUMBNAILS,
                    data : {
                        photo_id_list : ids.join(','),
                        session : session,
                        width : 128,
                        height : 128
                    },
                    success : function (resp) {
                        if (count === ids.length) {
                            IO.Backend.Device.offmessage(handler);
                        } else if (resp.body && (resp.body.value !== ids.length)) {
                            var successCount = this.filter(function (photo) {
                                return photo.get('thumb');
                            }).length;
                            if (successCount === resp.body.value) {
                                IO.Backend.Device.offmessage(handler);
                            } else {
                                count = ids.length;
                            }
                        }

                        if (resp.state_code === 200) {
                            if (resp.body.value !== ids.length) {
                                _.each(ids, function (id) {
                                    var photo = this.get(id);
                                    photo.set({
                                        error : !photo.get('thumb')
                                    });
                                }, this);
                            }

                            deferred.resolve(resp);
                        } else {
                            _.each(ids, function (id) {
                                this.get(id).set({
                                    error : true
                                });
                            }, this);
                            deferred.reject(resp);
                        }
                    }.bind(this)
                });

                return deferred.promise();
            },
            getSelectedPhoto : function () {
                return this.filter(function (photo) {
                    return photo.get('selected');
                });
            }
        });

        var photoCollection;

        var factory = _.extend({
            getInstance : function () {
                if (!photoCollection) {
                    photoCollection = new PhotoCollection();
                    photoCollection.trigger('update');
                }
                return photoCollection;
            },
            getClass : function () {
                return PhotoCollection;
            }
        });

        return factory;
    });
}(this));
