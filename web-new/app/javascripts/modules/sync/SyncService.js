/*global define*/
(function (window, undefined) {
    define([
        'backbone',
        'underscore',
        'jquery',
        'IO',
        'Configuration'
    ], function (
        Backbone,
        _,
        $,
        IO,
        CONFIG
    ) {
        console.log('SyncService - File loaded.');

        var SyncService = _.extend(function () {}, Backbone.Events);

        SyncService.getIsPhotoSyncOnAsync = function () {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.IS_PHOTO_SYNC_ON,
                data : {
                    data_id : CONFIG.enums.SYNC_DATA_TYPE_PHOTO
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

        SyncService.uploadPhotoAsync = function () {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.UPLOAD_PHOTO,
                data : {
                    session : CONFIG.events.SYNC_PHOTO_COMPLETE,
                    data_id : CONFIG.enums.SYNC_DATA_TYPE_PHOTO
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

        SyncService.setPhotoSyncSwitchAsync = function (isOn) {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.SET_PHOTO_SYNC,
                data : {
                    is_on : Number(isOn),
                    data_id: CONFIG.enums.SYNC_DATA_TYPE_PHOTO
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

        SyncService.setRemoteAutoBackupSwitchAsync = function (isOn) {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.SYNC_SET_SWITCH,
                data : {
                    contact : Number(isOn),
                    sms : Number(isOn),
                    app : Number(isOn)
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

        return SyncService;
    });
}(this));
