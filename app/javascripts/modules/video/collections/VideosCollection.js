/*global define*/
(function (window) {
    define([
        'underscore',
        'backbone',
        'jquery',
        'IO',
        'Configuration',
        'Device',
        'video/models/VideoModel',
        'main/collections/PIMCollection'
    ], function (
        _,
        Backbone,
        $,
        IO,
        CONFIG,
        Device,
        VideoModel,
        PIMCollection
    ) {
        console.log('VideosCollection - File loaded.');

        var VideosCollection = Backbone.Collection.extend({
            model : VideoModel,
            url : CONFIG.actions.VIDEO_SHOW,
            parse : function (resp) {
                if (resp.state_code === 202 && Device.get('isConnected')) {
                    console.log('VideosCollection - Video is syncing.');
                    this.syncing = true;
                    this.trigger('syncStart');
                }

                var result = [];
                _.each(resp.body, function (videos) {
                    _.each(videos, function (video) {
                        if (typeof video === 'object' && video.id) {
                            result.push(video);
                        }
                    });
                });

                return result;
            },
            syncAsync : function () {
                var deferred = $.Deferred();

                this.syncing = true;
                this.trigger('syncStart');

                IO.requestAsync({
                    url : CONFIG.actions.VIDEO_SYNC,
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('VideosCollection - Video sync success.');

                            deferred.resolve(resp);
                        } else {
                            console.error('VideosCollection - Video sync failed. Error info: ' + resp.state_line);

                            deferred.reject(resp);
                        }
                    }
                });

                return deferred.promise();
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
                    loading = true;
                    this.fetch({
                        success : function (collection) {
                            console.log('VideosCollection - Collection fetched.');
                            loading = false;
                            collection.trigger('refresh', collection);
                        }
                    });
                }, this);

                IO.Backend.onmessage({
                    'data.channel' : CONFIG.events.VIDEO_UPDATED
                }, function (data) {
                    if (syncing) {
                        syncing = false;
                        this.trigger('syncEnd');
                    }

                    if (!!data) {
                        this.trigger('update');
                    }

                }, this);
            },
            importAsync : function (paths, session) {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.VIDEO_IMPORT,
                    data : {
                        file_path_list : JSON.stringify({
                            video : _.map(paths, function (path) {
                                return {
                                    path : path
                                };
                            })
                        }),
                        session : session || ''
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('VideosCollection - Import success. ');
                            this.syncAsync();

                            deferred.resolve(resp);
                        } else if (resp.state_code === 402) {
                            this.syncAsync();

                            deferred.reject(resp);
                        } else {
                            console.error('VideosCollection - Import failed. Error info: ' + resp.state_line);
                            deferred.reject(resp);
                        }
                    }.bind(this)
                });

                return deferred.promise();
            },
            deleteAsync : function (ids, session) {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.VIDEO_DELETE,
                    data : {
                        video_id_list : ids.join(','),
                        session : session
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('VideosCollection - Delete success. ');
                            this.syncAsync();

                            deferred.resolve(resp);
                        } else if (resp.state_code === 402) {
                            this.syncAsync();

                            deferred.reject(resp);
                        } else {
                            console.error('VideosCollection - Delete failed. Error info: ' + resp.state_line);
                            deferred.reject(resp);
                        }
                    }.bind(this)
                });

                return deferred.promise();
            },
            getThumbsAsync : function (ids) {
                var deferred = $.Deferred();

                _.each(ids, function (id) {
                    this.get(id).getThumbnailAsync();
                }, this);

                return deferred.promise();
            },
            getSelectedVideo : function () {
                return this.filter(function (video) {
                    return video.get('selected');
                });
            },
            remove : function (models, options) {
                VideosCollection.__super__.remove.apply(this, arguments);
                this.trigger('batchRemove');
            }
        });

        var videosCollection;

        var factory = _.extend({
            getInstance : function () {
                if (!videosCollection) {
                    videosCollection = new VideosCollection();

                    if (Device.get('isUSB')) {
                        videosCollection.trigger('update');
                    } else {
                        Device.once('change:isUSB', function (Device, isUSB) {
                            if (isUSB) {
                                videosCollection.trigger('update');
                            }
                        });
                    }

                    videosCollection.on('refresh', function (videosCollection) {
                        PIMCollection.getInstance().get(6).set({
                            count : Device.get('isMounted') ? 0 : videosCollection.length
                        });
                    });

                    Device.on('change:isMounted', function (Device, isMounted) {
                        PIMCollection.getInstance().get(6).set({
                            count : isMounted ? 0 : videosCollection.length
                        });
                    });
                }
                return videosCollection;
            }
        });

        return factory;
    });
}(this));
