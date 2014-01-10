/*global define*/
(function (window) {
    'use strict';

    define([
        'jquery',
        'backbone',
        'underscore',
        'new_backuprestore/BackupRestoreService',
        'new_backuprestore/models/RestoreContextModel'
    ], function (
        $,
        Backbone,
        _,
        BackupRestoreService,
        RestoreContextModel
    ) {

        console.log('RestoreRemoteFileCollection - File loaded. ');

        var FileModel = Backbone.Model.extend({
            defaults : {
                1 : '...',
                3 : '...',
                8 : '...',
                10 : 0,
                version : '',
                udid : '',
                deviceName : '',
                timestamp : '',
                isReady : false
            }
        });

        var RestoreRemoteFileCollection = Backbone.Collection.extend({
            model : FileModel,
            comparator : function (first, second) {
                return  second.get('timestamp') - first.get('timestamp');
            },
            initialize : function () {

                var loading = false;
                Object.defineProperties(this, {
                    loading : {
                        set : function (value) {
                            loading = value;
                        },
                        get : function () {
                            return loading;
                        }
                    }
                });
            },
            updateAsync : function (list) {

                if (list.length === 0) {
                    this.trigger('refresh');
                    return;
                }

                _.each(list, function (item) {
                    this.add({
                        version : item.version,
                        udid : item.udid,
                        deviceName : item.deviceName,
                        timestamp: item.timestamp,
                        id : String(item.timestamp),
                        type : item.type
                    });
                }, this);
                this.trigger('refresh');

                this.each(function (model) {
                    var version = model.get('version');
                    var udid = model.get('udid');

                    BackupRestoreService.remoteSnapshotInfoAllTypesAsync(version, udid).done(function (resp) {

                        _.each(JSON.parse(resp.body.value), function (item) {
                            var brType = BackupRestoreService.getServerTypeFromBRType(item.type);
                            model.set(brType, item.count);
                        });

                        model.set('isReady', true);
                    });
                });
            },
            getAll : function () {
                return this.models;
            }
        });

        var restoreRemoteFileCollection;
        var factory = _.extend({
            getInstance : function () {
                if (!restoreRemoteFileCollection) {
                    restoreRemoteFileCollection = new RestoreRemoteFileCollection();
                }
                return restoreRemoteFileCollection;
            }
        });

        return factory;
    });
}(this));
