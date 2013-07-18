/*global define*/
(function (window) {
    define([
        'underscore',
        'backbone',
        'jquery',
        'IO',
        'Configuration',
        'Log',
        'music/iTunes/models/ITunesModel',
        'music/iTunes/models/ListContextModel',
        'utilities/StringUtil'
    ], function (
        _,
        Backbone,
        $,
        IO,
        CONFIG,
        log,
        ITunesModel,
        ListContextModel,
        StringUtil
    ) {

        console.log('ItunesCollection - File loaded');

        var ITunesCollection = Backbone.Collection.extend({
            model : ITunesModel,
            url : CONFIG.actions.ITUNES_IMPORT_QUERY,
            initialize : function () {
                var loading = false;
                var syncing = false;
                var xmlData = [];

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
                    }
                });

                this.on('update', function () {
                    if (!loading) {
                        loading = true;

                        this.fetch({
                            success : function (collection) {
                                console.log('iTunesCollection - Collection fetch');
                                loading = false;
                                collection.trigger('refresh', collection);
                            }
                        });
                    }
                }, this);
            },
            parse : function (resp) {
                return _.map(resp.body.audio, function (audio) {
                    audio.size = parseInt(audio.size, 10);
                    audio.sizeText = StringUtil.readableSize(audio.size);
                    return audio;
                });
            },
            beginAsync : function () {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.ITUNES_IMPORT_BEGIN,
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            deferred.resolve(resp.body || {});
                        } else {
                            deferred.reject(resp.body || {});
                        }

                        log({
                            'event' : 'debug.itunes.import.begin'
                        });

                    }
                });

                return deferred.promise();
            },
            parseSourceAsync : function (data) {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.ITUNES_IMPORT_PARSE,
                    data : data,
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            ListContextModel.set('play_lists', resp.body.play_lists);
                            deferred.resolve(resp.body || {});
                        } else {
                            ListContextModel.set('play_lists', []);
                            deferred.reject(resp.body || {});
                        }
                    }
                });

                return deferred.promise();
            },
            importAudiosAsync : function (data) {
                var startTime = new Date().getTime();
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.ITUNES_IMPORT_AUDIO,
                    data : data,
                    success : function (resp) {
                        var endTime = new Date().getTime();

                        if (resp.state_code === 200) {
                            deferred.resolve(resp.body || {});

                            log({
                                'event' : 'debug.itunes.importSuccess',
                                'success': resp.body.success.length || 0,
                                'time' : endTime - startTime
                            });
                        } else {

                            if (resp.state_code === 402) {
                                var success = 0;
                                if (resp.body && resp.body.success) {
                                    success = resp.body.success.length;
                                }
                                log({
                                    'event' : 'debug.itunes.importCancel',
                                    'success' : resp.body && resp.body.success.length || 0,
                                    'time' : endTime - startTime
                                });
                            } else {

                                deferred.reject(resp.body || {});
                                log({
                                    'event' : 'debug.itunes.importFail',
                                    'state_code' : resp.state_code,
                                    'state_line' : resp.state_line || ''
                                });
                            }

                        }
                    }
                });

                return deferred.promise();
            },
            createPlaylistAsync : function (data, success, error) {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.ITUNES_CREATE_PLAYLIST,
                    data : data,
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            deferred.resolve(resp.body || {});
                        } else {
                            deferred.reject(resp.body || {});
                        }
                    }
                });

                return deferred.promise();
            },

            finishAsync : function () {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.ITUNES_IMPORT_FINISH,
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            deferred.resolve(resp.body || {});
                        } else {
                            deferred.reject(resp.body || {});
                        }
                    }
                });

                ListContextModel.set('play_lists', []);
                return deferred.promise();
            },
            cancelAsync : function (data) {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.MUSIC_CANCEL,
                    data : data,
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            deferred.resolve(resp.body || {});
                        } else {
                            deferred.reject(resp.body || {});
                        }
                    }
                });

                return deferred.promise();
            },
            getAll : function () {
                return this.models;
            }
        });

        var itunesCollection;
        var factory = _.extend({
            getInstance : function () {
                if (!itunesCollection) {
                    itunesCollection = new ITunesCollection();
                }

                return itunesCollection;
            }
        });

        return factory;
    });
}(this));
