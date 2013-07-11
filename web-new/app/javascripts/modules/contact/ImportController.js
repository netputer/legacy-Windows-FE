/*global define*/
(function (window) {
    define([
        'backbone',
        'doT',
        'jquery',
        'underscore',
        'ui/AlertWindow',
        'Internationalization',
        'contact/views/ImportSelectFileView',
        'contact/views/ImportAutoBackupView',
        'contact/views/ImportSelectAccountView',
        'contact/views/ImportProgressView',
        'contact/collections/ContactsCollection'
    ], function (
        Backbone,
        doT,
        $,
        _,
        AlertWindow,
        i18n,
        ImportSelectFileView,
        ImportAutoBackupView,
        ImportSelectAccountView,
        ImportProgressView,
        ContactsCollection
    ) {
        console.log('ImportController - File loaded. ');
        var alert = window.alert;

        var importSelectFileView;
        var importSelectAccountView;
        var importProgressView;
        var importAutoBackupView;
        var importController;
        var contactsCollection;

        var ImportController = Backbone.View.extend({
            start : function (hasBackUp) {
                importSelectFileView = importSelectFileView || ImportSelectFileView.getInstance();
                importAutoBackupView = importAutoBackupView || ImportAutoBackupView.getInstance();
                importSelectAccountView = importSelectAccountView || ImportSelectAccountView.getInstance();
                importProgressView = importProgressView || ImportProgressView.getInstance();
                contactsCollection = contactsCollection || ContactsCollection.getInstance();

                this.buildEvents();

                if (hasBackUp) {
                    importAutoBackupView.show();
                } else {
                    importSelectFileView.show();
                }

                importProgressView.initState();
            },
            buildEvents : function () {

                importSelectFileView.off('_SWITCH_BUTTON');
                importSelectFileView.off('_NEXT_STEP');
                importAutoBackupView.off('_SWITCH_BUTTON');
                importAutoBackupView.off('_NEXT_STEP');
                importSelectAccountView.off('_NEXT_STEP');
                importProgressView.off('_IMPORT_CONTACT');

                importSelectFileView.on('_SWITCH_BUTTON', function () {
                    this.showNextAndRemoveCurrent(importSelectFileView, importAutoBackupView);
                }, this);

                importSelectFileView.on('_NEXT_STEP', function () {
                    this.showNextAndRemoveCurrent(importSelectFileView, importSelectAccountView);
                }, this);

                importAutoBackupView.on('_SWITCH_BUTTON', function () {
                    this.showNextAndRemoveCurrent(importAutoBackupView, importSelectFileView);
                }, this);

                importAutoBackupView.on('_NEXT_STEP', function () {
                    this.showNextAndRemoveCurrent(importAutoBackupView, importSelectAccountView);
                }, this);

                importSelectAccountView.on('_NEXT_STEP', function () {
                    this.showNextAndRemoveCurrent(importSelectAccountView, importProgressView);
                    importProgressView.importContact();
                }, this);

                importProgressView.on('_IMPORT_CONTACT', function (response) {
                    if (response.state_code === 200) {
                        if (response.body && response.body.contact && response.body.contact.length > 0) {
                            //remove it next version.
                            importSelectFileView.refreshSwitchBtn();
                            this.showNextAndRemoveCurrent(importProgressView, importSelectAccountView);
                            alert(response.body.contact.length + i18n.contact.IMPORT_PARTIAL_FAILED);
                        }
                        contactsCollection.syncAsync();
                    } else {
                        importProgressView.remove();

                        switch (response.state_code) {
                        case 500:
                            alert(i18n.misc.CONNECTION_LOSE);
                            break;
                        case 406:
                            alert(i18n.cantact.IMPORT_FAIL_TYPE_FILE);
                            break;
                        case 704:
                            alert(i18n.misc.NOT_ENOUGH_ROOM_FOR_IMPORT);
                            break;
                        case 709:
                            alert(i18n.backup_restore.ERROR_WHEN_WRITE_ROM);
                            break;
                        case 402:
                            break;
                        default:
                            alert(i18n.contact.IMPORT_CONTACTS_FAIL);
                        }
                    }
                }, this);
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

        return new ImportController();
    });
}(this));
