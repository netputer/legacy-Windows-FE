/*global define*/
(function (window) {
    define([
        'jquery',
        'backbone',
        'underscore',
        'doT',
        'Device',
        'Log',
        'Account',
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
        Device,
        log,
        Account,
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
                            var isConnected = Device.get('isConnected');
                            var isFastADB = Device.get('isFastADB');
                            var isLogin = Account.get('isLogin');
                            var disabled = !value || !isConnected || isFastADB || (!this.isLocal && !isLogin);
                            this.$('.startbackup').prop('disabled', disabled);
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

                log({
                    event : 'ui.click.new_backuprestore_backup_advance',
                    isLocal : this.isLocal
                });
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
                BackupRestoreService.showFileAsync(BackupContextModel.fileFullName);

                log({
                    event : 'ui.click.new_backuprestore_show_backup_file'
                });
            },
            clickRemoteFile : function () {
                log({
                    event : 'ui.click.new_backuprestore_show_remote_file'
                });
            },
            toggleCancel : function (show) {
                this.$('.cancel').toggle(show);
            },
            render : function () {
                this.$el.html(this.template({}));

                this.initState();
                return this;
            },
            initState : function () {

                var startBtn = this.$('.startbackup');
                var advancedBtn = this.$('.advanced');

                var setState = function (Device, isConnected) {

                    startBtn.prop('disabled', !isConnected);
                    if (isConnected) {
                        advancedBtn.removeAttr('disabled');
                    } else {
                        advancedBtn.attr('disabled', 'true');
                    }
                };
                setState(Device, Device.get('isConnected'));

                this.listenTo(Device, 'change:isConnected', setState);
                this.listenTo(BackupContextModel, 'change:dataIDList', function () {
                    var list = BackupContextModel.get('dataIDList');
                    this.enableBackupButton = (list.length !== 0);
                });

                if (!this.isLocal) {
                    this.listenTo(Account, 'change:isLogin', function () {
                        var isLogin = Account.get('isLogin');
                        startBtn.prop('disabled', !isLogin);
                    });
                }

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
                'click .showfile' : 'clickBtnShowFile',
                'click .show-remote-file' : 'clickRemoteFile'
            }
        });

        return BackupFooterView;
    });
}(this));
