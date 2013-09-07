/*global define*/
(function (window) {
    define([
        'jquery',
        'backbone',
        'underscore',
        'doT',
        'ui/TemplateFactory',
        'new_backuprestore/BackupRestoreService',
        'new_backuprestore/views/RemoteBackupAdvanceView',
        'new_backuprestore/views/LocalBackupAdvanceView',
        'new_backuprestore/models/BackupContextModel'
    ], function (
        $,
        Backbone,
        _,
        doT,
        TemplateFactory,
        BackupRestoreService,
        RemoteBackupAdvanceView,
        LocalBackupAdvanceView,
        BackupContextModel
    ) {

        console.log('BackupFooterView - File loaded.');

        var advanceView;
        var BackupFooterView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('new_backuprestore', 'backup-footer')),
            className : 'w-backuprestore-footer hbox',
            initialize : function () {
                BackupFooterView.__super__.initialize.apply(this, arguments);

                var isLocal = true;
                Object.defineProperties(this, {
                    enableBackupButton : {
                        set : function (value) {
                            this.$('.startbackup').prop('disabled', !value);
                        }
                    },
                    isLocal : {
                        set : function (value) {
                            isLocal = value;
                        },
                        get : function () {
                            return isLocal;
                        }
                    }
                });
            },
            clickBtnAdvanced : function () {

                if (!advanceView) {
                    advanceView = this.isLocal ? LocalBackupAdvanceView.getInstance() : RemoteBackupAdvanceView.getInstance();
                }
                advanceView.show();
            },
            clickBtnCancel : function () {
                this.trigger('__CANCEL');
            },
            clickBtnStartBackup : function () {
                this.trigger('__START_BACKUP');
            },
            clickBtnDone : function () {
                this.trigger('__DONE');
            },
            clickBtnShowFile : function () {
                BackupRestoreService.showFileAsync(BackupContextModel.get('filePath'));
            },
            render : function () {
                this.$el.html(this.template({}));
                return this;
            },
            remove : function () {
                BackupFooterView.__super__.remove.apply(this, arguments);
                if (advanceView) {
                    advanceView.remove();
                    advanceView = undefined;
                }
            },
            events: {
                'click .advanced' : 'clickBtnAdvanced',
                'click .cancel' : 'clickBtnCancel',
                'click .startbackup' : 'clickBtnStartBackup',
                'click .done' : 'clickBtnDone',
                'click .showfile' : 'clickBtnShowFile'
            }
        });

        return BackupFooterView;
    });
}(this));