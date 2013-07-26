/*global define*/
(function (window) {
    define([
        'underscore',
        'backbone',
        'jquery',
        'ui/BatchActionWindow',
        'ui/AlertWindow',
        'utilities/StringUtil',
        'Internationalization',
        'IOBackendDevice',
        'Configuration',
        'Settings',
        'Device',
        'main/views/BatchErrorView'
    ], function (
        _,
        Backbone,
        $,
        BatchActionWindow,
        AlertWindow,
        StringUtil,
        i18n,
        IO,
        CONFIG,
        Settings,
        Device,
        BatchErrorView
    ) {
        console.log('PhotoService - File loaded.');

        var alert = window.alert;

        var PhotoService = _.extend({}, Backbone.Events);

        var exportPath;

        var exportAsync = function (ids, session, path, isCloud) {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.PHOTO_EXPORT,
                data : {
                    photo_id_list : ids.join(','),
                    session : session,
                    export_dir : path || '',
                    default_path : Settings.get('photo_export_default_path'),
                    is_cloud : isCloud ? 1 : 0
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

        PhotoService.exportPhotosAsync = function (ids, models) {
            var deferred = $.Deferred();

            var session = _.uniqueId('photo.export_');
            var batchActionWindow = new BatchActionWindow({
                session : session,
                progressText : i18n.photo.EXPORT_PROGRESS_TEXT,
                cancelUrl : CONFIG.actions.PHOTO_CANCEL,
                total : ids.length,
                successText : i18n.photo.EXPORT_SUCCESS_TEXT,
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

            exportAsync(ids, session, exportPath, models[0].is_cloud).done(function (resp) {
                Settings.set('photo_export_default_path', exportPath, true);

                var failed = _.map(resp.body.failed, function (photo) {
                    return photo.item;
                });

                if (failed.length > 0) {
                    batchActionWindow.remove();

                    var photoCollection = new Backbone.Collection(models);
                    var alertWindow = BatchErrorView.getInstance({
                        tip : i18n.photo.PHOTO_EXPORT_ERROR_TEXT,
                        items : _.map(failed, function (item) {
                            return photoCollection.get(item).get('display_name');
                        }),
                        errorInfo : _.find(resp.body.failed, function (photo) {
                            return photo.error_message;
                        })
                    });
                    photoCollection.set([]);
                    photoCollection = undefined;

                    alertWindow.once('button_retry', function () {
                        PhotoService.exportPhotosAsync(failed).done(deferred.resolve).fail(deferred.reject);
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
                    alert(i18n.photo.EXPORT_FAILED_TEXT);
                    batchActionWindow.remove();
                }

                deferred.reject(resp);
            });

            return deferred.promise();
        };

        var importPhotosAsync = function (paths, session) {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.PHOTO_IMPORT,
                data : {
                    file_path_list : JSON.stringify({
                        image : _.map(paths, function (path) {
                            return {
                                path : path
                            };
                        })
                    }),
                    session : session
                },
                success : function (resp) {
                    if (resp.state_code === 200) {
                        console.log('PhotoService - Import success. ');
                        deferred.resolve(resp);
                    } else if (resp.state_code === 402) {
                        deferred.reject(resp);
                    } else {
                        console.error('PhotoService - Import failed. Error info: ' + resp.state_line);
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        PhotoService.importPhotosAsync = function (paths) {
            var deferred = $.Deferred();

            var session = _.uniqueId('photo.import_');
            var batchActionWindow = new BatchActionWindow({
                session : session,
                progressText : i18n.photo.IMPORT_PROGRESS_TEXT,
                cancelUrl : CONFIG.actions.PHOTO_CANCEL,
                total : paths.length,
                successText : i18n.photo.IMPORT_SUCCESS_TEXT,
                delay : true
            });

            importPhotosAsync(paths, session).done(function (resp) {
                var failedPaths = _.map(resp.body.failed, function (photo) {
                    return photo.item;
                });

                if (failedPaths.length > 0) {
                    if (batchActionWindow !== undefined) {
                        batchActionWindow.remove();
                    }

                    var alertWindow = BatchErrorView.getInstance({
                        needConnection : true,
                        tip : i18n.photo.PHOTO_IMPORT_ERROR_TEXT,
                        items : _.map(failedPaths, function (path) {
                            return path.replace(/^\w*[\\\/]?=[^\\\/]+$/, '');
                        }),
                        errorInfo : _.find(resp.body.failed, function (photo) {
                            return photo.error_message;
                        })
                    });

                    alertWindow.on('button_retry', function () {
                        if (Device.get('isConnected') && (Device.get('hasSDCard') || Device.get('hasEmulatedSD'))) {
                            PhotoService.importPhotosAsync(failedPaths).done(deferred.resolve).fail(deferred.reject);
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
                    alert(i18n.photo.WALLPAPER_SETTING_FAILED_TEXT);
                    if (batchActionWindow !== undefined) {
                        batchActionWindow.remove();
                    }
                }

                deferred.reject(resp);
            });

            return deferred.promise();
        };

        var deletePhototsAsync = function (ids, session, isCloud) {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.PHOTO_DELETE,
                data : {
                    photo_id_list : ids.join(','),
                    session : session || '',
                    is_cloud : isCloud ? 1 : 0
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

        PhotoService.deletePhototsAsync = function (ids, isCloud) {
            var deferred = $.Deferred();

            var disposableAlert = new AlertWindow({
                draggable : true,
                disposableName : 'photo-delete',
                buttonSet : 'yes_no',
                $bodyContent : StringUtil.format(i18n.photo.DELETE_TIP, ids.length)
            });

            disposableAlert.once('button_yes', function () {
                var session;
                if (ids.length > 1) {
                    session = _.uniqueId('sms.batch.delete_');
                    var batchActionWindow = new BatchActionWindow({
                        session : session,
                        progressText : i18n.photo.DELETE_PROGRESS_TEXT,
                        cancelUrl : CONFIG.actions.PHOTO_CANCEL,
                        total : ids.length,
                        successText : i18n.photo.DELETE_SUCCESS_TEXT
                    });
                    batchActionWindow.show();
                }

                deletePhototsAsync(ids, session, isCloud).done(function (resp) {
                    IO.sendCustomEventsAsync(CONFIG.events.CUSTOM_IFRAME_PHOTO_DELETED, {
                        data : _.pluck(resp.body.success, 'item')
                    });
                    deferred.resolve(resp);
                }).fail(function (resp) {
                    IO.requestAsync(CONFIG.actions.PHOTO_SYNC);
                    deferred.reject(resp);
                });
            }, this);

            disposableAlert.once('button_cancel button_no', function () {
                IO.sendCustomEventsAsync(CONFIG.events.CUSTOM_IFRAME_PHOTO_DELETED, {
                    data : []
                });
                deferred.reject();
            });

            disposableAlert.show();

            return deferred.promise();
        };

        PhotoService.selectPhotosAsync = function (type, session) {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.PHOTO_SELECT_PHOTO,
                data : {
                    session : session,
                    type : type,
                    width : 42,
                    height : 42
                },
                success : function (resp) {
                    if (resp.state_code === 200) {
                        console.log('PhotoService - Get selected photos success.');
                        deferred.resolve(resp);
                    } else {
                        console.error('PhotoService - Get selected photos faild. Error info: ' + resp.state_line);
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        PhotoService.cancelThumbnailAsync = function (session) {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.PHOTO_CANCEL_THUMBNAIL,
                data : {
                    session : session
                },
                success : function (resp) {
                    if (resp.state_code === 200) {
                        console.log('PhotoService - Delete photo thumbnail success.');
                        deferred.resolve(resp);
                    } else {
                        console.error('PhotoService - Delete photo thumbnail faild. Error info: ' + resp.state_line);
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        return PhotoService;
    });
}(this));
