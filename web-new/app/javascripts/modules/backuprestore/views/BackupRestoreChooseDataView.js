/*global define, console*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'Device',
        'FunctionSwitch',
        'Internationalization',
        'utilities/StringUtil',
        'Configuration',
        'LOG',
        'ui/Panel',
        'ui/PopupPanel',
        'ui/UIHelper',
        'ui/TemplateFactory',
        'ui/AlertWindow',
        'backuprestore/BackupRestoreService',
        'backuprestore/models/BackupContextModel',
        'backuprestore/models/RestoreContextModel'
    ], function (
        Backbone,
        _,
        doT,
        $,
        Device,
        FunctionSwitch,
        i18n,
        StringUtil,
        CONFIG,
        log,
        Panel,
        PopupPanel,
        UIHelper,
        TemplateFactory,
        AlertWindow,
        BackupRestoreService,
        BackupContextModel,
        RestoreContextModel
    ) {
        console.log('BackupRestoreChooseDataView - File loaded. ');

        var alert = window.alert;

        var BackupRestoreChooseDataBodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('backup', 'choose-backup-restore-data')),
            className : 'w-backup-restore-choose-data',
            initialize : function () {
                var dataList = [];
                var loading = true;
                Object.defineProperties(this, {
                    dataList : {
                        set : function (value) {
                            if (value instanceof Array) {
                                dataList = value;
                            }
                        },
                        get : function () {
                            return dataList;
                        }
                    },
                    loading : {
                        set : function (value) {
                            loading = Boolean(value).valueOf();
                            this.$('.loading').toggle(loading);
                        },
                        get : function () {
                            return loading;
                        }
                    }
                });

                Device.on('change:isUSB', this.setAppData, this);
            },
            render : function () {
                this.$el.html(this.template({
                    loading : this.loading,
                    list : this.dataList,
                    isBackup : this.options.isBackup
                }));

                var panel = new PopupPanel({
                    $content : $('<div>').width(200).html(i18n.backup_restore.BACKUP_APP_DATA_TIP),
                    $host : this.$('.app-data-tip-ctn'),
                    delay : true
                });
                panel.zero();

                // set data types in dataIdList as checked
                this.$('ul li input').prop({
                    checked : false
                });

                _.map(BackupContextModel.get('dataIDList'), function (item) {
                    var targetName = StringUtil.format('ul li input[value="{1}"]', item);
                    this.$(targetName).prop({
                        checked : true
                    });
                });

                this.$('ul li input:disabled').prop({
                    checked : false
                });

                if (FunctionSwitch.ENABLE_CLOUD_BACKUP_RESTORE) {
                    this.setAppData();
                }
                this.checkedChange();

                return this;
            },
            // ------------------------- backup -------------------------------
            prepareBackup : function () {
                this.loading = true;

                BackupRestoreService.prepareBackupAsync().done(function (resp) {
                    this.dataList = resp.body.item;
                    // don't support backup app data in cloud
                    if (BackupContextModel.IsLocal) {
                        this.dataList.push({
                            type : CONFIG.enums.BR_TYPE_APP_DATA,
                            count : 0
                        });
                    }

                    var dataNumList = {};
                    _.each(this.dataList, function (item) {
                        dataNumList[item.type] = item.count;
                    });

                    var count = BackupContextModel.get('dataNumList')[CONFIG.enums.BR_TYPE_APP_DATA];
                    if (count !== undefined) {
                        dataNumList[CONFIG.enums.BR_TYPE_APP_DATA] = count;
                    }
                    BackupContextModel.set('dataNumList', dataNumList);
                    this.loading = false;
                    this.render();
                    this.trigger('changed');
                }.bind(this)).fail(function (resp) {
                    this.prepareBackupFailed();
                }.bind(this));
            },
            prepareBackupFailed : function () {
                this.trigger('remove');
                alert(i18n.backup_restore.PERMISSION_TIP, function () {
                    this.trigger('timeout');
                }.bind(this));

                log({
                    'event' : 'debug.backup.progress.error',
                    'type' : 4
                });
            },
            refreshAppData : function (disabled) {
                this.$('input[value=10]').prop({
                    disabled : disabled
                });
            },
            setAppData : function () {
                if (!this.options.isBackup) {
                    return;
                }

                // support backup app data only in USB connect
                if (!Device.get('isUSB')) {
                    this.refreshAppData(true);
                    this.$('.count[data-value=10]').text(i18n.backup_restore.BACKUP_APP_DATA_NON_USB);
                    return;
                }

                // already got the count, use cache
                var count = BackupContextModel.get('dataNumList')[CONFIG.enums.BR_TYPE_APP_DATA];
                if (count !== undefined) {
                    if (count >= 0) {
                        this.refreshAppData(false);
                        this.$('.count[data-value=10]').text(count);
                    } else {
                        this.refreshAppData(true);
                        this.$('.count[data-value=10]').text(i18n.backup_restore.BACKUP_APP_DATA_UNSUPPORT);
                    }
                    return;
                }

                BackupRestoreService.getAppDataCountAsync().done(function (resp) {
                    this.refreshAppData(false);
                    this.$('.count[data-value=10]').text(resp.body.value);
                    BackupContextModel.get('dataNumList')[CONFIG.enums.BR_TYPE_APP_DATA] = parseInt(resp.body.value, 10);
                }.bind(this)).fail(function (resp) {
                    this.refreshAppData(true);
                    this.$('.count[data-value=10]').text(i18n.backup_restore.BACKUP_APP_DATA_UNSUPPORT);
                    BackupContextModel.get('dataNumList')[CONFIG.enums.BR_TYPE_APP_DATA] = -1;
                }.bind(this));
            },
            // ------------------------- restore ------------------------------
            fillInfoData : function (info) {
                var i;
                for (i in info) {
                    if (info.hasOwnProperty(i)) {
                        this.dataList.push({
                            type : parseInt(i, 10),
                            count : info[i]
                        });
                    }
                }

                this.loading = false;
                this.render();
                this.trigger('changed');
            },
            isCsvFile : function (fileName) {
                if (!fileName) {
                    return false;
                }

                var csvExt = ".csv";
                var index = fileName.lastIndexOf(".csv");
                return (index > 0) && (index + csvExt.length === fileName.length);
            },
            prepareRestoreLocal : function () {
                this.loading = true;

                var fileName = RestoreContextModel.get('fileName');
                var info = RestoreContextModel.get('backupFileInfoDict')[fileName];
                if (info !== undefined) {
                    this.fillInfoData(info);
                    return;
                }

                BackupRestoreService.readRestoreFileAsync(fileName).done(function (resp) {
                    var info = {};
                    _.each(resp.body.item, function (item) {
                        info[item.type] = item.count;
                    });

                    RestoreContextModel.get('backupFileInfoDict')[fileName] = info;
                    this.fillInfoData(info);
                }.bind(this)).fail(function (resp) {
                    var message;
                    if (this.isCsvFile(fileName)) {
                        message = i18n.backup_restore.RESTORE_INVLID_CONTACTS_FILE;
                    } else {
                        message = BackupRestoreService.getErrorMessage(resp.state_code);
                    }
                    alert(message, function () {
                        this.trigger('error');
                    }.bind(this));
                    BackupRestoreService.recordError('debug.restore.progress.error', resp.state_code, 5);
                    BackupRestoreService.logBackupContextModel(BackupContextModel, false);
                }.bind(this));
            },
            prepareRestoreRemote : function () {
                this.loading = true;

                var version = RestoreContextModel.get('remoteVersion');
                var info = RestoreContextModel.get('snapshotInfoDict')[version];
                if (info !== undefined) {
                    this.fillInfoData(info);
                    return;
                }

                BackupRestoreService.remoteSnapshotInfoAllTypesAsync(version).done(function (resp) {
                    var info = {};
                    _.each(JSON.parse(resp.body.value), function (item) {
                        var brType = BackupRestoreService.getServerTypeFromBRType(item.type);
                        info[brType] = item.count;
                    });

                    RestoreContextModel.get('snapshotInfoDict')[version] = info;
                    this.fillInfoData(info);
                }.bind(this)).fail(function (resp) {
                    var message = BackupRestoreService.getErrorMessage(resp.state_code);
                    alert(message, function () {
                        this.trigger('error');
                    }.bind(this));
                    BackupRestoreService.recordError('debug.restore.progress.error', resp, 6);
                    BackupRestoreService.logBackupContextModel(BackupContextModel, false);
                }.bind(this));
            },
            // ------------------------- common -------------------------------
            resetData : function () {
                this.loading = true;
                this.dataList = [];
                this.render();
            },
            setData : function (targetModel) {
                var $checkedRadio = this.$('input[name="type"]:checked:enabled');
                targetModel.set({
                    dataIDList : _.map($checkedRadio, function (item) {
                        return parseInt(item.value, 10);
                    })
                });
            },
            checkedChange : function () {
                this.trigger('changed');
            },
            appCheckedChange : function (evt) {
                // uncheck app data if app is unchecked
                if (!evt.originalEvent.srcElement.checked) {
                    this.$('input[value="10"]').prop({
                        checked : false
                    });
                }
                this.trigger('changed');
            },
            appDataCheckedChange : function (evt) {
                // check app if app data is checked
                if (evt.originalEvent.srcElement.checked) {
                    this.$('input[value="8"]').prop({
                        checked : true
                    });
                }
                this.trigger('changed');
            },
            isCheckedNone : function () {
                var $checkedRadio = this.$('input[name="type"]:checked');
                return $checkedRadio.length === 0;
            },
            events : {
                'change input[name="type"]' : 'checkedChange',
                'change input[value="8"]' : 'appCheckedChange',
                'change input[value="10"]' : 'appDataCheckedChange'
            }
        });

        var bodyView;

        var BackupRestoreChooseDataView = Panel.extend({
            initialize : function () {
                BackupRestoreChooseDataView.__super__.initialize.apply(this, arguments);

                this.on(UIHelper.EventsMapping.SHOW, function () {
                    bodyView = new BackupRestoreChooseDataBodyView({
                        isBackup : this.options.isBackup
                    });
                    this.$bodyContent = bodyView.render().$el;
                    this.setViewTitle();
                    this.center();

                    bodyView.on('changed', function () {
                        this.$('.button-next').prop({
                            disabled : bodyView.isCheckedNone()
                        });
                    }, this);

                    bodyView.on('timeout', function () {
                        this.trigger('_TIME_OUT');
                    }, this);

                    bodyView.on('remove', function () {
                        this.remove();
                    }, this);

                    bodyView.on('error', function () {
                        this.trigger('_LAST_STEP');
                    }, this);

                    if (this.options.isBackup) {
                        var word = BackupContextModel.IsLocal ? i18n.ui.NEXT : i18n.backup_restore.START_BACKUP;
                        this.$('.button-next').html(word);
                        bodyView.prepareBackup();
                    } else {
                        if (RestoreContextModel.IsLocal) {
                            bodyView.prepareRestoreLocal();
                        } else {
                            bodyView.prepareRestoreRemote();
                        }
                    }
                }, this);

                this.on(UIHelper.EventsMapping.REMOVE, function () {
                    bodyView.resetData();
                });

                var buttonWord = this.options.isBackup ? i18n.ui.NEXT : i18n.backup_restore.START_RESTORE;
                this.buttons = [{
                    $button : $('<button>').html(buttonWord).addClass('button-next primary'),
                    eventName : 'button_next'
                }, {
                    $button : $('<button>').html(i18n.ui.CANCEL).addClass('button-cancel'),
                    eventName : 'button_cancel'
                }];
            },
            render : function () {
                _.extend(this.events, BackupRestoreChooseDataView.__super__.events);
                this.delegateEvents();
                BackupRestoreChooseDataView.__super__.render.apply(this, arguments);

                if (FunctionSwitch.ENABLE_CLOUD_BACKUP_RESTORE) {
                    var $buttonLast = $('<button>').html(i18n.ui.PREV).addClass('button-last');
                    this.$('.w-ui-window-footer-monitor').append($buttonLast);
                }

                this.$('.button-next').prop({
                    disabled : true
                });

                return this;
            },
            setViewTitle : function (is_local) {
                if (this.options.isBackup) {
                    this.title = BackupContextModel.IsLocal ? i18n.backup_restore.BACKUP_TITLE_LOCAL : i18n.backup_restore.BACKUP_TITLE_REMOTE;
                    this.$('.title').text(i18n.backup_restore.CHOOSE_BACKUP_DATA_TIP);
                } else {
                    this.title = RestoreContextModel.IsLocal ? i18n.backup_restore.RESTORE_TITLE_LOCAL : i18n.backup_restore.RESTORE_TITLE_REMOTE;
                    this.$('.title').text(i18n.backup_restore.CHOOSE_RESTORE_DATA_TIP);
                }
            },
            clickButtonLast : function () {
                bodyView.setData(this.options.isBackup ? BackupContextModel : RestoreContextModel);
                this.trigger('_LAST_STEP');
            },
            clickButtonNext : function () {
                bodyView.setData(this.options.isBackup ? BackupContextModel : RestoreContextModel);
                this.trigger('_NEXT_STEP');
            },
            events : {
                'click .button-last' : 'clickButtonLast',
                'click .button-next' : 'clickButtonNext'
            }
        });

        var chooseBackupDataView;
        var chooseLocalRestoreDataView;
        var chooseRemoteRestoreDataView;

        var factory = _.extend({
            getBackupInstance : function () {
                if (!chooseBackupDataView) {
                    chooseBackupDataView = new BackupRestoreChooseDataView({
                        title : i18n.backup_restore.BACKUP_TITLE,
                        disableX : true,
                        height : BackupRestoreService.CONSTS.ViewHeight,
                        width : BackupRestoreService.CONSTS.ViewWidth,
                        isBackup : true
                    });
                }
                return chooseBackupDataView;
            },
            getRestoreLocalInstance : function () {
                if (!chooseLocalRestoreDataView) {
                    chooseLocalRestoreDataView = new BackupRestoreChooseDataView({
                        title : i18n.backup_restore.RESTORE_TITLE,
                        disableX : true,
                        height : BackupRestoreService.CONSTS.ViewHeight,
                        width : BackupRestoreService.CONSTS.ViewWidth,
                        isBackup : false
                    });
                }
                return chooseLocalRestoreDataView;
            },
            getRestoreRemoteInstance : function () {
                if (!chooseRemoteRestoreDataView) {
                    chooseRemoteRestoreDataView = new BackupRestoreChooseDataView({
                        title : i18n.backup_restore.RESTORE_TITLE,
                        disableX : true,
                        height : BackupRestoreService.CONSTS.ViewHeight,
                        width : BackupRestoreService.CONSTS.ViewWidth,
                        isBackup : false
                    });
                }
                return chooseRemoteRestoreDataView;
            }
        });

        return factory;
    });
}(this));
