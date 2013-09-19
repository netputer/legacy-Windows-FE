/*global define*/
(function (window) {
    define([
        'jquery',
        'backbone',
        'underscore',
        'doT',
        'Log',
        'Device',
        'Configuration',
        'ui/SmartList',
        'new_backuprestore/BackupRestoreService',
        'new_backuprestore/models/RestoreContextModel',
        'new_backuprestore/collections/RestoreLocalFileCollection',
        'new_backuprestore/views/FileItemView'
    ], function (
        $,
        Backbone,
        _,
        doT,
        log,
        Device,
        CONFIG,
        SmartList,
        BackupRestoreService,
        RestoreContextModel,
        RestoreLocalFileCollection,
        FileItemView
    ) {

        console.log('LocalFileListView - File Loaded');

        var restoreTypeList = [
            CONFIG.enums.BR_TYPE_CONTACT,
            CONFIG.enums.BR_TYPE_SMS,
            CONFIG.enums.BR_TYPE_APP,
            CONFIG.enums.BR_TYPE_APP_DATA
        ];
        var fileList;
        var restoreFileCollection;
        var LocalFileListView = Backbone.View.extend({
            className : 'w-backuprestore-file-list hbox',
            initialize : function () {
                LocalFileListView.__super__.initialize.apply(this, arguments);

                var selectedId;
                Object.defineProperties(this, {
                    selectedId : {
                        set : function (value) {
                            selectedId = value;
                        },
                        get : function () {
                            return selectedId;
                        }
                    }
                });
            },
            remove : function () {
                LocalFileListView.__super__.remove.apply(this, arguments);

                fileList.remove();
                fileList = undefined;

                restoreFileCollection.reset();
                restoreFileCollection = undefined;
            },
            buildList : function () {
                restoreFileCollection = RestoreLocalFileCollection.getInstance();
                if (!fileList) {
                    fileList = new SmartList({
                        itemView : FileItemView.getClass(),
                        dataSet : [{
                            name : 'all',
                            getter : restoreFileCollection.getAll
                        }],
                        enableContextMenu : false,
                        keepSelect : false,
                        enableMutilselect : false,
                        itemHeight : 45,
                        listenToCollection : restoreFileCollection,
                        loading : restoreFileCollection.loading || restoreFileCollection.syncing
                    });

                    this.$el.append(fileList.render().$el);

                }

                this.listenTo(restoreFileCollection, 'refresh', function () {
                    fileList.switchSet('all');
                    fileList.loading = false;
                });

                this.listenTo(fileList, 'select:change', function (selected) {
                    if (selected.length > 0) {
                        this.selectedId = selected[0];
                        this.setRestoreData();
                    } else {
                        this.selectedId = null;
                    }

                    this.trigger('selected', selected.length > 0);
                });

                fileList.loading = true;
                BackupRestoreService.listRestoreFileAsync().done(function (resp) {
                    restoreFileCollection.updateAsync(resp.body.back_file);
                });
            },
            parse: function (data) {
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

                _.each(data.info, function (item) {
                    info[item.type] = item.count;
                });

                return info;
            },
            setRestoreData : function (info) {

                var data;
                if (info) {
                    data = this.parse(info);
                } else {
                    var model = restoreFileCollection.get(this.selectedId);
                    data = model.toJSON();
                }

                RestoreContextModel.set('restoreData', data);
                RestoreContextModel.set('fileName', data.path);

                var list = [];
                _.each(restoreTypeList, function (type) {
                    if (data[type]) {
                        list.push(type);
                    }
                });
                RestoreContextModel.set('dataIDList', list);
                RestoreContextModel.set('originDataIDList', list);

                BackupRestoreService.getSupportAppDataAsync().done(function (resp) {

                    if (!resp.body.value) {
                        var list = RestoreContextModel.get('dataIDList');
                        list = _.filter(list, function (type) {
                            return type !== CONFIG.enums.BR_TYPE_APP_DATA;
                        });
                        RestoreContextModel.set('dataIDList', list);
                    }
                });
            },
            getAll : function () {
                return restoreFileCollection.getAll();
            }
        });

        var factory = _.extend({
            getInstance : function () {
                return new LocalFileListView();
            }
        });

        return factory;
    });

}(this));