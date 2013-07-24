/*global define, $, Backbone, _*/
(function (window) {
    define([
        'IOBackendDevice',
        'Configuration',
        'Device',
        'task/models/TaskModel'
    ], function (IO, CONFIG, Device, TaskModel) {
        console.log('TaskService - File loaded.');

        var TaskService = _.extend({}, Backbone.Events);

        TaskService.BLOCK_LIST = [
            'NO_MORE_SDCARD',
            'NO_MORE_MEMORY',
            'INSTALL_PARSE_FAILED_INCONSISTENT_CERTIFICATES',
            'VIDEO_NEED_SUPPORT',
            'INSTALL_FAILED_MALICIOUS_APK',
            'DEVICE_NOT_FOUND'
        ];

        Object.freeze(TaskService.BLOCK_LIST);

        TaskService.batchDownloadAsync = function (apps, source, force) {
            var deferred = $.Deferred();

            IO.requestAsync({
                type : 'post',
                url : CONFIG.actions.APP_BATCH_DOWNLOAD + '?source=' + source + '&force=' + (force === true ? 1 : 0),
                data : {
                    downloadApps : apps
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

        TaskService.downloadAsync = function (model) {
            var deferred = $.Deferred();

            var url;
            switch (model.get('modelType')) {
            case CONFIG.enums.MODEL_TYPE_APPLICATION:
                url = CONFIG.actions.APP_DOWNLOAD;
                break;
            case CONFIG.enums.MODEL_TYPE_APPLICATION_DATA:
                url = CONFIG.actions.APP_DOWNLOAD_DATA;
                break;
            case CONFIG.enums.MODEL_TYPE_MUSIC:
                url = CONFIG.actions.MUSIC_DOWNLOAD;
                break;
            case CONFIG.enums.MODEL_TYPE_PHOTO:
                url = CONFIG.actions.PHOTO_DOWNLOAD;
                break;
            case CONFIG.enums.MODEL_TYPE_VIDEO:
                url = CONFIG.actions.VIDEO_DOWNLOAD;
                break;
            case CONFIG.enums.MODEL_TYPE_BOOK:
                url = CONFIG.actions.BOOK_DOWNLOAD;
                break;
            default:
                console.log('TaskService - Model type not defined. ');
                url = CONFIG.actions.APP_DOWNLOAD;
            }

            IO.requestAsync({
                url : url,
                data : {
                    url : model.get('downloadUrl'),
                    name : model.get('title'),
                    icon : model.get('iconPath'),
                    source : model.get('source') || 'unknown',
                    force : model.get('force') === true ? 1 : 0,
                    format : model.get('format') || '',
                    ext_id : model.get('source') || 'unknown',
                    packageName : model.get('packageName') || ''
                },
                success : function (resp) {
                    if (resp.state_code === 200) {
                        console.log('TaskService - Download "' + model.get('title') + '" start. ');

                        deferred.resolve(resp);
                    } else {
                        console.error('TaskService - Download "' + model.get('title') + '" faild to start. Error info: ' + resp.state_line);

                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        TaskService.installAsync = function (model) {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.APP_INSTALL,
                data : {
                    file : model.get('source_path'),
                    name : model.get('title'),
                    icon : model.get('iconPath'),
                    should_delete : model.get('should_delete'),
                    source : 'local_import'
                },
                success : function (resp) {
                    if (resp.state_code === 200) {
                        console.log('TaskService - Install local application  "' + model.get('name') + '" start.');

                        deferred.resolve(resp);
                    } else {
                        console.error('TaskManager - Fail to start install local application "' + model.get('title') + '". Error info: ' + resp.state_line);

                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        TaskService.addTask = function (taskType, modelType, model) {
            switch (taskType) {
            case CONFIG.enums.TASK_TYPE_INSTALL:
                switch (modelType) {
                case CONFIG.enums.MODEL_TYPE_APPLICATION:
                    model.set({
                        modelType : CONFIG.enums.MODEL_TYPE_APPLICATION
                    });
                    break;
                case CONFIG.enums.MODEL_TYPE_APPLICATION_DATA:
                    model.set({
                        modelType : CONFIG.enums.MODEL_TYPE_APPLICATION_DATA
                    });
                    break;
                case CONFIG.enums.MODEL_TYPE_MUSIC:
                    model.set({
                        modelType : CONFIG.enums.MODEL_TYPE_MUSIC
                    });
                    break;
                case CONFIG.enums.MODEL_TYPE_PHOTO:
                    model.set({
                        modelType : CONFIG.enums.MODEL_TYPE_PHOTO
                    });
                    break;
                case CONFIG.enums.MODEL_TYPE_VIDEO:
                    model.set({
                        modelType : CONFIG.enums.MODEL_TYPE_VIDEO
                    });
                    break;
                case CONFIG.enums.MODEL_TYPE_BOOK:
                    model.set({
                        modelType : CONFIG.enums.MODEL_TYPE_BOOK
                    });
                    break;
                }
                this.downloadAsync(new TaskModel(model.toJSON()));
                break;
            case CONFIG.enums.TASK_TYPE_LOCAL_INSTALL:
                switch (modelType) {
                case CONFIG.enums.MODEL_TYPE_APPLICATION:
                    break;
                }
                this.installAsync(new TaskModel(model.toJSON()));
                break;
            }
        };

        return TaskService;
    });
}(this));
