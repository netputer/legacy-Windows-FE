/*global console, define*/
(function (window) {
    define([
        'backbone',
        'doT',
        'jquery',
        'underscore',
        'Log',
        'Device',
        'Configuration',
        'ui/TemplateFactory',
        'ui/SmartList',
        'ui/AlertWindow',
        'ui/MenuButton',
        'ui/BatchActionWindow',
        'utilities/StringUtil',
        'Internationalization',
        'contact/collections/ContactsCollection',
        'contact/collections/AccountCollection',
        'contact/views/ContactItemView',
        'contact/views/AddGroupWindowView',
        'contact/views/ContactsListView',
        'contact/ContactService',
        'message/views/MessageModuleView'
    ], function (
        Backbone,
        doT,
        $,
        _,
        log,
        Device,
        CONFIG,
        TemplateFactory,
        SmartList,
        AlertWindow,
        MenuButton,
        BatchActionWindow,
        StringUtil,
        i18n,
        ContactsCollection,
        AccountCollection,
        ContactItemView,
        AddGroupWindowView,
        ContactsListView,
        ContactService,
        MessageModuleView
    ) {
        console.log('BatchContactsView - File loaded.');

        var CLASS_MAPPING = {
            CONTACTS_LIST_CTN : '.w-contact-batch-contacts-list-ctn'
        };

        var contactList;

        var contactsCollection;

        var accountCollection;

        var groupButton;

        var BatchContactsView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('contact', 'batch-contacts')),
            className : 'w-contact-batch-contacts vbox',
            initialize : function () {
                Device.on('change:isConnected', this.setButtonState, this);
            },
            render : function () {
                this.$el.html(this.template({}));

                return this;
            },
            buildGroupsButton : function () {
                if (!accountCollection) {
                    accountCollection = AccountCollection.getInstance();
                }

                var items = [];

                var readOnlyAccounts = [];
                _.each(contactList.currentModels, function (contact) {
                    var tempAccount = accountCollection.filter(function (account) {
                        return account.get('name') === contact.get('account_name') &&
                                account.get('type') === contact.get('account_type') &&
                                account.get('read_only');
                    })[0];
                    if (tempAccount !== undefined &&
                            _.pluck(readOnlyAccounts, 'id').indexOf(tempAccount.id) < 0) {
                        readOnlyAccounts.push(tempAccount);
                    }
                });

                accountCollection.each(function (account) {
                    if (!account.get('read_only') ||
                            (account.get('read_only') &&
                            readOnlyAccounts.length === 1 &&
                            account.get('id') === readOnlyAccounts[0].get('id'))) {
                        var groups = accountCollection.getGroupsByAccount(account.id);

                        if (groups.length > 0 || !account.get('read_only')) {
                            if (items.length > 0) {
                                items.push({
                                    type : 'hr'
                                });
                            }

                            items.push({
                                type : 'group',
                                name : account.get('id'),
                                label : account.get('displayName')
                            });

                            groups.each(function (group) {
                                items.push({
                                    type : 'checkbox',
                                    name : group.get('id'),
                                    label : group.get('title'),
                                    checked : _.find(contactList.currentModels, function (contact) {
                                        return !contact.isInGroup(group.get('account_name'), group.id);
                                    }) === undefined,
                                    value : group.get('id')
                                });
                            }, this);

                            if (!account.get('read_only')) {
                                items.push({
                                    type : 'link',
                                    label : i18n.contact.ADD_GROUP,
                                    action : function () {
                                        var addGroupWindowView = AddGroupWindowView.getInstance();
                                        addGroupWindowView.show(account);
                                        addGroupWindowView.on('addNewGroup', function (groupId) {
                                            this.batchGroupAsync(groupId, true);
                                        }, this);
                                    }.bind(this)
                                });
                            }
                        }
                    }
                }, this);

                if (!groupButton) {

                    groupButton = new MenuButton({
                        label : i18n.contact.GROUP,
                        items : items
                    });

                    groupButton.on('select', function (data) {
                        this.batchGroupAsync(data.value, groupButton.menu.$('input[type="checkbox"][name="' + data.name + '"]')[0].checked);
                    }, this);

                    this.$('.actions').append(groupButton.render().$el.addClass('button-group'));
                } else {
                    groupButton.items = items;
                }
            },
            batchGroupAsync : function (targetGroupId, action) {
                var targertAccount = accountCollection.getAccountByGroupId(targetGroupId);

                var sourceModels = contactList.currentModels;

                var willMoveContacts = _.filter(sourceModels, function (contact) {
                    return contact.get('account_name') !== targertAccount.get('name') ||
                            contact.get('account_type') !== targertAccount.get('type');
                });

                var batchGroupContacts = function () {
                    var session = _.uniqueId('contact.batch.group_');

                    var batchActionWindow = new BatchActionWindow({
                        session : session,
                        progressText : i18n.contact.CONTACT_BATCH_GROUP_PROGRESS,
                        cancelUrl : CONFIG.actions.CONTACT_CANCEL,
                        total : sourceModels.length,
                        successText : i18n.contact.CONTACT_BATCH_GROUP_SUCCESS
                    });

                    batchActionWindow.show();

                    var contactIds = _.map(sourceModels, function (contact) {
                        return contact.get('id');
                    });

                    contactsCollection.batchGroupAsync(contactIds, targetGroupId, action, session).always(function (resp) {
                        if (resp.state_code !== 200 ||
                                (resp.body && resp.body.failed && resp.body.failed.length > 0)) {
                            groupButton.menu.$('input[type="checkbox"][value="' + targetGroupId + '"]').prop({
                                checked : false
                            });
                        }
                    }.bind(this));
                }.bind(this);

                if (willMoveContacts.length > 0) {
                    var alertText;

                    if (willMoveContacts.length > 1) {
                        alertText = StringUtil.format(i18n.contact.ALERT_BATCH_MOVE_GROUP,
                                                        willMoveContacts[0].get('name').display_name || i18n.contact.UNNAMED_CONTACT,
                                                        willMoveContacts.length, targertAccount.get('displayName'));
                    } else if (willMoveContacts.length === 1) {
                        alertText = StringUtil.format(i18n.contact.ALERT_BATCH_MOVE_GROUP_SINGLE,
                                                        willMoveContacts[0].get('name').display_name || i18n.contact.UNNAMED_CONTACT,
                                                        targertAccount.get('displayName'));
                    }

                    var disposableAlert = new AlertWindow({
                        draggable : true,
                        disposableName : 'contact-group',
                        disposableChecked : false,
                        buttonSet : 'yes_no',
                        $bodyContent : $(alertText)
                    });
                    disposableAlert.on('button_yes', batchGroupContacts, this);
                    disposableAlert.on('button_no', function () {
                        groupButton.menu.$('input[type="checkbox"][value="' + targetGroupId + '"]').prop({
                            checked : false
                        });
                    });

                    disposableAlert.show();
                } else {
                    batchGroupContacts();
                }
            },
            update : function (ids) {
                contactsCollection = contactsCollection || ContactsCollection.getInstance();

                this.$('.title .count').html(StringUtil.format(i18n.contact.BATCH_CONTACT_TITLE, ids.length));

                if (!contactList) {
                    contactList = new SmartList({
                        itemView : ContactItemView.getClass(),
                        dataSet : [{
                            name : 'default',
                            getter : function () {
                                return _.map(ids, function (id) {
                                    return contactsCollection.get(id);
                                });
                            }
                        }],
                        keepSelect : false,
                        itemHeight : 45,
                        selectable : false,
                        listenToCollection : contactsCollection
                    });
                    this.$(CLASS_MAPPING.CONTACTS_LIST_CTN).append(contactList.render().$el);

                    contactList.on('switchSet', this.buildGroupsButton);
                } else {
                    contactList.switchSet('default', function () {
                        return _.map(ids, function (id) {
                            return contactsCollection.get(id);
                        });
                    });
                    contactList.deselectAll();
                }
                this.buildGroupsButton();
                this.setButtonState();
            },
            setButtonState : function () {
                var readOnlyContactInSelected = (function () {
                    var flag = false;
                    var selected = contactList.currentModels;

                    var i;
                    var contact;
                    for (i = selected.length; i--; undefined) {
                        contact = contactsCollection.get(selected[i]);
                        if (contact) {
                            flag = contact.get('read_only');

                            if (flag) {
                                break;
                            }
                        }
                    }

                    return flag;
                }());

                this.$('.button-delete').prop({
                    disabled : !Device.get('isConnected')
                });

                this.$('.button-merge').prop({
                    disabled : !Device.get('isConnected') || readOnlyContactInSelected
                });

                this.$('.button-send').prop({
                    disabled : !Device.get('isConnected')
                });

                this.$('.button-group').prop({
                    disabled : !Device.get('isConnected')
                });

                if (!Device.get('isConnected')) {
                    if (groupButton !== undefined) {
                        groupButton.menu.$el.hide();
                    }
                }
            },
            clickButtonSend : function () {
                var selected = _.pluck(contactList.currentModels, 'id');

                var receivers = _.map(selected, function (id) {
                    return contactsCollection.get(id);
                });

                MessageModuleView.sendMessage({
                    receivers : receivers
                });
            },
            clickButtonDeselect : function () {
                ContactsListView.getInstance().list.deselectAll();
            },
            clickItemButtonClose : function (evt) {
                var id = $(evt.currentTarget).data('id').toString();
                ContactsListView.getInstance().list.removeSelect(id);
            },
            events : {
                'click .button-send' : 'clickButtonSend',
                'click .button-deselect' : 'clickButtonDeselect',
                'click .w-contact-list-item .button-close' : 'clickItemButtonClose'
            }
        });

        var batchContactsView;

        var factory = _.extend({
            getInstance : function () {
                if (!batchContactsView) {
                    batchContactsView = new BatchContactsView();
                }
                return batchContactsView;
            }
        });

        return factory;
    });
}(this));
