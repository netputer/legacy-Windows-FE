/*global define, Backbone, $*/
(function (window) {
    define([
        'IO',
        'Internationalization',
        'Configuration',
        'utilities/StringUtil'
    ], function (
        IO,
        i18n,
        CONFIG,
        StringUtil
    ) {
        console.log('TaskModel - File loaded.');

        // If status message is in this list, force restart button will be shown
        var BLACK_LIST1 = [
            'INSTALL_FAILED_ALREADY_EXISTS',
            'INSTALL_PARSE_FAILED_INCONSISTENT_CERTIFICATES'
        ];

        // If status message is in this list, retry button won't be displied
        var BLACK_LIST2 = [
            'UNKNOWN_VEDIO_URL',
            'NO_VEDIO_SEGMENT_FOUND',
            'INSTALL_FAILED_CPU_ABI_INCOMPATIBLE',
            'INSTALL_FAILED_DUPLICATE_PACKAGE',
            'INSTALL_FAILED_MISSING_SHARED_LIBRARY',
            'INSTALL_FAILED_NEWER_SDK',
            'INSTALL_FAILED_OLDER_SDK',
            'INSTALL_FAILED_SHARED_USER_INCOMPATIBLE',
            'INSTALL_FAILED_TEST_ONLY',
            'INSTALL_FAILED_MISSING_FEATURE',
            'INSTALL_FAILED_UNKOWNED_ERROR',
            'INSTALL_FAILED_INVALID_URI',
            'INSTALL_PARSE_FAILED_BAD_MANIFEST',
            'INSTALL_PARSE_FAILED_BAD_SHARED_USER_ID',
            'INSTALL_PARSE_FAILED_CERTIFICATE_ENCODING',
            'INSTALL_PARSE_FAILED_MANIFEST_EMPTY',
            'INSTALL_PARSE_FAILED_MANIFEST_MALFORMED',
            'INSTALL_PARSE_FAILED_NO_CERTIFICATES',
            'INSTALL_PARSE_FAILED_NOT_APK',
            'INSTALL_PARSE_FAILED_UNEXPECTED_EXCEPTION',
            'INSTALL_PARSE_FAILED_UNKNOWN_FORMAT'
        ];

        var ICON_MAP = {
            'wdj://icon/photo' : CONFIG.enums.TASK_DEFAULT_ICON_PATH_PHOTO,
            'wdj://icon/music' : CONFIG.enums.TASK_DEFAULT_ICON_PATH_MUSIC,
            'wdj://icon/app' : CONFIG.enums.TASK_DEFAULT_ICON_PATH_APP,
            'wdj://icon/video' : CONFIG.enums.TASK_DEFAULT_ICON_PATH_VIDEO,
            'wdj://icon/book' : CONFIG.enums.TASK_DEFAULT_ICON_PATH_BOOK,
            'wdj://icon/file' : CONFIG.enums.TASK_DEFAULT_ICON_PATH_FILE
        };

        var TaskModel = Backbone.Model.extend({
            defaults : {
                state : CONFIG.enums.TASK_STATE_ADDED,
                processing : 0,
                status : i18n.taskManager.TASK_ADDED,
                size : 0
            },
            initialize : function () {
                this.pretreatment();

                Object.defineProperties(this, {
                    isRunning : {
                        get : function () {
                            var state = this.get('state');
                            return state === CONFIG.enums.TASK_STATE_WAITING ||
                                    state === CONFIG.enums.TASK_STATE_PROCESSING;
                        }
                    },
                    isInQueue : {
                        get : function () {
                            var type = this.get('type');
                            return type !== CONFIG.enums.TASK_STATE_SUCCESS &&
                                    type !== CONFIG.enums.TASK_STATE_FAILD;
                        }
                    },
                    isStoped : {
                        get : function () {
                            var state = this.get('state');
                            return state === CONFIG.enums.TASK_STATE_ADDED ||
                                    state === CONFIG.enums.TASK_STATE_FAILD;
                        }
                    }
                });
            },
            pretreatment : function () {
                this.set({
                    downloadUrl : this.get('downloadUrl') || this.get('url'),
                    title : this.get('title') || this.get('name') || i18n.taskManager.UNKNOWN_NAME,
                    icon : ICON_MAP[this.get('icon')] || this.get('icon') || CONFIG.enums.TASK_DEFAULT_ICON_PATH_APP,
                    forceRestart : BLACK_LIST1.indexOf(this.get('message')) >= 0,
                    blockAction : BLACK_LIST2.indexOf(this.get('message')) >= 0
                }, {
                    silent : true
                });
            },
            deleteTaskAsync : function (clear) {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.TASK_DELETE_TASK,
                    data : {
                        job : this.get('id'),
                        clear : Number(clear)
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('TaskModel - Delete task success.');
                            deferred.resolve(resp);
                        } else {
                            console.error('TaskModel - Delete task failed. Error info: ' + resp.state_line);
                            deferred.reject(resp);
                        }
                    }
                });

                return deferred.promise();
            },
            stopTaskAsync : function () {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.TASK_STOP_TASK,
                    data : {
                        job : this.get('id')
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('TaskModel - Stop task success.');
                            deferred.resolve(resp);
                        } else {
                            console.error('TaskModel - Stop task failed. Error info: ' + resp.state_line);
                            deferred.reject(resp);
                        }
                    }
                });

                return deferred.promise();
            },
            startTaskAsync : function () {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.TASK_START_TASK,
                    data : {
                        job : this.get('id')
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('TaskModel - Start task success.');
                            deferred.resolve(resp);
                        } else {
                            console.error('TaskModel - Start task failed. Error info: ' + resp.state_line);
                            deferred.reject(resp);
                        }
                    }
                });

                return deferred.promise();
            },
            restartAsync : function (options) {
                var deferred = $.Deferred();

                var data = {
                    job : this.get('id')
                };

                if (options) {
                    var key;
                    for (key in options) {
                        if (options.hasOwnProperty(key)) {
                            data[key] = options[key];
                        }
                    }
                }

                IO.requestAsync({
                    url : CONFIG.actions.TASK_START_TASK,
                    data : data,
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('TaskModel - Force restart task success.');
                            deferred.resolve(resp);
                        } else {
                            console.error('TaskModel - Force restart task failed. Error info: ' + resp.state_line);
                            deferred.reject(resp);
                        }
                    }
                });

                return deferred.promise();
            },
            openFolderAsync : function () {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.TASK_OPEN_FOLDER,
                    data : {
                        job : this.get('id')
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('TaskModel - Open folder success.');
                            deferred.resolve(resp);
                        } else {
                            console.error('TaskModel - Open folder failed. Error info: ' + resp.state_line);
                            deferred.reject(resp);
                        }
                    }
                });

                return deferred.promise();
            },
            openOnDeviceAsync : function () {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.DEVICE_OPEN_SD_CARD,
                    data : {
                        category : this.get('category')
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('TaskModel - Open folder on device success.');
                            deferred.resolve(resp);
                        } else {
                            console.error('TaskModel - Open folder on device failed. Error info: ' + resp.state_line);
                            deferred.reject(resp);
                        }
                    }
                });

                return deferred.promise();
            },
            setAsWallpaperAsync : function (id) {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.PHOTO_SET_WALLPAPER,
                    data : {
                        photo_id : id
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('TaskModel - Set as wallpaper success.');
                            deferred.resolve(resp);
                        } else {
                            console.error('TaskModel - Set as wallpaper failed. Error info: ' + resp.state_line);
                            deferred.reject(resp);
                        }
                    }
                });

                return deferred.promise();
            }
        });

        return TaskModel;
    });
}(this));
