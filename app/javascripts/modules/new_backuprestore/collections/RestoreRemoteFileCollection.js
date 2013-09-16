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
                1: 0,
                3: 0,
                8: 0,
                10 : 0,
                version : '',
                udid : '',
                deviceName : '',
                timestamp : ''
            }
        });

        var RestoreRemoteFileCollection = Backbone.Collection.extend({
            model : FileModel,
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

                _.each(this.models, function (model) {
                    var version = model.get('version');
                    var udid = model.get('udid');

                    BackupRestoreService.remoteSnapshotInfoAllTypesAsync(version, udid).done(function (resp) {

                        _.each(JSON.parse(resp.body.value), function (item) {
                            var brType = BackupRestoreService.getServerTypeFromBRType(item.type);
                            model.set(brType, item.count);
                        });

                    });
                });
            },
            getAll : function () {
                var models = this.models.sort(function (a, b) {
                    return b.get('timestamp') - a.get('timestamp');
                });

                return models;
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