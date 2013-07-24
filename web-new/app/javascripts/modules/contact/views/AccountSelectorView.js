/*global define*/
(function (window) {
    define([
        'underscore',
        'Internationalization',
        'ui/MenuButton',
        'contact/collections/AccountCollection',
        'contact/collections/ContactMultiNumbersCollection',
        'contact/collections/ContactsCollection'
    ], function (
        _,
        i18n,
        MenuButton,
        AccountCollection,
        ContactMultiNumbersCollection,
        ContactsCollection
    ) {
        console.log('AccountSelectorView - File loaded.');

        var accountCollection;

        var AccountSelectorView = MenuButton.extend({
            className : MenuButton.prototype.className + ' w-contact-account-selector',
            initialize : function () {
                AccountSelectorView.__super__.initialize.apply(this, arguments);

                var hasNumber = false;
                var accountId = 'all';
                var disableAllLabel = false;
                var displayReadOnly = true;
                var inputName = 'account' + _.uniqueId('_input_');
                Object.defineProperties(this, {
                    hasNumber : {
                        set : function (value) {
                            hasNumber = Boolean(value);
                        },
                        get : function () {
                            return hasNumber;
                        }
                    },
                    accountId : {
                        set : function (value) {
                            accountId = value;
                        },
                        get : function () {
                            return accountId;
                        }
                    },
                    disableAllLabel : {
                        set : function (value) {
                            disableAllLabel = Boolean(value);
                        },
                        get : function () {
                            return disableAllLabel;
                        }
                    },
                    displayReadOnly : {
                        set : function (value) {
                            displayReadOnly = Boolean(value);
                        },
                        get : function () {
                            return displayReadOnly;
                        }
                    },
                    inputName : {
                        get : function () {
                            return inputName;
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
                    this.label = i18n.contact.ACCOUNT_LOADING;
                } else {
                    this.addItems();
                }

                accountCollection.on('refresh', function (accountCollection) {
                    this.addItems();
                    this.render();
                }, this);

                this.menu.on('select', function (data) {
                    var account = accountCollection.get(data.value);

                    this.accountId = data.value;

                    this.label = data.value === 'all' ?
                                    i18n.contact.ACCOUNT_ALL : accountCollection.get(data.value).get('displayName');

                    this.trigger('selectAccount', account);
                }, this);
            },
            render : function () {
                AccountSelectorView.__super__.render.apply(this, arguments);

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

                if (!this.disableAllLabel) {
                    this.label = i18n.contact.ACCOUNT_ALL;

                    items.push({
                        type : 'radio',
                        name : this.inputName,
                        value : 'all',
                        label : i18n.contact.ACCOUNT_ALL + ' (' + (this.hasNumber ? ContactMultiNumbersCollection.getInstance().getContactsHasPhoneNumber().length : ContactsCollection.getInstance().length) + ')',
                        checked : this.accountId === 'all'
                    });
                }

                accountCollection.each(function (account) {
                    if (this.displayReadOnly
                            || (!this.displayReadOnly && !account.get('read_only'))) {
                        var label = account.get('displayName') + ' (';

                        if (this.hasNumber) {
                            label += ContactMultiNumbersCollection.getInstance().getContactsHasPhoneNumberByAccountName(account.get('name')).length;
                        } else {
                            label += account.get('contacts');
                        }

                        label += ')';

                        if (items.length === 0) {
                            this.label = account.get('displayName');
                        }

                        items.push({
                            type : 'radio',
                            name : this.inputName,
                            value : account.get('id'),
                            label : label,
                            checked : (items.length === 0 && this.disableAllLabel)
                                        || account.get('id') === this.accountId
                        });

                        if (items[items.length - 1].checked) {
                            this.label = items[items.length - 1].label;
                        }
                    }
                }, this);

                var selectedAccount = _.filter(items, function (item) {
                    return item.checked;
                })[0];

                this.accountId = selectedAccount ? selectedAccount.value : 'all';

                this.items = items;
            },
            selectByGroupId : function (groupId) {
                var ungroupReg = new RegExp(/ungroup\[\w+\]/);
                if (ungroupReg.test(groupId)) {
                    groupId.replace(/(\[)(\w+)(\])/, function (arg1, arg2, id) {
                        this.accountId = id;
                    }.bind(this));
                } else {
                    this.accountId = accountCollection.getAccountByGroupId(groupId).get('id');
                }

                var $targetItem = this.menu.$('input[type="radio"][value="' + this.accountId + '"]');

                $targetItem.prop({
                    checked : true
                });

                var targetItem = _.filter(this.items, function (item) {
                    return item.value === this.accountId;
                }.bind(this))[0];

                this.menu.trigger('select', {
                    name : targetItem.name,
                    value : targetItem.value,
                    label : targetItem.label
                });
            },
            selectByAccountId : function (accountId) {
                var $targetItem;
                if (accountId !== 'all') {
                    this.accountId = accountId;
                    $targetItem = this.menu.$('input[type="radio"][value="' + accountId + '"]');
                } else {
                    if (this.disableAllLabel) {
                        $targetItem = this.menu.$('input[type="radio"]:first');
                        accountId = $targetItem.attr('value');
                    } else {
                        $targetItem = this.menu.$('input[type="radio"][value="' + accountId + '"]');
                    }
                }

                if ($targetItem.length > 0) {
                    this.accountId = accountId;

                    $targetItem.prop({
                        checked : true
                    });

                    this.menu.$('input[type="radio"]:not([value="' + accountId + '"])').prop({
                        checked : false
                    });

                    var targetItem = _.filter(this.items, function (item) {
                        return item.value === this.accountId;
                    }.bind(this))[0];

                    this.menu.trigger('select', {
                        name : targetItem.name,
                        value : targetItem.value,
                        label : targetItem.label
                    });
                }
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new AccountSelectorView(args);
            }
        });

        return factory;
    });
}(this));
