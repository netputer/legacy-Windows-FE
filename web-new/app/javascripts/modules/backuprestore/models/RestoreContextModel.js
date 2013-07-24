/*global define*/
(function (window) {
    define([
        'underscore',
        'backbone',
        'Configuration',
        'Internationalization'
    ], function (
        _,
        Backbone,
        CONFIG,
        i18n
    ) {
        console.log('RestoreContextModel - File loaded.');

        var RestoreContextModel = Backbone.Model.extend({
            initialize : function () {
                Object.defineProperties(this, {
                    IsLocal : {
                        get : function () {
                            return this.get('backupType') === 0;
                        }
                    },
                    FileList : {
                        get : function () {
                            return _.map(this.get('backupFileList'), function (item) {
                                var shortFileName = item.substr(item.lastIndexOf('\\') + 1);
                                var zip_index = shortFileName.lastIndexOf('.zip');
                                if (zip_index > 0) {
                                    shortFileName = shortFileName.substr(0, zip_index);
                                }

                                return {
                                    file_name : item,
                                    short_file_name : shortFileName
                                };
                            });
                        }
                    },
                    GetBRSpec : {
                        get : function () {
                            var numList = {};
                            if (this.IsLocal) {
                                var file = this.get('fileName');
                                numList = this.get('backupFileInfoDict')[file];
                            } else {
                                var version = this.get('remoteVersion');
                                numList = this.get('snapshotInfoDict')[version];
                            }

                            var noneApp = _.filter(this.get('dataIDList'), function (item) {
                                return item !== CONFIG.enums.BR_TYPE_APP && item !== CONFIG.enums.BR_TYPE_APP_DATA;
                            });

                            return {
                                item : _.map(noneApp, function (id) {
                                    return {
                                        type : id,
                                        count : numList[id]
                                    };
                                }),
                                type : 2    // BRServiceType.BR_ST_RESTORE
                            };
                        }
                    },
                    SelectedFileIndex : {
                        get : function () {
                            var file = this.get('fileName');
                            return this.get('backupFileList').indexOf(file);
                        }
                    },
                    IsAppSelected : {
                        get : function () {
                            return this.get('dataIDList').indexOf(CONFIG.enums.BR_TYPE_APP) >= 0;
                        }
                    },
                    IsAppDataSelected : {
                        get : function () {
                            return this.get('dataIDList').indexOf(CONFIG.enums.BR_TYPE_APP_DATA) >= 0;
                        }
                    },
                    IsContactSelected : {
                        get : function () {
                            return this.get('dataIDList').indexOf(CONFIG.enums.BR_TYPE_CONTACT) >= 0;
                        }
                    },
                    IsNoneAppSelected : {
                        get : function () {
                            return this.get('dataIDList').indexOf(CONFIG.enums.BR_TYPE_CONTACT) >= 0 ||
                                   this.get('dataIDList').indexOf(CONFIG.enums.BR_TYPE_SMS) >= 0 ||
                                   this.get('dataIDList').indexOf(CONFIG.enums.BR_TYPE_CALLLOG) >= 0;
                        }
                    },
                    GetServerTypes : {
                        get : function () {
                            var types = [];
                            _.each(this.get('dataIDList'), function (id) {
                                switch (id) {
                                case CONFIG.enums.BR_TYPE_CONTACT:
                                    types.push(1);
                                    break;
                                case CONFIG.enums.BR_TYPE_SMS:
                                    types.push(2);
                                    break;
                                case CONFIG.enums.BR_TYPE_APP:
                                    types.push(3);
                                    break;
                                default:
                                    break;
                                }
                            });
                            return types;
                        }
                    }
                });
            },
            defaults : {
                // 0 : local, 1 : remote
                backupType : 0,

                backupFileList : [],
                backupFileInfoDict :  {},

                // full file name and path to restore
                fileName : '',

                // data type selected to restore
                dataIDList : [],

                isAccountReady : false,
                accountType : '',
                accountName : '',

                battery : -1,

                appPath : '',
                errorItemList : [],

                remoteVersion : '',
                udid : '',
                snapshotList : [],
                snapshotInfoDict : {},
                sanpshotListLoadFinish : false
            },
            clearCache : function () {
                this.set('backupType', 0);
                this.set('backupFileList', []);
                this.set('backupFileInfoDict', {});
                this.set('fileName', '');
                this.set('dataIDList', []);

                this.set('isAccountReady', false);
                this.set('accountType', '');
                this.set('accountName', '');
                this.set('battery', -1);

                this.set('appPath', '');
                this.set('errorItemList', []);

                this.set('remoteVersion', '');
                this.set('udid', '');
                this.set('snapshotList', []);
                this.set('snapshotInfoDict', {});
                this.set('sanpshotListLoadFinish', false);
            }
        });

        var restoreContextModel = new RestoreContextModel();
        return restoreContextModel;
    });
}(this));
