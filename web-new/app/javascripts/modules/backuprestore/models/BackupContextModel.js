/*global console, define*/
(function (window) {
    define([
        'underscore',
        'backbone',
        'Environment',
        'Configuration'
    ], function (
        _,
        Backbone,
        Environment,
        CONFIG
    ) {
        console.log('BackupContextModel - File loaded.');

        var BackupContextModel = Backbone.Model.extend({
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
                    IsFileNameReady : {
                        get : function () {
                            return this.get('filePath').length > 0 && this.get('fileName').length > 0;
                        }
                    },
                    GetFullFilePath : {
                        get : function () {
                            var filePath = this.get('filePath');
                            if (filePath.length > 0 && filePath[filePath.length - 1] !== '\\') {
                                filePath = filePath + '\\';
                            }
                            return filePath + this.get('fileName');
                        }
                    },
                    GetBRSpec : {
                        get : function () {
                            var numList = this.get('dataNumList');
                            return {
                                'item' : _.map(this.get('dataIDList'), function (id) {
                                    return {
                                        type : id,
                                        count : numList[id]
                                    };
                                }),
                                type : 1    // BRServiceType.BR_ST_BACKUP
                            };
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

                // list of selected data type
                dataIDList : [CONFIG.enums.BR_TYPE_CONTACT, CONFIG.enums.BR_TYPE_SMS, CONFIG.enums.BR_TYPE_APP],
                // list of data numbers of all data type
                dataNumList : {},

                // 0 : wdapk, 1 : apk, 2 : auto
                appType : 0,

                filePath : '',
                fileName : '',

                appPath : '',

                // error item list
                smsErrorList : [],
                contactsErrorList : [],
                appErrorList : [],

                remoteErrorResult : [],
                remoteErrorCode : 0,
                appDataErrorMessage : ''
            },
            clearCache : function () {
                this.set('backupType', 0);
                this.set('dataIDList', [CONFIG.enums.BR_TYPE_CONTACT, CONFIG.enums.BR_TYPE_SMS, CONFIG.enums.BR_TYPE_APP]);
                this.set('dataNumList', {});

                this.set('appType', 0);
                this.set('filePath', '');
                this.set('fileName', '');
                this.set('appPath', '');

                this.set('smsErrorList', []);
                this.set('contactsErrorList', []);
                this.set('appErrorList', []);
                this.set('remoteErrorResult', []);
                this.set('remoteErrorCode', 0);
                this.set('appDataErrorMessage', '');
            }
        });

        var backupContextModel = new BackupContextModel();
        return backupContextModel;
    });
}(this));
