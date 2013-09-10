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
                    IsSmsSelected : {
                        get : function () {
                            return this.get('dataIDList').indexOf(CONFIG.enums.BR_TYPE_SMS) >= 0;
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
                    },
                    BrSpec : {
                        get : function () {
                            var data = this.get('restoreData');
                            var noneApp = _.filter(this.get('dataIDList'), function (item) {
                                return item !== CONFIG.enums.BR_TYPE_APP && item !== CONFIG.enums.BR_TYPE_APP_DATA;
                            });

                            return {
                                item : _.map(noneApp, function (type) {
                                    if (data[type]) {
                                        return {
                                            type : type,
                                            count : data[type]
                                        };
                                    }
                                }),
                                type : 2
                            };
                        }
                    }
                });
            },
            defaults : {

                restoreData : {},

                // 0 : local, 1 : remote
                backupType : 0,

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
                //snapshotList : [],
                //snapshotInfoDict : {},
                //sanpshotListLoadFinish : false,

                smsDupCount: 0,
                contactsDupCount: 0
            },
            clearCache : function () {

                this.set('restoreData', 0);
                this.set('backupType', 0);

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
                //this.set('snapshotList', []);
                //this.set('snapshotInfoDict', {});
                //this.set('sanpshotListLoadFinish', false);

                this.set('smsDupCount', 0);
                this.set('contactsDupCount', 0);
            }
        });

        return new RestoreContextModel();
    });
}(this));
