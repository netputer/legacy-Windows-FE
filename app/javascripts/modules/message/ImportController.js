/*global define*/
(function (window) {
    define([
        'backbone',
        'message/views/ImportAutoBackupView',
        'message/views/ImportSelectFileView',
        'message/views/ImportProgressView',
        'Internationalization',
        'Device',
        'Configuration',
        'message/MessageService'
    ], function (
        Backbone,
        ImportAutoBackupView,
        ImportSelectFileView,
        ImportProgressView,
        i18n,
        Device,
        Configuration,
        MessageService
    ) {

        console.log('Messgae ImportController - File loaded');

        var alert = window.alert;
        var confirm = window.confirm;
        var importAutoBackupView;
        var importSelectFileView;
        var importProgressView;

        var importController;
        var ImportController = Backbone.View.extend({
            start: function (hasBackUp) {
                importAutoBackupView = ImportAutoBackupView.getInstance();
                importSelectFileView = ImportSelectFileView.getInstance();
                importProgressView = ImportProgressView.getInstance();

                this.buildEvents();

                if (hasBackUp) {
                    importAutoBackupView.show();
                } else {
                    importSelectFileView.refreshSwitchBtn();
                    importSelectFileView.show();
                }
            },
            checkDefault : function () {
                MessageService.applyDefaultApp().done(function (resp){
                    var isDefault = resp.body.value;
                    if (isDefault) {
                        importProgressView.importSms();
                    } else {
                        confirm(i18n.message.APPLY_DEFAULT_4_4, function (){
                            setTimeout(function () {
                                this.checkDefault();
                            }.bind(this), 500);
                        }, function () {
                            importProgressView.remove();
                        }, this);
                    }
                }.bind(this));
            },
            buildEvents: function () {
                importSelectFileView.off('_SWITCH_BUTTON');
                importSelectFileView.off('_CONFIRM_BUTTON');
                importAutoBackupView.off('_SWITCH_BUTTON');
                importAutoBackupView.off('_NEXT_BUTTON');
                importProgressView.off('_IMPORT_SMS');
                importProgressView.off('_IMPORT_SMS_FINISH');

                importAutoBackupView.on('_NEXT_BUTTON', function () {
                    importProgressView.refreshBtn();
                    this.showNextAndRemoveCurrent(importAutoBackupView, importProgressView);

                    if (Device.get('SDKVersion') >= CONFIG.enums.ANDROID_4_4) {
                        this.checkDefault();
                    } else {
                        importProgressView.importSms();
                    }

                }, this);

                importSelectFileView.on('_CONFIRM_BUTTON', function () {
                    importProgressView.refreshBtn();
                    this.showNextAndRemoveCurrent(importSelectFileView, importProgressView);

                    if (Device.get('SDKVersion') >= CONFIG.enums.ANDROID_4_4) {
                        this.checkDefault();
                    } else {
                        importProgressView.importSms();
                    }

                }, this);

                importAutoBackupView.on('_SWITCH_BUTTON', function () {

                    importSelectFileView.refreshSwitchBtn();
                    importSelectFileView.setConfirmBtnDisable(true);
                    this.showNextAndRemoveCurrent(importAutoBackupView, importSelectFileView);
                }, this);

                importSelectFileView.on('_SWITCH_BUTTON', function () {
                    this.showNextAndRemoveCurrent(importSelectFileView, importAutoBackupView);
                }, this);

                importProgressView.on('_IMPORT_SMS', function (resp) {
                    if (resp.state_code !== 200) {
                        importSelectFileView.refreshSwitchBtn();
                        importSelectFileView.setConfirmBtnDisable(true);

                        var yesHandler = function () {
                            this.showNextAndRemoveCurrent(importProgressView, importSelectFileView);
                        }.bind(this);

                        switch (resp.state_code) {
                        case 500:
                            alert(i18n.misc.CONNECTION_LOSE, yesHandler);
                            break;
                        case 704:
                            alert(i18n.misc.NOT_ENOUGH_ROOM_FOR_IMPORT, yesHandler);
                            break;
                        case 709:
                            alert(i18n.backup_restore.ERROR_WHEN_WRITE_ROM, yesHandler);
                            break;
                        default:
                            alert(i18n.message.IMPORT_FAILED, yesHandler);
                            break;
                        }
                    }
                }, this);

                importProgressView.on('_IMPORT_SMS_FINISH', function () {
                    alert(i18n.message.RECOVER_DEAFULT_4_4, function () {
                        MessageService.recoverDefaultApp();
                    });
                });
            },
            showNextAndRemoveCurrent : function (currentView, targetView) {
                var hideHandler = function () {
                    targetView.show();
                    currentView.off('hide', hideHandler);
                };

                currentView.on('hide', hideHandler, this);
                currentView.remove();
            }
        });

        importController = new ImportController();
        return importController;
    });
}(this));
