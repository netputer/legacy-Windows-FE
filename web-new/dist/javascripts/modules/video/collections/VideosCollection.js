/*global define*/
(function (window, undefined) {
    define([
        'underscore',
        'backbone',
        'jquery',
        'IOBackendDevice',
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
                    result.concat(videos);
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

                IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.VIDEO_UPDATED
                }, function (data) {
                    if (syncing) {
                        syncing = false;
                        this.trigger('syncEnd');
                    }
                    if (!!data) {
                        this.trigger('update');
                    } else {
                        this.trigger('refresh', this);
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
            }
        });

        var videosCollection;

        var factory = _.extend({
            getInstance : function () {
                if (!videosCollection) {
                    videosCollection = new VideosCollection();
                    videosCollection.trigger('update');

                    videosCollection.on('refersh', function (videosCollection) {
                        PIMCollection.getInstance().get(6).set({
                            count : videosCollection.length
                        });
                    });

                    Device.on('change:isMounted', function (Device, isMounted) {
                        if (isMounted) {
                            PIMCollection.getInstance().get(6).set({
                                count : 0
                            });
                        } else {
                            PIMCollection.getInstance().get(6).set({
                                count : videosCollection.length
                            });
                        }
                    });
                }
                return videosCollection;
            }
        });

        return factory;
    });
}(this));
