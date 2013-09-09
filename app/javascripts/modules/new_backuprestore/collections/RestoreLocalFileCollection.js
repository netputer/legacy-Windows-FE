/*global define*/
(function (window) {
    'use strict';

    define([
        'jquery',
        'backbone',
        'underscore',
        'new_backuprestore/BackupRestoreService'
    ], function (
        $,
        Backbone,
        _,
        BackupRestoreService
    ) {

        console.log('RestoreLocalFileCollection - File loaded. ');

        var FileModel = Backbone.Model.extend({
            defaults : {
                1: 0,
                3: 0,
                8: 0,
                10 : 0,
                path : '',
                name : ''
            }
        });

        var RestoreLocalFileCollection = Backbone.Collection.extend({
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
            parse : function (data) {

                var path = data.path;
                var shortFileName = path.substr(path.lastIndexOf('\\') + 1);
                var zip_index = shortFileName.lastIndexOf('.zip');
                if (zip_index > 0) {
                    shortFileName = shortFileName.substr(0, zip_index);
                }

                var info = {
                    'path' : path,
                    'name' : shortFileName,
                    'id' : shortFileName
                };

                _.map(data.info, function (item) {
                    info[item.type] = item.count;
                });

                return info;
            },
            updateAsync : function (list) {

                var models = [];
                var deferreds = _.map(list, function (name) {

                    var deferred = $.Deferred();
                    BackupRestoreService.readRestoreFileAsync(name).done(function (resp) {

                        models.push({
                            info : resp.body.item,
                            path : name
                        });

                        deferred.resolve(resp);
                    }.bind(this));

                    return deferred.promise();
                }, this);

                $.when.apply(this, deferreds).done(function () {

                    _.map(models, function (model) {
                        this.add(model, {parse : true});
                    }, this);
                    this.trigger('refresh');

                }.bind(this));
            },
            getAll : function () {
                return this.models;
            }
        });

        var restoreLocalFileCollection;
        var factory = _.extend({
            getInstance : function () {
                if (!restoreLocalFileCollection) {
                    restoreLocalFileCollection = new RestoreLocalFileCollection();
                }
                return restoreLocalFileCollection;
            }
        });

        return factory;
    });
}(this));