/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'Internationalization',
        'Configuration',
        'ui/Panel',
        'ui/PopupPanel',
        'ui/UIHelper',
        'ui/AlertWindow',
        'ui/TemplateFactory',
        'utilities/StringUtil',
        'FunctionSwitch',
        'backuprestore/BackupRestoreService',
        'backuprestore/models/RestoreContextModel'
    ], function (
        Backbone,
        _,
        doT,
        $,
        i18n,
        CONFIG,
        Panel,
        PopupPanel,
        UIHelper,
        AlertWindow,
        TemplateFactory,
        StringUtil,
        FunctionSwitch,
        BackupRestoreService,
        RestoreContextModel
    ) {
        console.log('RestoreChooseFileView - File loaded. ');

        var alert = window.alert;

        var RestoreChooseFileBodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('restore', 'choose-restore-file')),
            className : 'w-restore-choose-file',
            initialize : function () {
            },
            render : function () {
                this.$el.html(this.template({
                    list : RestoreContextModel.FileList
                }));

                // select the one last time user selected, or the first one
                var index = Math.max(RestoreContextModel.SelectedFileIndex, 0);
                var $itemList = this.$('input[name="file"]');
                if ($itemList.length > 0) {
                    $itemList[index].checked = true;
                }

                // pop up panel
                new PopupPanel({
                    $content : doT.template(TemplateFactory.get('restore', 'old-version-tip')),
                    $host : this.$('.old-version-tip'),
                    delay : true
                });

                return this;
            },
            setBackupFile : function () {
                var $checked_radio = this.$('input[name="file"]:checked');
                RestoreContextModel.set({
                    fileName : $checked_radio.attr('value')
                });
            },
            readSinlgeFileInfo : function (file_name, i) {
                BackupRestoreService.readRestoreFileAsync(file_name).done(function (resp) {
                    var info = {};
                    _.each(resp.body.item, function (item) {
                        info[item.type] = item.count;
                    });

                    RestoreContextModel.get('backupFileInfoDict')[file_name] = info;
                    this.fillItemInfo(info, i);
                }.bind(this));
            },
            readRestoreFileInfo : function () {
                var i;
                var file_name;
                var info;
                for (i in RestoreContextModel.FileList) {
                    if (RestoreContextModel.FileList.hasOwnProperty(i)) {
                        file_name = RestoreContextModel.FileList[i].file_name;
                        info = RestoreContextModel.get('backupFileInfoDict')[file_name];
                        if (info === undefined) {
                            this.readSinlgeFileInfo(file_name, i);
                        } else {
                            this.fillItemInfo(info, i);
                        }
                    }
                }
            },
            fillItemInfo : function (info, i) {
                var pattern = StringUtil.format('li:nth-child({1})', parseInt(i, 10) + 1);
                var $item = this.$(pattern);
                $item.find('.contact-number').html(info[CONFIG.enums.BR_TYPE_CONTACT] || '0');
                $item.find('.sms-number').html(info[CONFIG.enums.BR_TYPE_SMS] || '0');
                $item.find('.app-number').html(info[CONFIG.enums.BR_TYPE_APP] || '0');
            }
        });

        var bodyView;

        var RestoreChooseFileView = Panel.extend({
            initialize : function () {
                RestoreChooseFileView.__super__.initialize.apply(this, arguments);

                this.on(UIHelper.EventsMapping.SHOW, function () {
                    bodyView = new RestoreChooseFileBodyView();
                    this.$bodyContent = bodyView.render().$el;
                    bodyView.readRestoreFileInfo();
                    this.center();
                }, this);

                this.buttons = [{
                    $button : $('<button>').html(i18n.ui.NEXT).addClass('button-next primary'),
                    eventName : 'button_next'
                }, {
                    $button : $('<button>').html(i18n.ui.CANCEL),
                    eventName : 'button_cancel'
                }];
            },
            render : function () {
                _.extend(this.events, RestoreChooseFileView.__super__.events);
                this.delegateEvents();
                RestoreChooseFileView.__super__.render.apply(this, arguments);

                if (FunctionSwitch.ENABLE_CLOUD_BACKUP_RESTORE) {
                    var $buttonLast = $('<button>').html(i18n.ui.PREV).addClass('button-last');
                    this.$('.w-ui-window-footer-monitor').append($buttonLast);
                }

                return this;
            },
            clickButtonLast : function () {
                this.trigger('_LAST_STEP');
            },
            clickButtonNext : function () {
                bodyView.setBackupFile();
                this.trigger('_NEXT_STEP');
            },
            clickButtonSelectFile : function () {
                // disable the button for 2 seconds
                var $btn = this.$('.button-select-file').prop('disabled', true);
                setTimeout(function () {
                    $btn.prop('disabled', false);
                }, 2000);

                BackupRestoreService.selectRestoreFileAsync().done(function (resp) {
                    // user canceled
                    if (resp.state_code === 402) {
                        return;
                    }

                    RestoreContextModel.set('fileName', resp.body.value);
                    this.trigger('_SELECT_FILE');
                }.bind(this)).fail(function () {
                    alert(i18n.backup_restore.SET_RESTORE_FILE_FAILED);
                });
            },
            events : {
                'click .button-select-file' : 'clickButtonSelectFile',
                'click .button-last' : 'clickButtonLast',
                'click .button-next' : 'clickButtonNext'
            }
        });

        var restoreChooseFileView;

        var factory = _.extend({
            getInstance : function () {
                if (!restoreChooseFileView) {
                    restoreChooseFileView = new RestoreChooseFileView({
                        title : i18n.backup_restore.RESTORE_TITLE_LOCAL,
                        disableX : true,
                        height : BackupRestoreService.CONSTS.ViewHeight,
                        width : BackupRestoreService.CONSTS.ViewWidth
                    });
                }
                return restoreChooseFileView;
            }
        });

        return factory;
    });
}(this));
