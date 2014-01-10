/*global define, console*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'Device',
        'Internationalization',
        'ui/Panel',
        'ui/AlertWindow',
        'ui/UIHelper',
        'ui/TemplateFactory',
        'backuprestore/models/RestoreContextModel',
        'backuprestore/BackupRestoreService'
    ], function (
        Backbone,
        _,
        doT,
        $,
        Device,
        i18n,
        Panel,
        AlertWindow,
        UIHelper,
        TemplateFactory,
        RestoreContextModel,
        BackupRestoreService
    ) {
        console.log('RestoreSelectFileFolderView - File loaded. ');

        var alert = window.alert;

        var ChooseRestoreFileBodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('restore', 'select-file-folder')),
            className : 'w-restore-select-file-folder',
            render : function () {
                this.$el.html(this.template({}));
                return this;
            }
        });

        var bodyView;

        var RestoreSelectFileFolderView = Panel.extend({
            initialize : function () {
                RestoreSelectFileFolderView.__super__.initialize.apply(this, arguments);

                this.on(UIHelper.EventsMapping.SHOW, function () {
                    bodyView = new ChooseRestoreFileBodyView();
                    this.$bodyContent = bodyView.render().$el;
                    this.center();
                }, this);

                this.buttons = [{
                    $button : $('<button>').html(i18n.backup_restore.SELECT_BACKUP_FILE_FOLDER).addClass('button-select-folder'),
                    eventName : 'button_select_folder'
                }, {
                    $button : $('<button>').html(i18n.backup_restore.SELECT_BACKUP_FILE).addClass('button-select-file primary'),
                    eventName : 'button_select_file'
                }, {
                    $button : $('<button>').html(i18n.ui.CANCEL),
                    eventName : 'button_cancel'
                }];
            },
            clickButtonSelectFolder : function () {
                BackupRestoreService.setSettingPathAsync(true).done(function (resp) {
                    // user canceled
                    if (resp.state_code === 402) {
                        return;
                    }

                    this.trigger('_SELECT_FOLDER');
                }.bind(this)).fail(function () {
                    alert(i18n.backup_restore.SET_FILE_PATH_FAILED);
                });
            },
            clickButtonSelectFile : function () {
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
                this.trigger('_NEXT_STEP');
            },
            events : {
                'click .button-select-folder' : 'clickButtonSelectFolder',
                'click .button-select-file' : 'clickButtonSelectFile'
            }
        });

        var restoreSelectFileFolderView;

        var factory = _.extend({
            getInstance : function () {
                if (!restoreSelectFileFolderView) {
                    restoreSelectFileFolderView = new RestoreSelectFileFolderView({
                        title : i18n.backup_restore.RESTORE_TITLE_LOCAL,
                        disableX : true,
                        width : BackupRestoreService.CONSTS.ViewWidth
                    });
                }
                return restoreSelectFileFolderView;
            }
        });

        return factory;
    });
}(this));
