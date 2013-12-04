/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'jquery',
        'IOBackendDevice',
        'Device',
        'Configuration',
        'Environment',
        'Internationalization',
        'Log',
        'utilities/StringUtil',
        'ui/AlertWindow'
    ], function (
        Backbone,
        _,
        $,
        IO,
        Device,
        CONFIG,
        Environment,
        i18n,
        log,
        StringUtil,
        AlertWindow
    ) {
        console.log('BackupRestoreService - File loaded.');

        var alert = window.alert;
        var BackupRestoreService = _.extend({}, Backbone.Events);

        // ---------------------------- consts -------------------------------

        BackupRestoreService.CONSTS = {
            ViewHeight : 360,
            ViewWidth : 520,
            ViewWidthTip : 380,

            DefaultSnapshot : {
                Base : 24 * 3600 * 1000,
                Size : 20
            },

            AllDataTypes : [1, 2, 3],

            ErrorCodeToMessage : {
                3 : i18n.new_backuprestore.SD_CARD_ERROR,
                4 : i18n.new_backuprestore.SD_CARD_ERROR,
                5 : i18n.new_backuprestore.SD_CARD_ERROR,
                6 : i18n.new_backuprestore.SD_CARD_ERROR,
                9 : i18n.new_backuprestore.SD_CARD_ERROR,
                400 : i18n.new_backuprestore.FILE_DOWNLOAD_ERROR,
                402 : i18n.new_backuprestore.CANCELED,
                412 : i18n.new_backuprestore.SD_CARD_ERROR,
                500 : i18n.new_backuprestore.RESTORE_CONNECTION_LOST,
                705 : i18n.new_backuprestore.COMPRASS_FILE_ERROR,
                707 : i18n.new_backuprestore.WRITE_LOCAL_FILE_ERROR,
                709 : i18n.new_backuprestore.ERROR_WHEN_WRITE_ROM,
                720 : i18n.new_backuprestore.RESTORE_INVLID_FILE,
                723 : i18n.new_backuprestore.BACKUP_RESTORE_RUNING,
                733 : i18n.new_backuprestore.BACKUP_TO_CLOUD_FAILED,
                735 : i18n.new_backuprestore.BACKUP_APP_DATA_ERROR_DEVICE_INCOMPATIBLE,
                736 : i18n.new_backuprestore.BACKUP_APP_DATA_ERROR_DEVICE_WIFI,
                737 : i18n.new_backuprestore.BACKUP_APP_DATA_ERROR_ENCRYPT,
                738 : i18n.new_backuprestore.BACKUP_APP_DATA_ERROR_CONNECT_ERROR,
                739 : i18n.new_backuprestore.USER_CANCELED,
                741 : i18n.new_backuprestore.CUSTOM_AUTH_FAILED_ERROR,
                742 : i18n.new_backuprestore.CUSTOM_SERVER_UNAVALABEL_ERROR,
                746 : i18n.new_backuprestore.CUSTOM_UNZIP_BACKUP_FILE_ERROR
            },

            // Copy from proto
            BR_STATUS : {
                READY : 1,
                RUNNING : 2,
                PAUSED : 3,
                STOPPED : 4,
                FINISHED : 5,
                ERROR : 6,
                ABORT : 7,
                PC_ZIP_ERROR : 8
            },

            BR_PI_STATUS : {
                WAITING : 0,
                READY : 1,
                RUNNING : 2,
                FINISHED : 3,
                ERROR : 4
            },

            SYNC_PROGRESS : {
                FAILED : 0,
                START : 1,
                RUNNING : 2,
                COMPLETED : 3
            }
        };

        BackupRestoreService.getLastBackupTimeAsync = function (type) {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.GET_LAST_BACKUP_TIME,
                data : {
                    type : type || 0
                },
                success : function (resp) {
                    if (resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        BackupRestoreService.getRemoteAutoBackupSwitchAsync = function () {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.SYNC_IS_SWITCH_ON,
                success : function (resp) {
                    if (resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        BackupRestoreService.setRemoteAutoBackupSwitchAsync = function (state) {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.SYNC_SET_SWITCH,
                data : state || {contact : 1, sms : 1, app : 1},
                success : function (resp) {
                    if (resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        BackupRestoreService.setLocalAutoBackupSwitchAsync = function (state) {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.SYNC_SET_LOCAL_SWITCH,
                data : state || {contact : 1, sms : 1, app : 1},
                success : function (resp) {
                    if (resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        BackupRestoreService.prepareBackupAsync = function () {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.BACKUP_PREPARE,
                success : function (resp) {
                    if (resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        BackupRestoreService.getSettingPathAsync = function () {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.BACKUP_GET_SETTING,
                success : function (resp) {
                    if (resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        BackupRestoreService.setSettingPathAsync = function (shouldChange) {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.BACKUP_SET_SETTING,
                data : {
                    should_change : shouldChange ? 1 : 0
                },
                success : function (resp) {
                    if (resp.state_code === 200 || resp.state_code === 402) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };


        BackupRestoreService.showAndRecordError = function (evt, resp, type, hide) {

            if (!hide) {
                alert(this.getErrorMessage(resp.state_code));
            }
            this.recordError(evt, resp, type);
        };

        BackupRestoreService.recordError = function (evt, resp, type) {
            log({
                'event' : evt,
                'state_code' : resp.state_code || -1,
                'state_line' : resp.state_line || '',
                'type' : type
            });
        };


        BackupRestoreService.backupStartNonAppsAsync = function (filePath, sessionID, brSpec) {
            var deferred = $.Deferred();

            IO.requestAsync({
                type : 'POST',
                url : CONFIG.actions.BACKUP_START + '?file_dir=' + encodeURIComponent(filePath) + '&session=' + sessionID,
                data : brSpec,
                success : function (resp) {
                    if (resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        BackupRestoreService.logBackupContextModel = function (context, isSuccess) {
            log({
                'event' : 'debug.backup.context.' + (isSuccess ? 'success' : 'failed'),
                'is_local' : context.isLocal,
                'data_id_list' : context.get('dataIDList').join(','),
                'appt_type' : context.get('appType'),
                'full_file_name' : context.fileFullPath,
                'sms_error_num' : context.get('smsErrorList').length,
                'contacts_error_num' : context.get('contactsErrorList').length,
                'app_error_num' : context.get('appErrorList').length,
                'product_id' : Device.get('productId'),
                'is_usb' : Device.get('isUSB')
            });
        };

        BackupRestoreService.logRestoreContextModel = function (context, isSuccess, backupFilelength, snapshotList) {
            log({
                'event' : 'restore.context.' + (isSuccess ? 'success' : 'failed'),
                'is_local' : context.isLocal,
                'backup_file_list' : backupFilelength || 0,
                'full_file_name' : context.get('fileName'),
                'data_id_list' : context.get('dataIDList').join(','),
                'udid' : context.get('udid'),
                'snapshot_list_num' : snapshotList || 0,
                'product_id' : Device.get('productId'),
                'is_usb' : Device.get('isUSB')
            });
        };

        BackupRestoreService.backupStartAppsAsync = function (exportDir, sessionID, fileType) {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.APP_EXPORT,
                data : {
                    export_dir : exportDir,
                    session : sessionID,
                    file_type : fileType,
                    source : "welcome_backup"
                },
                success : function (resp) {
                    if (resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        BackupRestoreService.backupCancelAsync = function (sessionID) {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.BACKUP_CANCEL,
                data : {
                    session : sessionID
                },
                success : function (resp) {
                    if (resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        BackupRestoreService.backupStartAppDataAsync = function (exportDir, sessionID) {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.APP_EXPORT_APP_DATA,
                data : {
                    export_dir : exportDir,
                    session : sessionID
                },
                success : function (resp) {
                    if (resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        BackupRestoreService.loadAppListAsync = function (packageNameList) {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.APP_SHOW,
                data : {
                    filter : 5,
                    package_name : _.pluck(packageNameList, 'item').join(",")
                },
                success : function (resp) {
                    if (resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        BackupRestoreService.backupFinishAsync = function (filePath) {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.BACKUP_FINISH,
                data : {
                    file_dir : filePath
                },
                success : function (resp) {
                    if (resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        BackupRestoreService.remoteManualBackupAsync = function (types, sessionID) {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.SYNC_MANUAL_BACKUP,
                data : {
                    types : types.join(','),
                    session : sessionID
                },
                success : function (resp) {
                    if (resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        BackupRestoreService.stopRemoteSyncAsync = function () {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.SYNC_STOP_REMOTE_SYNC,
                success : function (resp) {
                    if (resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        BackupRestoreService.showFileAsync = function (filePath) {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.SHOW_FILE,
                data : {
                    file_path : filePath
                },
                success : function (resp) {
                    if (resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        BackupRestoreService.checkLocalSwitchAsync = function () {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.IS_LOCAL_SWITCH_ON,
                success : function (resp) {
                    if (resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };


        BackupRestoreService.openWindowSettingsAsync = function () {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.WINDOW_OPEN_SETTING,
                data : {
                    select_index : 2
                },
                success : function (resp) {
                    if (resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        BackupRestoreService.selectRestoreFileAsync = function () {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.RESTORE_FILE_SELECT,
                success : function (resp) {
                    if (resp.state_code === 200 || resp.state_code === 402) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        BackupRestoreService.listRestoreFileAsync = function () {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.RESTORE_BACKUP_FILE,
                success : function (resp) {
                    if (resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        BackupRestoreService.syncContactAccountsAsync = function () {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.CONTACT_SYNCED_ACCOUNTS,
                success : function (resp) {
                    if (resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        BackupRestoreService.restoreStartAppsAsync = function (fileName, includeAppData) {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.RESTORE_APPS,
                data : {
                    file_name : fileName,
                    app_data : includeAppData ? 1 : 0
                },
                success : function (resp) {
                    if (resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        BackupRestoreService.restoreRetryAsync = function () {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.RESTORE_RETRY,
                success : function (resp) {
                    if (resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        BackupRestoreService.restoreResumeAsync = function (sessionID, dupSms, dupContacts) {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.RESTORE_RESUME,
                data : {
                    session : sessionID,
                    dup_sms : dupSms,
                    dup_contacts : dupContacts
                },
                success : function (resp) {
                    if (resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        BackupRestoreService.restoreCancelAsync = function (sessionID) {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.RESTORE_CANCEL,
                data : {
                    session : sessionID
                },
                success : function (resp) {
                    if (resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        BackupRestoreService.getServerTypeFromBRType = function (type) {
            switch (type) {
            case 1:
                return CONFIG.enums.BR_TYPE_CONTACT;
            case 2:
                return CONFIG.enums.BR_TYPE_SMS;
            case 3:
                return CONFIG.enums.BR_TYPE_APP;
            default:
                console.error(type);
                return -1;
            }
        };

        BackupRestoreService.checkFileAsync = function (filePath) {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.BACKUP_CHECK_FILE,
                data : {
                    file_dir : filePath
                },
                success : function (resp) {
                    var statusCode = parseInt(resp.body.value, 10);
                    var isStatusCodeOK = (statusCode === 0) || (statusCode === 1);
                    if (resp.state_code === 200 && isStatusCodeOK) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        BackupRestoreService.recordCurrentBackupAsync = function () {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.RECORD_CURRENT_BACKUP_TIME,
                success : function (resp) {
                    if (resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        BackupRestoreService.closeAllNotificationAsync = function () {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.CLOSE_ALL_NOTIFICATION,
                success : function (resp) {
                    if (resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        BackupRestoreService.closeAllNotificationInHelperAsync = function () {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.CLOSE_ALL_NOTIFICATION_HELPER,
                success : function (resp) {
                    if (resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        BackupRestoreService.closeAllNotificationAutoAsync = function (isHelper) {
            if (isHelper) {
                BackupRestoreService.closeAllNotificationInHelperAsync();
            } else {
                BackupRestoreService.closeAllNotificationAsync();
            }
        };

        BackupRestoreService.readRestoreFileAsync = function (fileName) {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.RESTORE_READ_FILE,
                data : {
                    file_name : fileName
                },
                success : function (resp) {
                    if (resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };


        BackupRestoreService.getTomorrowTime = function () {
            var date = new Date();
            date.setHours(24);
            date.setMinutes(0);
            date.setSeconds(0);
            return date.getTime();
        };

        BackupRestoreService.remoteSnapshotListAutoAsync = function (lastEntity) {
            var timestamp = (lastEntity === undefined) ? BackupRestoreService.getTomorrowTime() : lastEntity.timestamp - 1;
            var base = BackupRestoreService.CONSTS.DefaultSnapshot.Base;
            var size = BackupRestoreService.CONSTS.DefaultSnapshot.Size;
            return BackupRestoreService.remoteSnapshotListAsync(timestamp, base, size);
        };

        BackupRestoreService.remoteSnapshotListAsync = function (timestamp, base, size) {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.SYNC_SNAPSHOT_LIST,
                data : {
                    timestamp : timestamp,
                    base : base,
                    size : size
                },
                success : function (resp) {
                    if (resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        BackupRestoreService.remoteSnapshotInfoAllTypesAsync = function (version, udid) {
            return BackupRestoreService.remoteSnapshotInfoAsync(version, udid, BackupRestoreService.CONSTS.AllDataTypes);
        };

        BackupRestoreService.remoteSnapshotInfoAsync = function (version, udid, types) {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.SYNC_SNAPSHOT_INFO,
                data : {
                    version : version,
                    udid : udid,
                    types : types.join(',')
                },
                success : function (resp) {
                    if (resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        BackupRestoreService.remoteSnapshotFileAsync = function (version, udid, types, sessionID) {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.SYNC_SNAPSHOT_FILE,
                data : {
                    version : version,
                    udid : udid,
                    types : types.join(','),
                    session : sessionID
                },
                success : function (resp) {
                    if (resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };


        BackupRestoreService.restoreStartNonAppsAsync = function (fileName, sessionID, accountType, accountName, brSpec) {
            var deferred = $.Deferred();

            IO.requestAsync({
                type : 'POST',
                url : CONFIG.actions.RESTORE_START + '?file_name=' + encodeURIComponent(fileName) +
                                                     '&account_type=' + encodeURIComponent(accountType) +
                                                     '&account_name=' + encodeURIComponent(accountName) +
                                                     '&session=' + sessionID,
                data : brSpec,
                success : function (resp) {
                    if (resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };



        BackupRestoreService.restoreFinishAsync = function (fileName) {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.RESTORE_FINISH,
                data : {
                    file_name : fileName
                },
                success : function (resp) {
                    if (resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        BackupRestoreService.getBRTypeFromServerType = function (type) {
            switch (type) {
            case CONFIG.enums.BR_TYPE_CONTACT:
                return 1;
            case CONFIG.enums.BR_TYPE_SMS:
                return 2;
            case CONFIG.enums.BR_TYPE_APP:
                return 3;
            default:
                console.error(type);
                return -1;
            }
        };

        BackupRestoreService.GetBRTypeBy30x0x = function (dataType) {
            switch (Math.round(dataType / 100)) {
            case Math.round(CONFIG.enums.SYNC_DATA_TYPE_CONTACTS / 100):
                return CONFIG.enums.BR_TYPE_CONTACT;
            case Math.round(CONFIG.enums.SYNC_DATA_TYPE_SMS / 100):
                return CONFIG.enums.BR_TYPE_SMS;
            case Math.round(CONFIG.enums.SYNC_DATA_TYPE_APP / 100):
                return CONFIG.enums.BR_TYPE_APP;
            default:
                return -1;
            }
        };

        BackupRestoreService.FormatRestoreSnapshotList = function (timestamp) {
            var isSameDay = function (date1, date2) {
                return date1.getYear() === date2.getYear() &&
                       date1.getMonth() === date2.getMonth() &&
                       date1.getDate() === date2.getDate();
            };

            var formateDate = function (timestamp) {
                var date = new Date(timestamp);
                var today = new Date();
                var yesterday = new Date(today - (86400 * 1000));

                var dateStr = '';
                if (isSameDay(date, today)) {
                    dateStr = i18n.misc.TODAY;
                } else if (isSameDay(date, yesterday)) {
                    dateStr = i18n.misc.YESTODAY;
                } else {
                    if (Environment.get('locale') === CONFIG.enums.LOCALE_EN_US) {
                        dateStr = StringUtil.formatDate('MM / dd / yyyy', timestamp);
                    } else {
                        dateStr = StringUtil.formatDate('yyyy-MM-dd', timestamp);
                    }
                }

                var timeStr = date.toString().substr(16, 8);
                return dateStr + ' ' + timeStr;
            };

            return formateDate(timestamp);
        };

        BackupRestoreService.getErrorMessage = function (state_code) {
            var message = BackupRestoreService.CONSTS.ErrorCodeToMessage[state_code];
            message = message || (i18n.new_backuprestore.UNKNOW_ERROR + state_code);
            return message.toString();
        };

        BackupRestoreService.getAppDataCountAsync = function () {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.APP_GET_APP_DATA_COUNT,
                success : function (resp) {
                    if (resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        BackupRestoreService.getSupportAppDataAsync = function () {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.IS_SUPPORT_APP_DATA,
                success : function (resp) {
                    if (resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        BackupRestoreService.getIsWdapkReadyAsync = function () {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.APP_GET_IS_WDAPK_READY,
                success : function (resp) {
                    if (resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        BackupRestoreService.formatFileName = function (fileName) {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.FORMAT_BACKUP_FILE_NAME,
                data : {
                    file_name : fileName
                },
                success : function (resp) {
                    if (resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        return BackupRestoreService;
    });
}(this));
