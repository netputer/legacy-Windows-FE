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
            comparator : function (first, second) {
                return  second.id.localeCompare(first.id);
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

                _.each(list, function (name) {

                    var path = name;
                    var shortFileName = path.substr(path.lastIndexOf('\\') + 1);
                    var zip_index = shortFileName.lastIndexOf('.zip');
                    if (zip_index > 0) {
                        shortFileName = shortFileName.substr(0, zip_index);
                    }

                    this.add({
                        'path' : path,
                        'name' : shortFileName,
                        'id' : shortFileName
                    });

                }, this);
                this.trigger('refresh');

                this.each(function (model) {
                    BackupRestoreService.readRestoreFileAsync(model.get('path')).done(function (resp) {

                        var info = {};
                        _.each(resp.body.item, function (item) {
                            info[item.type] = item.count;
                        });

                        model.set(info);
                    });

                });
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
