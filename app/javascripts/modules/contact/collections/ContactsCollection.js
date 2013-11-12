/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'jquery',
        'Configuration',
        'IOBackendDevice',
        'Device',
        'message/collections/ConversationsCollection',
        'message/collections/ThreadsCollection',
        'contact/collections/AccountCollection',
        'contact/models/ContactModel',
        'contact/EditorConfig',
        'main/collections/PIMCollection'
    ], function (
        Backbone,
        _,
        $,
        CONFIG,
        IO,
        Device,
        ConversationsCollection,
        ThreadsCollection,
        AccountCollection,
        ContactModel,
        EditorConfig,
        PIMCollection
    ) {
        console.log('ContactsCollection - File loaded.');

        var UNGROUP_REG = new RegExp(/ungroup\[\w+\]/);

        var ContactsCollection = Backbone.Collection.extend({
            model : ContactModel,
            url : CONFIG.actions.CONTACT_GET_SHOW,
            comparator : function (contact) {
                var prefix = '~';

                if (contact.get('name') !== undefined) {
                    prefix = contact.get('name').prefix || '~';
                }
                return prefix;
            },
            parse : function (resp) {
                if (resp.state_code === 202 && Device.get('isConnected')) {
                    console.log('ContactsCollection - ContactCollection is syncing.');
                    this.syncing = true;
                    this.trigger('syncStart');
                }

                return _.filter(resp.body.contact, function (contact) {
                    return contact.visible === true;
                });
            },
            syncAsync : function () {
                var deferred = $.Deferred();

                this.syncing = true;
                this.trigger('syncStart');

                IO.requestAsync({
                    url : CONFIG.actions.CONTACT_SYNC,
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('ContactsCollection - ContactCollection sync success.');

                            deferred.resolve(resp);
                        } else {
                            console.error('ContactsCollection - ContactCollection sync failed. Error info: ' + resp.state_line);

                            this.syncing = false;
                            this.trigger('syncEnd');
                            deferred.reject(resp);
                        }
                    }.bind(this)
                });

                return deferred.promise();
            },
            initialize : function () {
                var loading = false;
                var syncing = false;
                Object.defineProperties(this, {
                    loading : {
                        set : function (value) {
                            loading = value;
                        },
                        get : function () {
                            return loading;
                        }
                    },
                    syncing : {
                        set : function (value) {
                            syncing = value;
                        },
                        get : function () {
                            return syncing;
                        }
                    }
                });

                this.on('update', function () {
                    if (!loading) {
                        loading = true;

                        this.fetch({
                            success : function (collection) {
                                console.log('ContactsCollection - Collection fetched.');
                                loading = false;

                                collection.trigger('refresh', collection);
                            }
                        });
                    }
                }, this);

                this.on('refresh', function () {
                    AccountCollection.getInstance().trigger('update');
                }, this);

                IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.CONTACT_UPDATED
                }, function (data) {
                    if (syncing) {
                        syncing = false;
                        this.trigger('syncEnd');
                    }
                    if (!!data) {
                        this.trigger('update');
                    }
                }, this);
            },
            deleteContactsAsync : function (ids, session) {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.CONTACT_BATCH_DELETE,
                    data : {
                        contacts : _.filter(ids, function (id) {
                            return !this.get(id).isReadOnly;
                        }, this).join(','),
                        session : session || ''
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('ContactsCollection - Delete contacts success.');

                            var body = resp.body;
                            var success = body && body.success ? body.success : [];

                            if (success.length > 0) {
                                _.each(success, function (contact) {
                                    this.remove(this.get(contact.item));
                                }, this);

                                ConversationsCollection.getInstance().trigger('update');
                                ThreadsCollection.getInstance().trigger('update');
                            }

                            this.trigger('refresh', this);

                            deferred.resolve(resp);
                        } else if (resp.state_code === 402) {
                            this.syncAsync();
                            deferred.resolve(resp);
                        } else {
                            console.error('ContactsCollection - Delete contacts failed. Error info: ' + resp.state_line);
                            deferred.reject(resp);
                        }
                    }.bind(this)
                });

                return deferred.promise();
            },
            batchGroupAsync : function (ids, groupId, action, session) {
                var deferred = $.Deferred();

                var targetGroup = AccountCollection.getInstance().getGroupById(groupId);

                var data = {
                    contacts : ids.join(','),
                    account_type : targetGroup.get('account_type'),
                    account_name : targetGroup.get('account_name'),
                    action : Number(action),
                    groups : targetGroup.get('id')
                };

                if (session) {
                    data.session = session;
                }

                IO.requestAsync({
                    url : CONFIG.actions.CONTACT_BATCH_GROUP,
                    data : data,
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('ContactsCollection - Batch group contacts success. ');

                            deferred.resolve(resp);
                        } else {
                            console.error('ContactsCollection - Batch group contacts failed. Error info: ' + resp.state_line);

                            deferred.reject(resp);
                        }
                        this.trigger('update');
                    }.bind(this)
                });

                return deferred.promise();
            },
            updateContactAsync : function (data) {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.CONTACT_UPDATE,
                    data : {
                        contact : JSON.stringify(data)
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('ContactsCollection - Update contact success. ');

                            var model = this.get(resp.body);
                            model.clear({
                                silent : true
                            });
                            model.set(new ContactModel(resp.body).toJSON());
                            this.trigger('refresh', this);

                            deferred.resolve(resp);
                        } else {
                            console.error('ContactsCollection - Update contact failed. Error info: ' + resp.state_line);
                            deferred.reject(resp);
                        }
                    }.bind(this)
                });

                return deferred.promise();
            },
            saveContactAsync : function (data) {
                var deferred = $.Deferred();

                if (data.id) {
                    this.updateContactAsync(data).done(function (resp) {
                        ConversationsCollection.getInstance().trigger('update');
                        ThreadsCollection.getInstance().trigger('update');
                        deferred.resolve(resp);
                    }).fail(function (resp) {
                        deferred.reject(resp);
                    });
                } else {
                    this.addNewContactAsync(data).done(function (resp) {
                        ConversationsCollection.getInstance().trigger('update');
                        ThreadsCollection.getInstance().trigger('update');
                        deferred.resolve(resp);
                    }).fail(function (resp) {
                        deferred.reject(resp);
                    });
                }

                return deferred.promise();
            },
            addNewContactAsync : function (data) {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.CONTACT_ADD,
                    data : {
                        contact : JSON.stringify(data)
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('ContactsCollection - Add success. ');
                            this.add(resp.body);
                            this.trigger('refresh', this);

                            deferred.resolve(resp);
                        } else {
                            console.error('ContactsCollection - Add failed. Error info: ' + resp.state_line);
                            deferred.reject(resp);
                        }
                    }.bind(this)
                });

                return deferred.promise();
            },
            importAsync : function (accountName, accountType, file, session) {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.CONTACT_IMPORT,
                    data : {
                        account_name : accountName,
                        account_type : accountType,
                        vcf_file : file,
                        session : session
                    },
                    success : function (resp) {
                        if (resp.state_line === 200) {
                            console.log('ContactsCollection - Import success. ');
                            deferred.resolve(resp);
                        } else {
                            console.error('ContactsCollection - Import failed. Error info: ' + resp.state_line);
                            deferred.reject(resp);
                        }
                    }
                });

                return deferred.promise();
            },
            exportAsync : function (ids, type, session) {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.CONTACT_EXPORT,
                    data : {
                        session : session,
                        type : type,
                        contacts : ids.join(',')
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('ContactsCollection - Export success. ');
                            deferred.resolve(resp);
                        } else {
                            console.error('ContactsCollection - Export failed. Error info: ' + resp.state_line);
                            deferred.reject(resp);
                        }
                    }
                });

                return deferred.promise();
            },
            editorAvatarAsync : function (data) {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.EDIT_IMAGE,
                    data : data,
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('ContactsCollection - Save avatar success. ');
                            deferred.resolve(resp);
                        } else {
                            console.error('ContactsCollection - Save avatar. Error info: ' + resp.state_line);
                            deferred.reject(resp);
                        }
                    }
                });

                return deferred.promise();
            },
            searchContactsAsync : function (keyword) {

                var deferred = $.Deferred();
                IO.requestAsync({
                    url : CONFIG.actions.CONTACT_SEARCH,
                    data : {
                        query : keyword
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('ContactsCollection - Search success');

                            deferred.resolve(resp);
                        } else {
                            console.error('ConversationsCollection - Search failed. Error info: ' + resp.state_code);
                            deferred.reject(resp);
                        }
                    }
                });

                return deferred.promise();
            },
            getContactsByGroupId : function (groupId) {
                var filter;
                if (UNGROUP_REG.test(groupId)) {
                    var accountId;
                    groupId.replace(/(\[)(\w+)(\])/, function (arg1, arg2, id) {
                        accountId = id;
                    });
                    var contacts = this.getContactsByAccountName(AccountCollection.getInstance().get(accountId).get('name'));
                    filter = _.filter(contacts, function (contact) {
                        return !contact.get('group').length;
                    });
                } else {
                    var id = AccountCollection.getInstance().getGroupById(groupId).get('id');
                    filter = this.filter(function (contact) {
                        return _.pluck(contact.get('group'), 'group_row_id').indexOf(id) >= 0;
                    });
                }

                return filter;
            },
            getContactsByAccountName : function (accountName) {
                return this.filter(function (contact) {
                    return contact.get('account_name') === accountName;
                });
            },
            getContactsByGroupIdAndAccountName : function (groupId, accountName) {
                return _.filter(this.getContactsByGroupId(groupId), function (contact) {
                    console.log(contact);
                    return contact.get('account_name') === accountName;
                });
            },
            getContactsHasPhoneNumber : function () {
                return this.filter(function (contact) {
                    return contact.hasPhoneNumber;
                });
            },
            getContactsHasPhoneNumberByAccountName : function (accountName) {
                return _.filter(this.getContactsByAccountName(accountName), function (contact) {
                    return contact.hasPhoneNumber;
                });
            },
            getContactsHasPhoneNumberByGroupdId : function (groupId) {
                return _.filter(this.getContactsByGroupId(groupId), function (contact) {
                    return contact.hasPhoneNumber;
                });
            },
            getContactsHasPhoneNumberByGroupdIdAndAccountName : function (groupId, accountName) {
                return _.filter(this.getContactsHasPhoneNumberByGroupdId(groupId), function (contact) {
                    return contact.get('account_name') === accountName;
                });
            },
            getContactsStarred : function () {
                return this.filter(function (contact) {
                    return contact.isStarred;
                });
            },
            getContactsStarredByAccountName : function (accountName) {
                return _.filter(this.getContactsByAccountName(accountName), function (contact) {
                    return contact.isStarred;
                });
            },
            getContactsStarredByGroupdId : function (groupId) {
                return _.filter(this.getContactsByGroupId(groupId), function (contact) {
                    return contact.isStarred;
                });
            },
            getContactsStarredByGroupdIdAndAccountName : function (groupId, accountName) {
                return _.filter(this.getContactsStarredByGroupdId(groupId), function (contact) {
                    return contact.get('account_name') === accountName;
                });
            },
            generateNewContact : function () {
                return new ContactModel({
                    id : '',
                    account_name : '',
                    name : {
                        id : '',
                        display_name : ''
                    },
                    nickname : [{
                        id : '',
                        name : ''
                    }],
                    phone : [{
                        id : '',
                        type : 2,
                        number : '',
                        label : ''
                    }],
                    email : [{
                        id : '',
                        type : 1,
                        address : '',
                        label : ''
                    }],
                    IM : [{
                        id : '',
                        protocol : 4,
                        data : '',
                        label : ''
                    }],
                    address : [{
                        id : '',
                        type : 1,
                        formatted_address : '',
                        label : ''
                    }],
                    organization : [{
                        id : '',
                        type : 1,
                        company : '',
                        label : ''
                    }],
                    note : [{
                        id : '',
                        note : ''
                    }]
                });
            },
            containsReadOnly : function (ids) {
                var flag = false;
                var contact;
                var i;
                for (i = ids.length; i--; undefined) {
                    contact = this.get(ids[i]);
                    if (contact && contact.isReadOnly) {
                        flag = true;
                        break;
                    }
                }
                return flag;
            },
            generateMergeModel : function (ids) {
                var data = {
                    id : '',
                    mergeIds : ids,
                    merge : true
                };

                var template = EditorConfig.CONTACT_DATA_TEMPLATE;
                var contacts = _.map(ids, function (id) {
                    return this.get(id);
                }, this);

                contacts = _.filter(contacts, function (contact) {
                    return !contact.isReadOnly;
                });

                if (contacts.length > 0) {
                    var properties = [];
                    var prop;
                    for (prop in template) {
                        if (template.hasOwnProperty(prop)) {
                            _.each(contacts, function (contact) {
                                var contactData = contact.toJSON();

                                // Remove phone is_primary property for merge
                                if (contactData.phone && contactData.phone.length > 0) {
                                    var phone = _.map(contactData.phone, function (p) {
                                        delete p.is_primary;
                                        return p;
                                    });

                                    contactData.phone = phone;
                                }

                                if (!_.isArray(template[prop])) {
                                    if (prop === 'account_name' ||
                                            prop === 'account_type') {
                                        if (!contact.isReadOnly &&
                                                !data.account_name &&
                                                !data.account_type) {
                                            if (contactData.account_name &&
                                                    contactData.account_type) {
                                                data.account_name = contactData.account_name;
                                                data.account_type = contactData.account_type;
                                            }
                                        }
                                    } else {
                                        data[prop] = data[prop] || contactData[prop];
                                    }
                                } else {
                                    var i = 0;
                                    var j = 0;
                                    var oldValue;
                                    var newValue;
                                    var temp = [];

                                    if (contactData[prop]) {
                                        for (i = 0; i < contactData[prop].length; i++) {
                                            oldValue = contactData[prop][i];
                                            oldValue.id = '';

                                            for (j = 0; j < properties.length; j++) {
                                                newValue = properties[i];

                                                if (_.isEqual(oldValue, newValue)) {
                                                    break;
                                                }
                                            }

                                            if (j === properties.length) {
                                                temp.push(contactData[prop][i]);
                                            }
                                        }
                                    }

                                    properties = properties.concat(temp);
                                }
                            }, this);

                            if (_.isArray(template[prop])) {
                                data[prop] = properties;
                                properties = [];
                            }
                        }
                    }
                }

                if (data.note.length > 1) {
                    data.note.length = 1;
                }
                if (data.photo.length > 1) {
                    data.photo.length = 1;
                }
                if (data.nickname.length > 1) {
                    data.nickname.length = 1;
                }

                data.group = [];
                data.starred = 0;
                data.id = '';

                return new ContactModel(data);
            },
            getAll : function () {
                return this.models;
            }
        });

        var contactsCollection;

        var factory = _.extend({
            getInstance : function () {
                if (!contactsCollection) {
                    contactsCollection = new ContactsCollection();
                    contactsCollection.trigger('update');

                    contactsCollection.on('refresh', function (contactsCollection) {
                        var pimCollection = PIMCollection.getInstance();
                        pimCollection.get(7).set({
                            count : contactsCollection.models.length
                        });

                        pimCollection.get(8).set({
                            count : contactsCollection.getContactsHasPhoneNumber().length
                        });

                        pimCollection.get(9).set({
                            count : contactsCollection.getContactsStarred().length
                        });
                    });
                }
                return contactsCollection;
            },
            getClass : function () {
                return ContactsCollection;
            }
        });

        return factory;
    });
}(this));
