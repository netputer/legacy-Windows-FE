/*global define*/
(function (window) {
    define([
        'underscore',
        'Device',
        'Internationalization',
        'contact/models/ContactModel',
        'contact/collections/ContactsCollection'
    ], function (
        _,
        Device,
        i18n,
        ContactModel,
        ContactsCollection
    ) {
        console.log('ContactMultiNumbersCollection - File loaded.');

        var contactsCollection;

        var ContactMultiNumbersCollection = ContactsCollection.getClass().extend({
            model : ContactModel,
            initialize : function () {
                var loading = false;
                Object.defineProperties(this, {
                    loading : {
                        set : function (value) {
                            loading = Boolean(value);
                        },
                        get : function () {
                            return loading;
                        }
                    }
                });

                contactsCollection = ContactsCollection.getInstance();

                var refreshHandler = function (collection) {
                    if (!collection.loading && !collection.syncing) {
                        this.loading = false;
                        this.set(collection.toJSON(), {
                            parse : true
                        });
                        this.trigger('refresh', this);
                    }
                };

                this.listenTo(contactsCollection, 'refresh', refreshHandler);

                this.listenTo(contactsCollection, 'update', function () {
                    this.loading = true;
                });

                refreshHandler.call(this, contactsCollection);
            },
            parse : function (resp) {
                var result = [];
                var tempIds = [];
                _.each(resp, function (contact) {
                    var contactTemp = _.clone(contact);
                    contactTemp.title = contact.name && contact.name.display_name ? contact.name.display_name : i18n.message.UNNAMED_CONTACT;
                    _.each(contact.phone, function (phone) {
                        contactTemp.id = contact.id + '|' + phone.number;
                        contactTemp.phoneNumber = phone.number;
                        if (tempIds.indexOf(contactTemp.id) < 0) {
                            result.push(_.clone(contactTemp));
                            tempIds.push(contactTemp.id);
                        }
                    });
                });
                return result;
            }
        });

        var contactMultiNumbersCollection;

        var factory = _.extend({
            getInstance : function () {

                var listenHandler;
                var events = 'change:isConnected change:isSameWifi';

                if (!contactMultiNumbersCollection) {
                    contactMultiNumbersCollection = new ContactMultiNumbersCollection();

                    if (window.SnapPea.isPimEnabled) {
                        contactMultiNumbersCollection.trigger('update');
                    } else {
                        listenHandler = function (Device) {

                            if (window.SnapPea.isPimEnabled) {
                                this.trigger('update');
                                this.stopListening(this, events, listenHandler);
                            }
                        };
                        contactMultiNumbersCollection.listenTo(Device, events, listenHandler);
                    }
                }

                return contactMultiNumbersCollection;
            }
        });

        return factory;
    });
}(this));
