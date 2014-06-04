/*global $, Backbone, _, define, console*/
(function (window) {
    define([
        'IOBackendDevice',
        'Configuration',
        'Environment',
        'Internationalization',
        'utilities/StringUtil',
        'ui/Notification',
        'ui/AlertWindow',
        'ui/BatchActionWindow',
        'contact/collections/ContactsCollection'
    ], function (
        IO,
        CONFIG,
        Environment,
        i18n,
        StringUtil,
        Notification,
        AlertWindow,
        BatchActionWindow,
        ContactsCollection
    ) {
        console.log('ContactService - File loaded.');

        var alert = window.alert;
        var confirm = window.confirm;

        var ContactService = _.extend({}, Backbone.Events);

        ContactService.deleteContactsAsync = function (ids) {
            var deferred = $.Deferred();

            var contactsCollection = ContactsCollection.getInstance();

            var doDelete = function () {
                var disposableAlert;

                var readOnlyContactsCount =  _.filter(ids, function (id) {
                    return !contactsCollection.get(id).isReadOnly;
                }).length;

                if (readOnlyContactsCount === 0) {
                    return;
                }

                if (ids.length === 1) {
                    disposableAlert = new AlertWindow({
                        draggable : true,
                        disposableName : 'contact-delete-contact-single',
                        buttonSet : 'yes_no',
                        $bodyContent : i18n.contact.ALERT_TIP_DEL_SINGLE_CONTACT
                    });
                } else {
                    disposableAlert = new AlertWindow({
                        draggable : true,
                        disposableName : 'contact-delete',
                        buttonSet : 'yes_no',
                        $bodyContent : StringUtil.format(i18n.contact.DELETE_TIP_TEXT, ids.length)
                    });
                }

                disposableAlert.on('button_yes', function () {
                    var session;
                    var batchActionWindow;
                    if (ids.length > 1) {
                        session = _.uniqueId('contact.batch.delete_');
                        batchActionWindow = new BatchActionWindow({
                            session : session,
                            progressText : i18n.misc.DELETING,
                            cancelUrl : CONFIG.actions.CONTACT_CANCEL,
                            total : ids.length,
                            successText : i18n.contact.CONTACT_DELETE_SUCCESS
                        });
                        batchActionWindow.show();
                    }

                    contactsCollection.deleteContactsAsync(ids, session).done(function (resp) {
                        var failed = _.map(resp.body.failed, function (contact) {
                            return contact.item;
                        });

                        if (failed.length > 0) {
                            if (batchActionWindow !== undefined) {
                                batchActionWindow.remove();
                            }

                            var msg = i18n.contact.CONTACT_DELETE_FAILED_TEXT + '<br />';

                            _.each(failed, function (item) {
                                msg += '- ' + contactsCollection.get(item).get('name') + '<br />';
                            });

                            var alertWindow = new AlertWindow({
                                draggable : true,
                                buttonSet : 'retry_cancel',
                                $bodyContent : $('<div class="w-misc-error-window-body">').html(msg)
                            });

                            alertWindow.on('button_retry', function () {
                                ContactService.deleteContactsAsync(failed).done(deferred.resolve).fail(deferred.reject);
                                alert.remove();
                            }, this);

                            alertWindow.on('button_cancel', function () {
                                deferred.reject();
                            });

                            alertWindow.show();
                        } else {
                            deferred.resolve(resp);
                        }
                    }).fail(function (resp) {
                        batchActionWindow.remove();
                        deferred.reject(resp);
                    });
                }, this);

                disposableAlert.show();
            };

            var readOnlyContacts = _.filter(ids, function (id) {
                return contactsCollection.get(id).isReadOnly;
            }.bind(this));

            if (readOnlyContacts.length > 0) {
                confirm(i18n.contact.CONTACT_READ_ONLY_TIP, function () {
                    doDelete.call(this);
                }, this);
            } else {
                doDelete.call(this);
            }

            return deferred.promise();
        };

        ContactService.mergeContactAsync = function (ids) {
            var deferred = $.Deferred();

            var contactsCollection = ContactsCollection.getInstance();

            function mergeContact() {
                var disposableAlert = new AlertWindow({
                    draggable : true,
                    disposableName : 'contact-merge',
                    buttonSet : 'yes_no',
                    $bodyContent : $(StringUtil.format(i18n.contact.ALERT_TIP_MERGE_CONTACTS, ids.length, ids.length))
                });
                disposableAlert.once('button_yes', function () {
                    var model = contactsCollection.generateMergeModel(ids);
                    deferred.resolve(model);
                });
                disposableAlert.show();
            }

            function checkReadOnly() {
                if (contactsCollection.containsReadOnly(ids)) {
                    confirm(i18n.contact.CONTACT_READ_ONLY_TIP, function () {
                        mergeContact.call(this);
                    });
                } else {
                    mergeContact.call(this);
                }
            }

            if (ids.length > 50) {
                var disposableAlert = new AlertWindow({
                    draggable : true,
                    disposableName : 'contacts-merge-too-much',
                    disposableChecked : true,
                    buttonSet : 'yes_no',
                    $bodyContent : i18n.contact.ALERT_TIP_MERGE_MANY_CONTACTS
                });
                disposableAlert.once('button_yes', function () {
                    checkReadOnly.call(this);
                }, this);
                disposableAlert.show();
            } else {
                checkReadOnly.call(this);
            }

            return deferred.promise();
        };

        ContactService.getContactHasBackupAsync = function () {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.CONTACT_HAS_BACKUP,
                success : function (resp) {
                    if (resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        ContactService.loadContactBackupAsync = function () {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.CONTACT_LOAD_BACKUP,
                success : function (resp) {
                    if (resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        return ContactService;
    });
}(this));
