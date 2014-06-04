/*global define, $, _, Backbone, console*/
(function (window) {
    define([
        'ui/BatchActionWindow',
        'ui/AlertWindow',
        'utilities/StringUtil',
        'Internationalization',
        'IO',
        'Configuration',
        'Device',
        'Settings',
        'music/collections/MusicsCollection',
        'main/views/BatchErrorView'
    ], function (
        BatchActionWindow,
        AlertWindow,
        StringUtil,
        i18n,
        IO,
        CONFIG,
        Device,
        Settings,
        MusicsCollection,
        BatchErrorView
    ) {
        console.log('MusicService - File loaded.');

        var alert = window.alert;

        var MusicService = _.extend({}, Backbone.Events);

        var exportPath;

        var exportAsync = function (ids, session, path) {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.MUSIC_EXPORT,
                data : {
                    music_id_list : ids.join(','),
                    session : session,
                    export_dir : path || '',
                    default_path : Settings.get('music_export_default_path')
                },
                success : function (resp) {
                    if (resp.state_code === 200) {
                        console.log('MusicService - Export success. ');

                        deferred.resolve(resp);
                    } else {
                        console.error('MusicService - Export failed. Error info: ' + resp.state_line);

                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        MusicService.exportMusicsAsync = function (ids) {
            var deferred = $.Deferred();

            var musicsCollection = MusicsCollection.getInstance();

            var session = _.uniqueId('music.export_');
            var batchActionWindow = new BatchActionWindow({
                session : session,
                progressText : i18n.music.EXPORT_PROGRESS_TEXT,
                cancelUrl : CONFIG.actions.MUSIC_CANCEL,
                total : ids.length,
                successText : i18n.music.EXPORT_SUCCESS_TEXT,
                delay : true
            });

            if (!exportPath) {
                var handler = IO.Backend.onmessage({
                    'data.channel' : session
                }, function (data) {
                    if (!exportPath) {
                        exportPath = data.info;
                        IO.Backend.offmessage(handler);
                    }
                });
            }

            exportAsync(ids, session, exportPath).done(function (resp) {
                Settings.set('music_export_default_path', exportPath, true);

                var failed = _.map(resp.body.failed, function (music) {
                    return music.item;
                });

                if (failed.length > 0) {
                    batchActionWindow.remove();

                    var alertWindow = BatchErrorView.getInstance({
                        tip : i18n.music.MUSIC_EXPORT_ERROR_TEXT,
                        items : _.map(failed, function (item) {
                            return musicsCollection.get(item).get('title');
                        }),
                        errorInfo : _.find(resp.body.failed, function (music) {
                            return music.error_message;
                        })
                    });

                    alertWindow.once('button_retry', function () {
                        MusicService.exportMusicsAsync(failed).done(deferred.resolve).fail(deferred.reject);
                        alertWindow.remove();
                    }, this);

                    alertWindow.once('button_cancel', function () {
                        exportPath = null;
                        deferred.reject();
                    });

                    alertWindow.show();
                } else {
                    exportPath = null;
                    deferred.resolve(resp);
                }
            }).fail(function (resp) {
                if (resp.state_code === 402) {
                    exportPath = null;
                } else {
                    alert(i18n.music.EXPORT_FAILED_TEXT);
                    batchActionWindow.remove();
                }

                deferred.reject(resp);
            });

            return deferred.promise();
        };

        MusicService.loadMusicAsync = function (id) {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.MUSIC_LOAD,
                data : {
                    music_id : id,
                    play : false
                },
                success : function (resp) {
                    if (resp.state_code === 200) {
                        console.log('MusicService - Load success. ');
                        deferred.resolve(resp.body.value);
                    } else {
                        console.error('MusicService - Load faild. Error info: ' + resp.state_line);
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        MusicService.importMusicsAsync = function (paths) {
            var deferred = $.Deferred();

            var musicsCollection = MusicsCollection.getInstance();

            var session = _.uniqueId('music.import_');
            var batchActionWindow = new BatchActionWindow({
                session : session,
                progressText : i18n.music.IMPORT_PROGRESS_TEXT,
                cancelUrl : CONFIG.actions.MUSIC_CANCEL,
                total : paths.length,
                successText : i18n.music.IMPORT_SUCCESS_TEXT,
                delay : true
            });

            musicsCollection.importAsync(paths, session).done(function (resp) {
                var failedPaths = _.map(resp.body.failed, function (music) {
                    return music.item;
                });

                if (failedPaths.length > 0) {
                    if (batchActionWindow !== undefined) {
                        batchActionWindow.remove();
                    }

                    var alertWindow = BatchErrorView.getInstance({
                        needConnection : true,
                        tip : i18n.music.MUSIC_IMPORT_ERROR_TEXT,
                        items : _.map(failedPaths, function (item) {
                            return item.replace(/^.*[\\\/](?=[^\\\/]+$)/, '');
                        }),
                        errorInfo : _.find(resp.body.failed, function (music) {
                            return music.error_message;
                        })
                    });

                    alertWindow.on('button_retry', function () {
                        if (Device.get('isConnected') && (Device.get('hasSDCard') || Device.get('hasEmulatedSD'))) {
                            MusicService.importMusicsAsync(failedPaths).done(deferred.resolve).fail(deferred.reject);
                            alertWindow.remove();
                        }
                    }, this);

                    alertWindow.once('button_cancel', function () {
                        deferred.reject();
                    });

                    alertWindow.show();
                } else {
                    deferred.resolve(resp);
                }
            }).fail(function (resp) {
                if (resp.state_code !== 402) {
                    alert(i18n.music.MUSIC_IMPORT_OPERATION_FAILED);
                    if (batchActionWindow !== undefined) {
                        batchActionWindow.remove();
                    }
                }

                deferred.reject(resp);
            });

            return deferred.promise();
        };

        MusicService.deleteMusicsAsync = function (ids) {
            var deferred = $.Deferred();

            var musicsCollection = MusicsCollection.getInstance();

            var disposableAlert = new AlertWindow({
                draggable : true,
                disposableName : 'musics-delete',
                buttonSet : 'yes_no',
                $bodyContent : StringUtil.format(i18n.music.DELETE_TIP, ids.length)
            });

            disposableAlert.on('button_yes', function () {
                if (ids.indexOf(MusicService.currentPlayingAudio.id) >= 0) {
                    MusicService.stopAsync();
                }

                var session;
                var batchActionWindow;
                if (ids.length > 1) {
                    session = _.uniqueId('music.batch.delete_');
                    batchActionWindow = new BatchActionWindow({
                        session : session,
                        progressText : i18n.music.DELETE_PROGRESS_TEXT,
                        cancelUrl : CONFIG.actions.MUSIC_CANCEL,
                        total : ids.length,
                        successText : i18n.music.DELETE_SUCCESS_TEXT
                    });
                    batchActionWindow.show();
                }

                musicsCollection.deleteAsync(ids, session).done(function (resp) {
                    var failed = _.map(resp.body.failed, function (music) {
                        return music.item;
                    });

                    if (failed.length > 0) {
                        if (batchActionWindow !== undefined) {
                            batchActionWindow.remove();
                        }

                        var alertWindow = BatchErrorView.getInstance({
                            needConnection : true,
                            tip : i18n.music.DELETE_MUSIC_ERROR_TEXT,
                            items : _.map(failed, function (item) {
                                var music = musicsCollection.get(item);
                                return music ? music.get('display_name') : '';
                            }),
                            errorInfo : _.find(resp.body.failed, function (music) {
                                return music.error_message;
                            })
                        });

                        alertWindow.once('button_retry', function () {
                            MusicService.deleteMusicsAsync(failed).done(deferred.resolve).fail(deferred.reject);
                            alertWindow.remove();
                        });

                        alertWindow.once('button_cancel', function () {
                            deferred.reject();
                        });

                        alertWindow.show();
                    } else {
                        deferred.resolve(resp);
                    }
                }).fail(function (resp) {
                    if (resp.state_code !== 402) {
                        alert(i18n.music.DELETE_MUSIC_ERROR);
                    }
                    deferred.reject(resp);
                });
            }, this);

            disposableAlert.show();

            return deferred.promise();
        };

        MusicService.stopAsync = function () {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.MUSIC_STOP,
                success : function (resp) {
                    if (resp.state_code === 200) {
                        console.log('MusicService - Stop success. ');
                        deferred.resolve(resp);
                    } else {
                        console.error('MusicService - Stop faild. Error info: ' + resp.state_line);
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        MusicService.resetRingAsync = function (type) {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.MUSIC_RESET_RINGTONE,
                type : {
                    type : type
                },
                success : function (resp) {
                    if (resp.state_code === 200) {
                        console.log('MusicService - Reset ring success. ');
                        deferred.resolve(resp);
                    } else {
                        console.error('MusicService - Reset ring faild. Error info: ' + resp.state_line);
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        MusicService.selectMusicsAsync = function (type) {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.MUSIC_SELECT,
                data : {
                    type : type
                },
                success : function (resp) {
                    if (resp.state_code === 200) {
                        console.log('MusicService - Get selected musics success.');
                        deferred.resolve(resp);
                    } else {
                        console.error('MusicService - Get selected musics faild. Error info: ' + resp.state_line);
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        MusicService.currentPlayingAudio = {};

        MusicService.playAsync = function (id) {
            var deferred = $.Deferred();

            var musicsCollection = MusicsCollection.getInstance();

            musicsCollection.currentPlayingAudio = MusicService.currentPlayingAudio;

            var currentAudio = musicsCollection.get(MusicService.currentPlayingAudio.id);
            if (currentAudio) {
                currentAudio.set({
                    playing : false
                });
            }

            MusicService.currentPlayingAudio.id = id;

            var model = musicsCollection.get(id);

            model.set({
                loading : true
            });

            var session = _.uniqueId('music_play_');

            var playHandler = function (status) {
                status = typeof status === 'number' ? status : status.parseInt(status, 10);

                var currentModel = musicsCollection.get(model.id);
                MusicService.currentPlayingAudio.id = currentModel.id;
                MusicService.currentPlayingAudio.status = status;

                currentModel.set({
                    loading : false
                });

                switch (status) {
                case MusicService.STATUS.FILE_READY:
                    break;
                case MusicService.STATUS.FILE_PLAYING:
                    currentModel.set({
                        playing : true
                    });
                    break;
                case MusicService.STATUS.FILE_COMPLETE:
                    currentModel.set({
                        playing : false
                    });
                    break;
                case MusicService.STATUS.FILE_ERROR:
                    currentModel.set({
                        playing : false,
                        error : true
                    });
                    break;
                }
            };

            var handler = IO.Backend.onmessage({
                'data.channel' : session
            }, playHandler, this);

            IO.requestAsync({
                url : CONFIG.actions.MUSIC_PLAY,
                data : {
                    music_id : id,
                    session : session
                },
                success : function (resp) {
                    IO.Backend.offmessage(handler);
                    var currentModel = musicsCollection.get(MusicService.currentPlayingAudio.id);

                    currentModel.set({
                        playing : false
                    });

                    MusicService.currentPlayingAudio.id = undefined;
                    MusicService.currentPlayingAudio.status = undefined;

                    if (resp.state_code === 200) {
                        playHandler.call(this, MusicService.STATUS.FILE_COMPLETE);
                        deferred.resolve(resp);
                    } else {
                        playHandler.call(this, MusicService.STATUS.FILE_ERROR);
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        MusicService.stopAsync = function () {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.MUSIC_STOP,
                success : function (resp) {
                    if (resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        MusicService.STATUS = {
            FILE_READY : 0,
            FILE_PLAYING : 1,
            FILE_STOP : 2,
            FILE_COMPLETE : 3,
            FILE_ERROR : 4
        };

        return MusicService;
    });
}(this));
