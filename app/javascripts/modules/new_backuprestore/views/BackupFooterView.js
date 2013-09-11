/*global define*/
(function (window) {
    define([
        'jquery',
        'backbone',
        'underscore',
        'doT',
        'Device',
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
                            var isLogin = Account.get('isLogin');
                            var disabled = !value || !isConnected || (!this.isLogin && !isLogin);
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
            },
            render : function () {
                this.$el.html(this.template({}));

                this.initState();
                return this;
            },
            initState : function () {

                this.listenTo(Device, 'change:isConnected', function () {
                    var isConnected = Device.get('isConnected');
                    this.$('.startbackup').prop('disabled', !isConnected);
                    this.$('.advanced').toggle(isConnected);
                });

                this.listenTo(BackupContextModel, 'change:dataIDList', function () {
                    var list = BackupContextModel.get('dataIDList');
                    this.enableBackupButton = (list.length !== 0);
                });

                if (!this.isLocal) {
                    this.listenTo(Account, 'change:isLogin', function () {
                        var isLogin = Account.get('isLogin');
                        this.$('.startbackup').prop('disabled', !isLogin);
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
                'click .showfile' : 'clickBtnShowFile'
            }
        });

        return BackupFooterView;
    });
}(this));
