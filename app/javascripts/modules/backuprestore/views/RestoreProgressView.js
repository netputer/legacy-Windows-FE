/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'Device',
        'Internationalization',
        'Configuration',
        'Log',
        'ui/Panel',
        'ui/UIHelper',
        'ui/TemplateFactory',
        'ui/AlertWindow',
        'utilities/StringUtil',
        'IO',
        'contact/collections/ContactsCollection',
        'message/collections/ConversationsCollection',
        'backuprestore/BackupRestoreService',
        'backuprestore/models/RestoreContextModel'
    ], function (
        Backbone,
        _,
        doT,
        $,
        Device,
        i18n,
        CONFIG,
        log,
        Panel,
        UIHelper,
        TemplateFactory,
        AlertWindow,
        StringUtil,
        IO,
        ContactsCollection,
        ConversationsCollection,
        BackupRestoreService,
        RestoreContextModel
    ) {
        console.log('RestoreProgressView - File loaded. ');

        var alert = window.alert;

        var RestoreProgressBodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('restore', 'resotre-progress')),
            className : 'w-restore-progress',
            render : function () {
                this.$el.html(this.template({}));
                this.resetContent();
                return this;
            },
            resetContent : function () {
                this.$('.title').text(i18n.backup_restore.RESTORING_TIP);
                this.$('.progress-ctn').html('');
            }
        });

        var bodyView;

        var restoreSessionID = '';
        var restoreHandler;

        var BR_ERROR_ITEM_FIELD = {
            1 : 'contact',
            3 : 'sms',
            5 : 'call_log'
        };

        var RestoreProgressView = Panel.extend({
            initialize : function () {
                RestoreProgressView.__super__.initialize.apply(this, arguments);

                this.on(UIHelper.EventsMapping.SHOW, function () {
                    bodyView = new RestoreProgressBodyView();
                    this.$bodyContent = bodyView.render().$el;
                    this.setViewTitle();
                    this.center();

                    // start restore
                    if (RestoreContextModel.IsLocal) {
                        this.startRestoreSmsAndContact();
                    } else {
                        this.startDownloadFilesRemote();
                    }
                }, this);

                this.buttons = [{
                    $button : $('<button>').html(i18n.ui.CONTINUE).addClass('button-next primary'),
                    eventName : 'button_cancel'
                }, {
                    $button : $('<button>').html(i18n.ui.CANCEL).addClass('button-cancel'),
                    eventName : 'button_cancel'
                }];
            },
            render : function () {
                _.extend(this.events, RestoreProgressView.__super__.events);
                this.delegateEvents();
                RestoreProgressView.__super__.render.apply(this, arguments);

                if (bodyView !== undefined) {
                    bodyView.resetContent();
                }

                this.setButtnState(true);

                return this;
            },
            setViewTitle : function () {
                this.title = RestoreContextModel.IsLocal ? i18n.backup_restore.RESTORE_TITLE_LOCAL : i18n.backup_restore.RESTORE_TITLE_REMOTE;
            },
            setButtnState : function (in_progress) {
                this.$('.button-next').html(RestoreContextModel.IsAppSelected ? i18n.ui.CONTINUE : i18n.ui.FINISH);
                this.$('.button-next').toggle(!in_progress);
                this.$('.button-cancel').toggle(in_progress);
            },
            startDownloadFilesRemote : function () {
                this.$('.title').text(i18n.backup_restore.RESTORE_DOWNLOAD_PROGRESSING);

                var sessionID = _.uniqueId('restore.download_file_');
                var version = RestoreContextModel.get('remoteVersion');
                var udid = RestoreContextModel.get('udid');
                var types = RestoreContextModel.GetServerTypes;

                log({ 'event' : 'debug.restore.remote.download.start' });
                BackupRestoreService.remoteSnapshotFileAsync(version, udid, types, sessionID).done(function (resp) {
                    RestoreContextModel.set('fileName', resp.body.value);
                    if (RestoreContextModel.IsNoneAppSelected) {
                        this.startRestoreSmsAndContact();
                    } else {
                        this.startRestoreApps();
                        this.trigger('_NEXT_STEP');
                    }

                    log({ 'event' : 'debug.restore.remote.download.success' });
                    BackupRestoreService.logRestoreContextModel(RestoreContextModel, true);
                }.bind(this)).fail(function (resp) {
                    this.remove();
                    log({ 'event' : 'debug.restore.remote.download.failed' });
                    BackupRestoreService.showAndRecordError('debug.restore.progress.error', resp, 0);
                    BackupRestoreService.logRestoreContextModel(RestoreContextModel, false);
                }.bind(this));
            },
            startRestoreSmsAndContact : function () {
                if (!RestoreContextModel.IsNoneAppSelected) {
                    // only apps selected, skip sms & contacts
                    this.startRestoreApps();
                    this.restoreAllFinish();
                    return;
                }

                restoreSessionID = _.uniqueId('restore.nonapps_');
                var filePath = RestoreContextModel.get('fileName');
                var accountType = RestoreContextModel.get('accountType');
                var accountName = RestoreContextModel.get('accountName');
                var brSpec = RestoreContextModel.GetBRSpec;

                this.initProgressItems(brSpec);

                BackupRestoreService.restoreStartNonAppsAsync(filePath, restoreSessionID, accountType, accountName, brSpec).done(function (resp) {
                    RestoreContextModel.set('appPath', resp.body.value);
                }.bind(this)).fail(function (resp) {
                    this.remove();
                    BackupRestoreService.showAndRecordError('debug.restore.progress.error', resp, 1);
                    BackupRestoreService.logRestoreContextModel(RestoreContextModel, false);
                }.bind(this));

                // sms duplicate number
                IO.Backend.Device.onmessage({
                    'data.channel' : restoreSessionID + 'sms'
                }, function (data) {
                    var smsDupCount = parseInt(data, 10);
                    this.updateItemDuplicate(CONFIG.enums.BR_TYPE_SMS, smsDupCount);
                    RestoreContextModel.set('smsDupCount', smsDupCount);
                }, this);

                // contacts duplicate number
                IO.Backend.Device.onmessage({
                    'data.channel' : restoreSessionID + 'contacts'
                }, function (data) {
                    var contactsDupCount = parseInt(data, 10);
                    this.updateItemDuplicate(CONFIG.enums.BR_TYPE_CONTACT, contactsDupCount);
                    RestoreContextModel.set('contactsDupCount', contactsDupCount);
                }, this);

                // restore progress
                restoreHandler = IO.Backend.Device.onmessage({
                    'data.channel' : restoreSessionID
                }, function (data) {
                    this.handleProgress(data);
                }, this);
            },
            handleProgress : function (progress) {
                switch (progress.status) {
                case BackupRestoreService.CONSTS.BR_STATUS.RUNNING:
                case BackupRestoreService.CONSTS.BR_STATUS.PAUSED:
                    this.updateNonAppItems(progress.item);
                    break;
                case BackupRestoreService.CONSTS.BR_STATUS.FINISHED:
                    this.updateNonAppItems(progress.item);

                    IO.Backend.Device.offmessage(restoreHandler);

                    // continue to restore apps
                    this.startRestoreApps();
                    this.restoreAllFinish();

                    // sync again to fetch new data
                    ContactsCollection.getInstance().syncAsync();
                    ConversationsCollection.getInstance().trigger('update');

                    if (!RestoreContextModel.IsNoneAppSelected) {
                        this.trigger('_NEXT_STEP');
                    }
                    break;
                case BackupRestoreService.CONSTS.BR_STATUS.ERROR:
                    this.updateNonAppItems(progress.item);
                    this.showErrorItem(progress);
                    break;
                case BackupRestoreService.CONSTS.BR_STATUS.READY:
                case BackupRestoreService.CONSTS.BR_STATUS.STOPPED:
                    break;
                case BackupRestoreService.CONSTS.BR_STATUS.ABORT:
                    this.remove();
                    alert(i18n.backup_restore.RESTORE_ABORT_TIP);
                    BackupRestoreService.logRestoreContextModel(RestoreContextModel, false);
                    break;
                default:
                    this.remove();
                    alert(i18n.backup_restore.RESTORE_FAILED_TIP + progress.status);
                    BackupRestoreService.logRestoreContextModel(RestoreContextModel, false);
                    break;
                }
            },
            showErrorItem : function (progress) {
                if (!progress.error_item || progress.error_item.length === 0) {
                    this.remove();
                    alert(i18n.backup_restore.RESTORE_FAILED_TIP + progress.status);
                    BackupRestoreService.logRestoreContextModel(RestoreContextModel, false);
                    return;
                }

                var errorItem = progress.error_item[0];
                var list = errorItem[BR_ERROR_ITEM_FIELD[errorItem.type]];
                RestoreContextModel.set('errorItemList', list);

                switch (errorItem.type) {
                case CONFIG.enums.BR_TYPE_CONTACT:
                    this.trigger('_CONTACT_ERROR_LIST');
                    break;
                case CONFIG.enums.BR_TYPE_SMS:
                    this.trigger('_SMS_ERROR_LIST');
                    break;
                default:
                    this.remove();
                    alert(i18n.backup_restore.RESTORE_FAILED_TIP + progress.status);
                    BackupRestoreService.logRestoreContextModel(RestoreContextModel, false);
                    break;
                }
            },
            retryRestore : function () {
                BackupRestoreService.restoreRetryAsync(restoreSessionID).done(function (resp) {
                    var progress = resp.body;
                    // retry success, can resume
                    if (progress.status === BackupRestoreService.CONSTS.BR_STATUS.PAUSED) {
                        this.resumeRestore();
                    } else {
                        this.handleProgress(progress);
                    }
                }.bind(this)).fail(function (resp) {
                    this.remove();
                    BackupRestoreService.showAndRecordError('debug.restore.progress.error', resp, 3);
                    BackupRestoreService.logRestoreContextModel(RestoreContextModel, false);
                }.bind(this));
            },
            resumeRestore : function () {
                BackupRestoreService.restoreResumeAsync(restoreSessionID,
                                                        RestoreContextModel.get('smsDupCount'),
                                                        RestoreContextModel.get('contactsDupCount')).fail(function (resp) {
                    this.remove();
                    BackupRestoreService.showAndRecordError('debug.restore.progress.error', resp, 4);
                    BackupRestoreService.logRestoreContextModel(RestoreContextModel, false);
                }.bind(this));
            },
            updateNonAppItems : function (items) {
                var i;
                var item;
                for (i in items) {
                    if (items.hasOwnProperty(i)) {
                        item = items[i];
                        if (i === 0 || item.status !== BackupRestoreService.CONSTS.BR_PI_STATUS.READY) {
                            this.updateItem(item.type, item.status, item.finished_count, item.all_count);
                        }
                    }
                }
            },
            initProgressItems : function (brSpec) {
                _.each(brSpec.item, function (item) {
                    this.updateItem(item.type, BackupRestoreService.CONSTS.BR_PI_STATUS.WAITING, 0, item.count, '');
                }, this);
            },
            findOrCreateProgressItem : function (type) {
                var className = 'progress-item-' + type;
                var $item = this.$('.' + className);
                if ($item.length === 0) {
                    // create a new item node
                    var templateStr = doT.template(TemplateFactory.get('backup', 'backup-progress-item'))({});
                    $item = $('<div>').html(templateStr);
                    $item.addClass(className).addClass('item hbox');
                    $item.find('.icon-ctn').addClass('icon-type-' + type);

                    this.$('.progress-ctn').append($item);
                }
                return $item;
            },
            updateItemDuplicate : function (type, dupCount) {
                if (dupCount <= 0) {
                    return;
                }

                var $item = this.findOrCreateProgressItem(type);
                var content = '';
                if (type === CONFIG.enums.BR_TYPE_CONTACT) {
                    content = StringUtil.format(i18n.contact.DUPLICATE, dupCount);
                } else if (type === CONFIG.enums.BR_TYPE_SMS) {
                    content = StringUtil.format(i18n.message.DUPLICATE, dupCount);
                }
                $item.find('.progress-dup').text(content);
            },
            updateItem : function (type, status, currentValue, maxValue) {
                var $item = this.findOrCreateProgressItem(type);

                var pattern;
                switch (status) {
                case BackupRestoreService.CONSTS.BR_PI_STATUS.WAITING:
                    pattern = i18n.backup_restore.RESTORE_WAITING;
                    break;
                case BackupRestoreService.CONSTS.BR_PI_STATUS.FINISHED:
                    pattern = i18n.backup_restore.RESTORE_FINISH;
                    break;
                case BackupRestoreService.CONSTS.BR_PI_STATUS.ERROR:
                    $item.addClass('error');
                    pattern = i18n.backup_restore.RESTORE_FAILED;
                    break;
                default:
                    pattern = i18n.backup_restore.RESTORE_PROCESS;
                    break;
                }
                var desc = StringUtil.format(pattern, i18n.backup_restore.BR_TYPE_WORD_ENUM[type]);
                $item.find('.progress-desc').text(desc);

                var num_str = StringUtil.format('{1} / {2}', currentValue, maxValue);
                $item.find('.progress-num').text(num_str);
                $item.find('progress').prop({
                    max : maxValue,
                    value : currentValue
                });
            },
            startRestoreApps : function () {
                if (!RestoreContextModel.IsAppSelected && !RestoreContextModel.IsAppDataSelected) {
                    return;
                }

                // apps will be installed in task manager, so we don't care the progress here
                var filePath = RestoreContextModel.get('fileName');
                BackupRestoreService.restoreStartAppsAsync(filePath, RestoreContextModel.IsAppDataSelected).fail(function (resp) {
                    BackupRestoreService.showAndRecordError('debug.restore.progress.error', resp, 7);
                    BackupRestoreService.logRestoreContextModel(RestoreContextModel, false);
                });
            },
            restoreAllFinish : function () {
                BackupRestoreService.restoreFinishAsync(RestoreContextModel.get('fileName')).done(function (resp) {
                    this.$('.title').text(i18n.backup_restore.RESTORE_FINISH_LABEL);
                    this.setButtnState(false);

                    BackupRestoreService.logRestoreContextModel(RestoreContextModel, true);
                }.bind(this)).fail(function (resp) {
                    console.log(resp);

                    this.remove();
                    BackupRestoreService.showAndRecordError('debug.restore.progress.error', resp, 2);
                    BackupRestoreService.logRestoreContextModel(RestoreContextModel, false);
                }.bind(this));
            },
            clickButtonNext : function () {
                this.trigger('_NEXT_STEP');
            },
            clickButtonCancel : function () {
                if (restoreHandler) {
                    IO.Backend.Device.offmessage(restoreHandler);
                }

                BackupRestoreService.restoreCancelAsync(restoreSessionID);
                alert(i18n.backup_restore.CANCELED);
            },
            events : {
                'click .button-next' : 'clickButtonNext',
                'click .button-cancel' : 'clickButtonCancel'
            }
        });

        var restoreProgressView;

        var factory = _.extend({
            getInstance : function () {
                if (!restoreProgressView) {
                    restoreProgressView = new RestoreProgressView({
                        title : i18n.backup_restore.RESTORE_TITLE,
                        disableX : true,
                        height : BackupRestoreService.CONSTS.ViewHeight,
                        width : BackupRestoreService.CONSTS.ViewWidth
                    });
                }
                return restoreProgressView;
            }
        });

        return factory;
    });
}(this));
