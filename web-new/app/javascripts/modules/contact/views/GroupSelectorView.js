/*global define*/
(function (window) {
    define([
        'underscore',
        'ui/MenuButton',
        'Internationalization',
        'contact/collections/AccountCollection',
        'contact/views/GroupManagerView'
    ], function (
        _,
        MenuButton,
        i18n,
        AccountCollection,
        GroupManagerView
    ) {
        console.log('GroupSelectorView - File loaded.');

        var UNGROUP_REG = new RegExp(/ungroup\[\w+\]/);

        var accountCollection;
        var groupManagerView;

        var parseGroupName = function (groupId) {
            var groupName;
            if (UNGROUP_REG.test(groupId)) {
                groupName = i18n.contact.UNGROUP_CONTACT_LABEL;
            } else {
                groupName = groupId === 'all' ?
                        i18n.contact.GROUP_ALL : accountCollection.getGroupById(groupId).get('title');
            }
            return groupName;
        };

        var GroupSelectorView = MenuButton.extend({
            className : MenuButton.prototype.className + ' w-contact-group-selector',
            initialize : function () {
                GroupSelectorView.__super__.initialize.apply(this, arguments);

                var accountId = 'all';
                var groupId = 'all';
                var inputName = 'group' + _.uniqueId('_input_');
                var enableAllLabel = true;
                var enableManagement = true;
                Object.defineProperties(this, {
                    accountId : {
                        set : function (value) {
                            accountId = value;
                        },
                        get : function () {
                            return accountId;
                        }
                    },
                    groupId : {
                        set : function (value) {
                            groupId = value;
                        },
                        get : function () {
                            return groupId;
                        }
                    },
                    inputName : {
                        get : function () {
                            return inputName;
                        }
                    },
                    enableAllLabel : {
                        set : function (value) {
                            enableAllLabel = value;
                        },
                        get : function () {
                            return enableAllLabel;
                        }
                    },
                    enableManagement : {
                        set : function (value) {
                            enableManagement = value;
                        },
                        get : function () {
                            return enableManagement;
                        }
                    }
                });

                var options = this.options || {};
                var key;
                for (key in options) {
                    if (options.hasOwnProperty(key)) {
                        this[key] = options[key];
                    }
                }

                accountCollection = AccountCollection.getInstance();

                if (accountCollection.loading || accountCollection.syncing) {
                    this.label = i18n.contact.GROUP_LOADING;
                } else {
                    this.addItems();
                }

                accountCollection.on('refresh', function (accountCollection) {
                    this.addItems();
                    this.render();
                }, this);

                this.on('select', function (data) {
                    this.groupId = data.value;
                    this.label = parseGroupName.call(this, data.value);
                }, this);
            },
            render : function () {
                GroupSelectorView.__super__.render.apply(this, arguments);

                this.$el.prop({
                    disabled : accountCollection.loading || accountCollection.syncing
                });

                return this;
            },
            addItems : function () {
                if (accountCollection.loading || accountCollection.syncing) {
                    return;
                }

                var items = [];

                if (this.enableAllLabel) {
                    this.label = parseGroupName.call(this, this.groupId);
                    items.push({
                        type : 'radio',
                        name : this.inputName,
                        value : 'all',
                        label : i18n.contact.GROUP_ALL,
                        checked : this.groupId === 'all'
                    });
                    items.push({
                        type : 'hr'
                    });
                }

                if (this.accountId === 'all') {
                    accountCollection.each(function (account) {
                        if (items.length > 2) {
                            items.push({
                                type : 'hr'
                            });
                        }

                        var groupsCollection = accountCollection.getGroupsByAccount(account.get('id'));
                        if (groupsCollection.length > 0 ||
                                account.get('ungroup_contacts') > 0) {
                            items.push({
                                type : 'group',
                                name : account.get('id'),
                                label : account.get('displayName')
                            });

                            groupsCollection.each(function (group) {
                                var label = group.get('title') + ' (';

                                label += group.get('contacts') + ')';

                                items.push({
                                    type : 'radio',
                                    name : this.inputName,
                                    value : group.get('id'),
                                    label : label,
                                    checked : this.groupId === group.get('id')
                                });
                            }, this);

                            if (account.get('ungroup_contacts') > 0) {
                                items.push({
                                    type : 'radio',
                                    name : this.inputName,
                                    value : 'ungroup[' + account.get('id') + ']',
                                    label : i18n.contact.UNGROUP_CONTACT_LABEL + ' (' + account.get('ungroup_contacts') + ')',
                                    checked : UNGROUP_REG.test(this.groupId)
                                });
                            }
                        }
                    }, this);
                } else {
                    accountCollection.getGroupsByAccount(this.accountId).each(function (group) {
                        var label = group.get('title') + ' (';

                        label += group.get('contacts') + ')';

                        items.push({
                            type : 'radio',
                            name : this.inputName,
                            value : group.get('id'),
                            label : label,
                            checked : this.groupId === group.get('id')
                        });
                    }, this);
                    var account = accountCollection.get(this.accountId);
                    if (account.get('ungroup_contacts') > 0) {
                        items.push({
                            type : 'radio',
                            name : this.inputName,
                            value : 'ungroup[' + account.get('id') + ']',
                            label : i18n.contact.UNGROUP_CONTACT_LABEL + ' (' + account.get('ungroup_contacts') + ')',
                            checked : UNGROUP_REG.test(this.groupId)
                        });
                    }

                    if (!this.enableAllLabel) {
                        this.trigger('select', items[0]);
                    }
                }
                if (this.enableManagement) {
                    items.push({
                        type : 'hr'
                    });

                    items.push({
                        type : 'link',
                        label : i18n.contact.MANAGE_GROUP,
                        action : function () {
                            groupManagerView = GroupManagerView.getInstance();
                            groupManagerView.setCurAccountId(this.accountId);
                            groupManagerView.show();
                        }.bind(this)
                    });
                }

                this.items = items;
            },
            update : function (accountId, groupId) {
                this.accountId = accountId;

                if (groupId !== 'all' &&
                        !UNGROUP_REG.test(groupId)) {
                    this.groupId = accountCollection.get(accountId).containGroup(groupId) ? groupId : 'all';
                } else {
                    this.groupId = groupId;
                }

                this.menu.hide();

                this.addItems();
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new GroupSelectorView(args);
            }
        });

        return factory;
    });
}(this));
