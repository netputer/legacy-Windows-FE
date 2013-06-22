/*global define, console*/
(function (window, undefined) {
    define([
        'backbone',
        'underscore',
        'doT',
        'Device',
        'Internationalization',
        'ui/Panel',
        'ui/UIHelper',
        'ui/TemplateFactory',
        'backuprestore/BackupRestoreService',
        'backuprestore/models/BackupContextModel',
        'backuprestore/models/RestoreContextModel'
    ], function (
        Backbone,
        _,
        doT,
        $,
        i18n,
        Panel,
        UIHelper,
        TemplateFactory,
        BackupRestoreService,
        BackupContextModel,
        RestoreContextModel
    ) {
        console.log('BackupRestoreChooseTypeView - File loaded. ');

        var BackupRestoreChooseTypeBodyView = Backbone.View.extend({
            className : 'w-backup-choose-type',
            initialize : function () {
            },
            render : function () {
                this.$el.html(this.template({}));
                return this;
            },
            nextStep : function (type) {
                var model = this.options.isBackup ? BackupContextModel : RestoreContextModel;
                model.set({
                    backupType : type
                });
                this.trigger('next');
            },
            clickButtonLocal : function () {
                this.nextStep(0);
            },
            clickButtonRemote : function () {
                this.nextStep(1);
            },
            events : {
                'click .button-local' : 'clickButtonLocal',
                'click .button-remote' : 'clickButtonRemote'
            }
        });

        var bodyView;

        var BackupRestoreChooseTypeView = Panel.extend({
            initialize : function () {
                BackupRestoreChooseTypeView.__super__.initialize.apply(this, arguments);

                this.on(UIHelper.EventsMapping.SHOW, function () {
                    bodyView = new BackupRestoreChooseTypeBodyView({
                        isBackup : this.options.isBackup
                    });
                    bodyView.template = this.options.bodyViewTemplate;

                    bodyView.on('next', function () {
                        this.trigger('_NEXT_STEP');
                    }, this);

                    this.$bodyContent = bodyView.render().$el;
                    this.center();
                }, this);
            }
        });

        var chooseBackupTypeView;
        var chooseRestoreTypeView;

        var factory = _.extend({
            getBackupInstance : function () {
                if (!chooseBackupTypeView) {
                    chooseBackupTypeView = new BackupRestoreChooseTypeView({
                        title : i18n.backup_restore.BACKUP_TITLE,
                        height : BackupRestoreService.CONSTS.ViewHeight,
                        width : BackupRestoreService.CONSTS.ViewWidth,
                        bodyViewTemplate : doT.template(TemplateFactory.get('backup', 'choose-backup-type')),
                        isBackup : true
                    });
                }
                return chooseBackupTypeView;
            },
            getRestoreInstance : function () {
                if (!chooseRestoreTypeView) {
                    chooseRestoreTypeView = new BackupRestoreChooseTypeView({
                        title : i18n.backup_restore.RESTORE_TITLE,
                        height : BackupRestoreService.CONSTS.ViewHeight,
                        width : BackupRestoreService.CONSTS.ViewWidth,
                        bodyViewTemplate : doT.template(TemplateFactory.get('restore', 'choose-restore-type')),
                        isBackup : false
                    });
                }
                return chooseRestoreTypeView;
            }
        });

        return factory;
    });
}(this));