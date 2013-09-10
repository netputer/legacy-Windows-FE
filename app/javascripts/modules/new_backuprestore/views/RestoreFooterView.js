/*global define*/
(function (window) {
    define([
        'jquery',
        'backbone',
        'underscore',
        'doT',
        'ui/TemplateFactory',
        'Device',
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
        BackupRestoreService,
        RemoteRestoreAdvanceView,
        LocalRestoreAdvanceView,
        RestoreContextModel
    ) {

        console.log('RemoteFooterView - File loaded.');

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
                            var disabled = !isConnected && !value;
                            this.$('.startbackup').prop('disabled', disabled);
                            this.$('.advanced').toggle('disabled', !disabled);
                        }
                    },
                    enableConfirmButton : {
                        set : function (value) {
                            this.$('.confirm').prop('disabled', !value);
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
                    if (RestoreContextModel.IsAppSelected) {
                        $taskmanager.show();
                    }

                    $done.show();
                    break;
                }
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
            },
            clickBtnCancel : function () {
                this.trigger('__CANCEL');
            },
            clickBtnStartRestore : function () {
                this.trigger('__START_RESTORE');
            },
            clickBtnDone : function () {
                this.trigger('__DONE');
            },
            clickBtnShowFile : function (evt) {

                var target = $(evt.target).prop('disabled', true);
                setTimeout(function () {
                    target.prop('disabled', false);
                }, 2000);

                this.trigger('__SHOW_FILE');
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
