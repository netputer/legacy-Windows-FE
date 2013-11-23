/*global define*/
(function (window) {
    define([
        'jquery',
        'backbone',
        'underscore',
        'doT',
        'ui/TemplateFactory',
        'Device',
        'Log',
        'Account',
        'Configuration',
        'ui/AlertWindow',
        'new_backuprestore/BackupRestoreService',
        'new_backuprestore/views/RemoteRestoreAdvanceView',
        'new_backuprestore/views/LocalRestoreAdvanceView',
        'new_backuprestore/models/RestoreContextModel'
    ], function (
        $,
        Backbone,
        _,
        doT,
        TemplateFactory,
        Device,
        log,
        Account,
        CONFIG,
        AlertWindow,
        BackupRestoreService,
        RemoteRestoreAdvanceView,
        LocalRestoreAdvanceView,
        RestoreContextModel
    ) {

        console.log('RemoteFooterView - File loaded.');

        var alert = window.alert;
        var advanceView;
        var RemoteFooterView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('new_backuprestore', 'restore-footer')),
            className : 'w-backuprestore-footer hbox',
            initialize : function () {
                RemoteFooterView.__super__.initialize.apply(this, arguments);

                var isLocal = true;
                Object.defineProperties(this, {
                    enableRestoreButton : {
                        set : function (value) {
                            var isConnected = Device.get('isConnected');
                            var isFastADB = Device.get('isFastADB');
                            var isLogin = Account.get('isLogin');
                            var disabled = !value || !isConnected || isFastADB || (!this.isLocal && !isLogin);
                            this.$('.startrestore').prop('disabled', disabled);
                        }
                    },
                    enableConfirmButton : {
                        set : function (value) {
                            var isLogin = Account.get('isLogin');
                            var disabled = !value || (!this.isLocal && !isLogin);
                            this.$('.confirm').prop('disabled', disabled);
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
            setButtonState : function (type) {
                var $showFile = this.$('.showfile').hide();
                var $advanced = this.$('.advanced').hide();
                var $cancel = this.$('.cancel').hide();
                var $startrestore = this.$('.startrestore').hide();
                var $confirm = this.$('.confirm').hide();
                var $done = this.$('.done').hide();
                var $taskmanager = this.$('.taskmanager').hide();
                this.$('.showmore').hide();

                switch (type) {
                case 'selectFile':
                    if (this.isLocal) {
                        $showFile.show();
                    }
                    $cancel.show();
                    $confirm.show();
                    break;
                case 'downloading':
                    $cancel.show();
                    break;
                case 'ready':
                    $cancel.show();
                    $advanced.show();
                    $startrestore.show();
                    break;
                case 'progressing':
                    $cancel.show();
                    break;
                case 'done':
                    if (RestoreContextModel.isAppSelected) {
                        $taskmanager.show();
                    }

                    $done.show();
                    break;
                }
            },
            toggleCancel : function (show) {
                this.$('.cancel').toggle(show);
            },
            hideShowMoreBtn : function () {
                this.$('.showmore').hide();
            },
            displayShowMoreBtn : function () {
                this.$('.showmore').show();
            },
            clickBtnAdvanced : function () {

                if (!advanceView) {
                    advanceView = this.isLocal ? LocalRestoreAdvanceView.getInstance() : RemoteRestoreAdvanceView.getInstance();
                }
                advanceView.show();

                log({
                    event : 'ui.click.new_backuprestore_restore_advance',
                    isLocal : this.isLocal
                });
            },
            clickBtnCancel : function () {
                this.trigger('__CANCEL');
            },
            clickBtnStartRestore : function () {
                if (Device.get('SDKVersion') >= CONFIG.enums.ANDROID_4_4 && RestoreContextModel.isSmsSelected) {
                    alert(i18n.new_backuprestore.RESTORE_SMS_DISABLE_ANDROID_4_4);
                } else {
                    this.trigger('__START_RESTORE');
                }
            },
            clickBtnDone : function () {
                this.trigger('__DONE');

                if (Device.get('SDKVersion') >= CONFIG.enums.ANDROID_4_4 && RestoreContextModel.isSmsSelected) {
                    alert(i18n.new_backuprestore.RESTORE_SMS_COMPLATE_ANDROID_4_4);
                }
            },
            clickBtnShowFile : function (evt) {

                var target = $(evt.target).prop('disabled', true);
                setTimeout(function () {
                    target.prop('disabled', false);
                }, 2000);

                this.trigger('__SHOW_FILE');

                log({
                    event : 'ui.click.new_backuprestore_choose_backup_file'
                });
            },
            clickBtnTaskManager : function () {
                this.trigger('__TASK_MANAGER');
            },
            clickBtnConfirm : function () {
                this.trigger('__CONFIRM');
            },
            clickBtnShowMore : function () {
                this.trigger('__SHOW_MORE');
            },
            render : function () {
                this.$el.html(this.template({}));

                this.initState();
                return this;
            },
            initState : function () {
                this.listenTo(Device, 'change:isConnected', function () {
                    var isConnected = Device.get('isConnected');
                    this.$('.startrestore').prop('disabled', !isConnected);
                    this.$('.advanced').toggle(isConnected);
                });

                this.listenTo(RestoreContextModel, 'change:dataIDList', function () {
                    var list = RestoreContextModel.get('dataIDList');
                    this.enableRestoreButton = (list.length !== 0);
                });

                if (!this.isLocal) {
                    this.listenTo(Account, 'change:isLogin', function () {
                        var isLogin = Account.get('isLogin');
                        this.$('.startrestore, .confirm').prop('disabled', !isLogin);
                    });
                }
            },
            remove : function () {
                RemoteFooterView.__super__.remove.apply(this, arguments);
                if (advanceView) {
                    advanceView.remove();
                    advanceView = undefined;
                }
            },
            events: {
                'click .advanced' : 'clickBtnAdvanced',
                'click .cancel' : 'clickBtnCancel',
                'click .startrestore' : 'clickBtnStartRestore',
                'click .done' : 'clickBtnDone',
                'click .showfile' : 'clickBtnShowFile',
                'click .taskmanager' : 'clickBtnTaskManager',
                'click .confirm' : 'clickBtnConfirm',
                'click .showmore' : 'clickBtnShowMore'
            }
        });

        return RemoteFooterView;
    });
}(this));
