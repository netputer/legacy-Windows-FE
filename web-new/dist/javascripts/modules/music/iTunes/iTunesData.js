/*global define*/
(function (window, undefined) {
    define([
        'jquery',
        'IO',
        'Configuration',
        'Log'
    ], function (
        $,
        IO,
        Configuration,
        log
    ) {

        var iTunesData = {
            begin : function () {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : Configuration.actions.ITUNES_IMPORT_BEGIN,
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            deferred.resolve(resp.body || {});
                        } else {
                            deferred.reject(resp.body || {});
                        }
                    }
                });

                log({
                    'event' : 'debug.itunes.import.begin'
                });

                return deferred.promise();
            },

            parseSource : function (data) {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : Configuration.actions.ITUNES_IMPORT_PARSE,
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

            queryAudios : function () {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : Configuration.actions.ITUNES_IMPORT_QUERY,
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

            importAudios : function (data) {
                var startTime = new Date().getTime();
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : Configuration.actions.ITUNES_IMPORT_AUDIO,
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

            createPlaylist : function (data, success, error) {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : Configuration.actions.ITUNES_CREATE_PLAYLIST,
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

            finish : function () {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : Configuration.actions.ITUNES_IMPORT_FINISH,
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
            cancel : function (data) {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : Configuration.actions.MUSIC_CANCEL,
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
            }
        };

        return iTunesData;
    });
}(this));
