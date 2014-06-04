/*global define*/
(function (window) {
    define([
        'underscore',
        'backbone',
        'jquery',
        'IO',
        'Configuration',
        'Device',
        'music/models/MusicModel',
        'main/collections/PIMCollection'
    ], function (
        _,
        Backbone,
        $,
        IO,
        CONFIG,
        Device,
        MusicModel,
        PIMCollection
    ) {
        console.log('MusicsCollection - File loaded.');

        var MusicsCollection = Backbone.Collection.extend({
            model : MusicModel,
            url : CONFIG.actions.MUSID_SHOW,
            parse : function (resp) {
                if (resp.state_code === 202 && Device.get('isConnected')) {
                    console.log('MusicsCollection - Music is syncing.');
                    this.syncing = true;
                    this.trigger('syncStart');
                }

                return resp.body.audio;
            },
            syncAsync : function () {
                var deferred = $.Deferred();

                this.syncing = true;
                this.trigger('syncStart');

                IO.requestAsync({
                    url : CONFIG.actions.MUSIC_SYNC,
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('MusicsCollection - Music sync success.');

                            deferred.resolve(resp);
                        } else {
                            console.error('MusicsCollection - Music sync failed. Error info: ' + resp.state_line);

                            this.syncing = false;
                            this.trigger('syncEnd');
                            deferred.reject(resp);
                        }
                    }.bind(this)
                });

                return deferred.promise();
            },
            initialize : function () {
                var loading = false;
                var syncing = false;
                var currentPlayingAudio = {};
                var settings = {
                    ringtone : '',
                    notification : '',
                    alarm : ''
                };

                Object.defineProperties(this, {
                    loading : {
                        set : function (value) {
                            loading = value;
                        },
                        get : function () {
                            return loading;
                        }
                    },
                    syncing : {
                        set : function (value) {
                            syncing = value;
                        },
                        get : function () {
                            return syncing;
                        }
                    },
                    currentPlayingAudio : {
                        set : function (value) {
                            currentPlayingAudio = value;
                        },
                        get : function () {
                            return currentPlayingAudio;
                        }
                    },
                    settings : {
                        set : function (value) {
                            settings = value;
                        },
                        get : function () {
                            return settings;
                        }
                    }
                });

                this.on('update', function () {
                    loading = true;
                    this.fetch({
                        success : function (collection) {
                            console.log('MusicsCollection - Collection fetched.');
                            loading = false;

                            var model = collection.get(collection.currentPlayingAudio.id);

                            if (collection.currentPlayingAudio.status === 1) {
                                model.set({
                                    playing : true
                                });
                            }

                            collection.getRingAsync().always(function (resp) {
                                if (resp.state_code === 200) {
                                    collection.settings = {
                                        ringtone : resp.body.val[0],
                                        notification : resp.body.val[1],
                                        alarm : resp.body.val[2]
                                    };

                                    var ringtoneModel = collection.get(resp.body.val[0]);
                                    var notificationModel = collection.get(resp.body.val[1]);
                                    var alarm = collection.get(resp.body.val[2]);
                                    if (ringtoneModel) {
                                        ringtoneModel.set({
                                            type : 0
                                        });
                                    }
                                    if (notificationModel) {
                                        notificationModel.set({
                                            type : 1
                                        });
                                    }
                                    if (alarm) {
                                        alarm.set({
                                            type : 2
                                        });
                                    }
                                }

                                collection.trigger('refresh', collection);
                            });
                        }
                    });
                }, this);

                IO.Backend.onmessage({
                    'data.channel' : CONFIG.events.MUSIC_UPDATED
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
            getMusics : function () {
                return this.filter(function (music) {
                    return (parseInt(music.get('size'), 10) / 1024) >= 50;
                });
            },
            deleteAsync : function (ids, session) {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.MUSIC_DELETE,
                    data : {
                        music_id_list : ids.join(','),
                        session : session || ''
                    },
                    success : function (resp) {
                        switch (resp.state_code) {
                        case 200:
                            console.log('MusicsCollection - Delete music success. ');

                            var success = resp.body.success;

                            _.each(success, function (item) {
                                var music = this.get(item.item);
                                if (music !== undefined) {
                                    this.remove(music);

                                    switch (music.id) {
                                    case this.settings.ringtone:
                                        this.resetRingAsync(0);
                                        break;
                                    case this.settings.notification:
                                        this.resetRingAsync(1);
                                        break;
                                    case this.settings.alarm:
                                        this.resetRingAsync(2);
                                        break;
                                    }
                                }
                            }, this);

                            this.trigger('refresh', this);

                            deferred.resolve(resp);
                            break;
                        case 402:
                            console.log('MusicsCollection - Delete music cancled. ');

                            this.syncAsync();

                            deferred.reject(resp);
                            break;
                        default:
                            console.error('MusicsCollection - Delete music faild. Error info: ' + resp.state_line);
                            deferred.reject(resp);
                        }
                    }.bind(this)
                });

                return deferred.promise();
            },
            resetRingAsync : function (type) {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.MUSIC_RESET_RINGTONE,
                    data : {
                        type : type
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            switch (type) {
                            case 0:
                                this.settings.ringtone = '';
                                break;
                            case 1:
                                this.settings.notification = '';
                                break;
                            case 2:
                                this.settings.alarm = '';
                                break;
                            }
                            deferred.resolve(resp);
                        } else {
                            deferred.reject(resp);
                        }
                    }.bind(this)
                });

                return deferred.promise();
            },
            importAsync : function (paths, session) {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.MUSIC_IMPORT,
                    data : {
                        file_path_list : JSON.stringify({
                            audio : _.map(paths, function (path) {
                                return {
                                    path : path
                                };
                            })
                        }),
                        session : session || ''
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('MusicsCollection - Import success. ');
                            this.syncAsync();

                            deferred.resolve(resp);
                        } else if (resp.state_code === 402) {
                            this.syncAsync();

                            deferred.reject(resp);
                        } else {
                            console.error('MusicsCollection - Import failed. Error info: ' + resp.state_line);
                            deferred.reject(resp);
                        }
                    }.bind(this)
                });

                return deferred.promise();
            },
            getRingAsync : function () {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.MUSIC_GET_RINGTONE,
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            deferred.resolve(resp);
                        } else {
                            deferred.reject(resp);
                        }
                    }.bind(this)
                });

                return deferred.promise();
            },
            getAll : function () {
                return this.models;
            }
        });

        var musicsCollection;

        var factory = _.extend({
            getInstance : function () {
                if (!musicsCollection) {
                    musicsCollection = new MusicsCollection();

                    if (Device.get('isUSB')) {
                        musicsCollection.trigger('update');
                    } else {
                        Device.once('change:isUSB', function (Device, isUSB) {
                            if (isUSB) {
                                musicsCollection.trigger('update');
                            }
                        });
                    }

                    musicsCollection.on('refresh', function (musicsCollection) {
                        PIMCollection.getInstance().get(4).set({
                            count : musicsCollection.getMusics().length
                        });
                    });
                }
                return musicsCollection;
            }
        });

        return factory;
    });
}(this));
