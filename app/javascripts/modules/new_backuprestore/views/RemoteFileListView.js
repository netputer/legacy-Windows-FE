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
        'Internationalization',
        'ui/SmartList',
        'new_backuprestore/BackupRestoreService',
        'new_backuprestore/models/RestoreContextModel',
        'new_backuprestore/collections/RestoreRemoteFileCollection',
        'new_backuprestore/views/RemoteFileItemView'
    ], function (
        $,
        Backbone,
        _,
        doT,
        log,
        Device,
        CONFIG,
        i18n,
        SmartList,
        BackupRestoreService,
        RestoreContextModel,
        RestoreRemoteFileCollection,
        RemoteFileItemView
    ) {

        console.log('RemoteFileListView - File Loaded');

        var restoreTypeList = [
            CONFIG.enums.BR_TYPE_CONTACT,
            CONFIG.enums.BR_TYPE_SMS,
            CONFIG.enums.BR_TYPE_APP,
            CONFIG.enums.BR_TYPE_APP_DATA
        ];
        var fileList;
        var restoreFileCollection;

        var RemoteFileListView = Backbone.View.extend({
            className : 'w-backuprestore-file-list hbox',
            initialize : function () {
                RemoteFileListView.__super__.initialize.apply(this, arguments);

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
                RemoteFileListView.__super__.remove.apply(this, arguments);

                fileList.remove();
                fileList = undefined;

                restoreFileCollection = undefined;
            },
            buildList : function () {
                restoreFileCollection = RestoreRemoteFileCollection.getInstance();

                if (!fileList) {
                    fileList = new SmartList({
                        itemView : RemoteFileItemView.getClass(),
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

                this.update();
            },
            update : function () {

                fileList.loading = true;
                var oldList = restoreFileCollection.getAll();
                var lastEntity = oldList[oldList.length - 1];
                BackupRestoreService.remoteSnapshotListAutoAsync(lastEntity).done(function (resp) {

                    var newList = JSON.parse(resp.body.value);
                    restoreFileCollection.updateAsync(newList);

                    if (newList.length < BackupRestoreService.CONSTS.DefaultSnapshot.Size) {
                        this.trigger('__HIDE_SHOW_MORE');
                    }

                }.bind(this)).fail(function (resp) {

                    var alertContext = (resp.state_code === 747) ? i18n.new_backuprestore.CUSTOM_RESOURCE_LOCKED : i18n.new_backuprestore.RESTORE_LIST_SNAPHOST_FAILED;
                    BackupRestoreService.logRestoreContextModel(RestoreContextModel, false);
                    alert(alertContext);

                    this.trigger('__RETURN_TO_START');

                }.bind(this));
            },
            setRestoreData : function () {

                var model = restoreFileCollection.get(parseInt(this.selectedId, 10));
                var data = model.toJSON();

                RestoreContextModel.set('restoreData', data);
                RestoreContextModel.set('remoteVersion', data.version);
                RestoreContextModel.set('udid', data.udid);

                var list = [];
                _.map(restoreTypeList, function (type) {
                    if (data[type]) {
                        list.push(type);
                    }
                });
                RestoreContextModel.set('dataIDList', list);
            },
            getAll : function () {
                return restoreFileCollection.getAll();
            }
        });

        var factory = _.extend({
            getInstance : function () {
                return new RemoteFileListView();
            }
        });

        return factory;
    });

}(this));
