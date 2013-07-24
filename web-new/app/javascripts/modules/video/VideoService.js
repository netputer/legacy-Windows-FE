/*global define*/
(function (window) {
    define([
        'jquery',
        'backbone',
        'underscore',
        'ui/BatchActionWindow',
        'ui/AlertWindow',
        'utilities/StringUtil',
        'Settings',
        'Device',
        'Internationalization',
        'IOBackendDevice',
        'Configuration',
        'video/collections/VideosCollection',
        'main/views/BatchErrorView'
    ], function (
        $,
        Backbone,
        _,
        BatchActionWindow,
        AlertWindow,
        StringUtil,
        Settings,
        Device,
        i18n,
        IO,
        CONFIG,
        VideosCollection,
        BatchErrorView
    ) {
        console.log('VideoService - File loaded. ');

        var alert = window.alert;

        var VideoService = _.extend({}, Backbone.Events);

        var exportPath;

        var exportAsync = function (ids, session, path) {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.VIDEO_EXPORT,
                data : {
                    video_id_list : ids.join(','),
                    session : session,
                    export_dir : path || '',
                    default_path : Settings.get('video_export_default_path')
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
        };

        VideoService.exportVideosAsync = function (ids) {
            var deferred = $.Deferred();

            var videosCollection = VideosCollection.getInstance();

            var session = _.uniqueId('video_export_');
            var batchActionWindow = new BatchActionWindow({
                session : session,
                progressText : i18n.video.EXPORT_PROGRESS_TEXT,
                cancelUrl : CONFIG.actions.VIDEO_CANCEL,
                total : ids.length,
                successText : i18n.video.EXPORT_SUCCESS_TEXT,
                delay : true
            });

            if (!exportPath) {
                var handler = IO.Backend.Device.onmessage({
                    'data.channel' : session
                }, function (data) {
                    if (!exportPath) {
                        exportPath = data.info;
                        IO.Backend.Device.offmessage(handler);
                    }
                });
            }

            exportAsync(ids, session, exportPath).done(function (resp) {
                Settings.set('video_export_default_path', exportPath, true);

                var failed = _.map(resp.body.failed, function (video) {
                    return video.item;
                });

                if (failed.length > 0) {
                    batchActionWindow.remove();

                    var alertWindow = BatchErrorView.getInstance({
                        tip : i18n.video.VIDEO_EXPORT_ERROR_TEXT,
                        items : _.map(failed, function (item) {
                            return videosCollection.get(item).get('display_name');
                        }),
                        errorInfo : _.find(resp.body.failed, function (video) {
                            return video.error_message;
                        })
                    });

                    alertWindow.once('button_retry', function () {
                        VideoService.exportVideosAsync(failed).done(deferred.resolve).fail(deferred.reject);
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
                    alert(i18n.video.EXPORT_FAILED_TEXT);
                    batchActionWindow.remove();
                }

                deferred.reject(resp);
            });

            return deferred.promise();
        };

        VideoService.importVideosAsync = function (paths) {
            var deferred = $.Deferred();

            var videosCollection = VideosCollection.getInstance();

            var session = _.uniqueId('video.import_');
            var batchActionWindow = new BatchActionWindow({
                session : session,
                progressText : i18n.video.IMPORT_PROGRESS_TEXT,
                cancelUrl : CONFIG.actions.VIDEO_CANCEL,
                total : paths.length,
                successText : i18n.video.IMPORT_SUCCESS_TEXT,
                delay : true
            });


            videosCollection.importAsync(paths, session).done(function (resp) {
                var failedPaths = _.map(resp.body.failed, function (video) {
                    return video.item;
                });

                if (failedPaths.length > 0) {
                    if (batchActionWindow !== undefined) {
                        batchActionWindow.remove();
                    }

                    var alertWindow = BatchErrorView.getInstance({
                        tip : i18n.video.VIDEO_IMPORT_ERROR_TEXT,
                        items : _.map(failedPaths, function (path) {
                            return path.replace(/^.*[\\\/](?=[^\\\/]+$)/, '');
                        }),
                        errorInfo : _.find(resp.body.failed, function (video) {
                            return video.error_message;
                        })
                    });

                    alertWindow.on('button_retry', function () {
                        if (Device.get('isConnected') && (Device.get('hasSDCard') || Device.get('hasEmulatedSD'))) {
                            VideoService.importVideosAsync(failedPaths).done(deferred.resolve).fail(deferred.reject);
                            alertWindow.remove();
                        }
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
                    if (resp.state_code === 500) {
                        alert(i18n.video.IMPORT_UNCONNECT_TEXT);
                    } else {
                        alert(i18n.video.IMPORT_FAILED_TEXT);
                    }
                    if (batchActionWindow !== undefined) {
                        batchActionWindow.remove();
                    }
                }

                deferred.reject(resp);
            });

            return deferred.promise();
        };

        VideoService.selectVideosAsync = function (type) {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.VIDEO_SELECT_VIDEO,
                data : {
                    type : type
                },
                success : function (resp) {
                    if (resp.state_code === 200) {
                        console.log('VideoService - Get selected videos success.');
                        deferred.resolve(resp);
                    } else {
                        console.error('VideoService - Get selected videos faild. Error info: ' + resp.state_line);
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        VideoService.deleteVideosAsync = function (ids) {
            var deferred = $.Deferred();

            var videosCollection = VideosCollection.getInstance();

            var disposableAlert = new AlertWindow({
                draggable : true,
                disposableName : 'videos-delete',
                buttonSet : 'yes_no',
                $bodyContent : StringUtil.format(i18n.video.DELETE_TIP, ids.length)
            });

            disposableAlert.on('button_yes', function () {
                var session;
                var batchActionWindow;
                if (ids.length > 1) {
                    session = _.uniqueId('videos.batch.delete_');
                    batchActionWindow = new BatchActionWindow({
                        session : session,
                        progressText : i18n.video.DELETE_PROGRESS_TEXT,
                        cancelUrl : CONFIG.actions.VIDEO_CANCEL,
                        total : ids.length,
                        successText : i18n.video.DELETE_SUCCESS_TEXT
                    });
                    batchActionWindow.show();
                }

                videosCollection.deleteAsync(ids, session).done(function (resp) {
                    var failed = _.map(resp.body.failed, function (video) {
                        return video.item;
                    });

                    if (failed.length > 0) {
                        if (batchActionWindow !== undefined) {
                            batchActionWindow.remove();
                        }

                        var alertWindow = BatchErrorView.getInstance({
                            needConnection : true,
                            tip : i18n.video.VIDEO_DELETE_ERROR_TEXT,
                            items : _.map(failed, function (item) {
                                var video = videosCollection.get(item);
                                return video ? video.get('display_name') : '';
                            }),
                            errorInfo : _.find(resp.body.failed, function (video) {
                                return video.error_message;
                            })
                        });

                        alertWindow.once('button_retry', function () {
                            VideoService.deleteVideosAsync(failed).done(deferred.resolve).fail(deferred.reject);
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
                        alert(i18n.video.DELETE_VIDEO_ERROR);
                    }
                    deferred.reject(resp);
                });
            }, this);

            disposableAlert.show();

            return deferred.promise();
        };

        return VideoService;
    });
}(this));
