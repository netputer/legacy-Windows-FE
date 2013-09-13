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
                var models = [];

                if (list.length === 0) {
                    this.trigger('refresh');
                    return;
                }

                var deferreds = _.map(list, function (item) {

                    var version = item.version;
                    var udid = item.udid;
                    var deviceName = item.deviceName;
                    var timestamp = item.timestamp;

                    var deferred = $.Deferred();
                    BackupRestoreService.remoteSnapshotInfoAllTypesAsync(version, udid).done(function (resp) {

                        var info = {
                            version : version,
                            udid : udid,
                            deviceName : deviceName,
                            timestamp: timestamp,
                            id : String(timestamp)

                        };
                        _.each(JSON.parse(resp.body.value), function (item) {
                            var brType = BackupRestoreService.getServerTypeFromBRType(item.type);
                            info[brType] = item.count;
                        });

                        models.push(info);
                        deferred.resolve(resp);

                    }.bind(this));

                    return deferred.promise();
                }, this);

                $.when.apply(this, deferreds).done(function () {

                    _.each(models, function (model) {
                        this.add(model);
                    }, this);
                    this.trigger('refresh');

                }.bind(this));
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