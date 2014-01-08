/*global define*/
(function (window, document) {
    define([
        'backbone',
        'doT',
        'jquery',
        'underscore',
        'ui/TemplateFactory',
        'ui/SmartList',
        'Internationalization',
        'Device',
        'utilities/StringUtil',
        'contact/collections/ContactsCollection',
        'contact/collections/AccountCollection',
        'contact/views/ContactItemView',
        'contact/views/ContactContextMenu'
    ], function (
        Backbone,
        doT,
        $,
        _,
        TemplateFactory,
        SmartList,
        i18n,
        Device,
        StringUtil,
        ContactsCollection,
        AccountCollection,
        ContactItemView,
        ContactContextMenu
    ) {
        console.log('ContactsListView - File loaded. ');

        var hidePinyinHint = _.debounce(function () {
            this.$('.pinyin-hint').hide();
        }, 1000);

        var contactsCollection;
        var accountCollection;

        var contactsList;

        var currentTab = 'all';
        var currentAccountId = 'all';
        var currentGroupId = 'all';

        var searchResult = [];
        var searchKeyword = '';

        var ContactsListView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('contact', 'list-ctn')),
            className : 'w-contact-list vbox',
            initialize : function () {
                Object.defineProperties(this, {
                    selected : {
                        get : function () {
                            return contactsList ? contactsList.selected : [];
                        }
                    },
                    currentAccountId : {
                        get : function () {
                            return currentAccountId;
                        }
                    },
                    currentGroupId : {
                        get : function () {
                            return currentGroupId;
                        }
                    },
                    list : {
                        get : function () {
                            return contactsList;
                        }
                    }
                });

                accountCollection = AccountCollection.getInstance();
                contactsCollection = ContactsCollection.getInstance();

                this.bindContactsCollectionEvents();

                $(document).on('keydown', function (evt) {
                    if (window.SnapPea.CurrentModule === 'contact' &&
                            $('input:focus, textarea:focus').length === 0) {
                        var targetChar = String.fromCharCode(evt.keyCode);
                        var targetContact = _.find(contactsList.currentModels, function (contact) {
                            return contact.firstLetter === targetChar;
                        });
                        if (targetContact !== undefined) {
                            contactsList.scrollTo(targetContact);
                            contactsList.on('build', function () {
                                this.showPinyinHint();
                            }, this);
                        }
                    }
                }.bind(this));
            },
            refresh : function (tab, accountId, groupId) {
                currentTab = tab || currentTab;
                currentGroupId = groupId || currentGroupId;
                currentAccountId = accountId || currentAccountId;

                var getter;
                switch (currentTab) {
                case 'all':
                    if (currentGroupId === 'all') {
                        if (currentAccountId === 'all') {
                            getter = contactsCollection.getAll;
                        } else {
                            getter = function () {
                                return contactsCollection.getContactsByAccountName(accountCollection.get(currentAccountId).get('name'));
                            };
                        }
                    } else {
                        if (currentAccountId === 'all') {
                            getter = function () {
                                return contactsCollection.getContactsByGroupId(currentGroupId);
                            };
                        } else {
                            getter = function () {
                                return contactsCollection.getContactsByGroupIdAndAccountName(currentGroupId, accountCollection.get(currentAccountId).get('name'));
                            };
                        }
                    }
                    contactsList.switchSet('default', getter);
                    break;
                case 'starred':
                    if (currentGroupId === 'all') {
                        if (currentAccountId === 'all') {
                            getter = contactsCollection.getContactsStarred;
                        } else {
                            getter = function () {
                                return contactsCollection.getContactsStarredByAccountName(accountCollection.get(currentAccountId).get('name'));
                            };
                        }
                    } else {
                        if (currentAccountId === 'all') {
                            getter = function () {
                                return contactsCollection.getContactsStarredByGroupdId(currentGroupId);
                            };
                        } else {
                            getter = function () {
                                return contactsCollection.getContactsStarredByGroupdIdAndAccountName(currentGroupId, accountCollection.get(currentAccountId).get('name'));
                            };
                        }
                    }
                    contactsList.switchSet('starred', getter);
                    break;
                case 'hasnumber':
                    if (currentGroupId === 'all') {
                        if (currentAccountId === 'all') {
                            getter = contactsCollection.getContactsHasPhoneNumber;
                        } else {
                            getter = function () {
                                return contactsCollection.getContactsHasPhoneNumberByAccountName(accountCollection.get(currentAccountId).get('name'));
                            };
                        }
                    } else {
                        if (currentAccountId === 'all') {
                            getter = function () {
                                return contactsCollection.getContactsHasPhoneNumberByGroupdId(currentGroupId);
                            };
                        } else {
                            getter = function () {
                                return contactsCollection.getContactsHasPhoneNumberByGroupdIdAndAccountName(currentGroupId, accountCollection.get(currentAccountId).get('name'));
                            };
                        }
                    }
                    contactsList.switchSet('hasnumber', getter);
                    break;
                case 'search':
                    contactsList.switchSet('search', function () {
                        return searchResult;
                    });
                    break;
                }
                this.updateHeader();
            },
            bindContactsCollectionEvents : function () {
                contactsCollection.on('syncStart update syncEnd refresh', function () {
                    if (contactsList !== undefined) {
                        contactsList.loading = contactsCollection.loading || contactsCollection.syncing;
                    }
                });

                contactsCollection.on('refresh', function () {
                    this.refresh();
                    this.updateHeader();
                }, this);
            },
            toggleEmptyTip : function () {
                if (contactsCollection.loading || contactsCollection.syncing || Device.get('isFastADB')) {
                    contactsList.toggleEmptyTip(false);
                    return;
                }
                if (contactsList.currentModels.length === 0) {
                    var tip;
                    switch (contactsList.currentSet.name) {
                    case 'default':
                        if (currentAccountId === 'all' && currentGroupId === 'all') {
                            tip = i18n.contact.NON_CONTACT_TEXT_PERMISSION;
                        } else {
                            tip = i18n.contact.NON_CONTACT_TEXT;
                        }
                        break;
                    case 'starred':
                        tip = i18n.contact.NON_STAR_CONTACT_TEXT;
                        break;
                    case 'hasnumber':
                        tip = i18n.contact.NON_PHONE_CONTACT_TEXT;
                        break;
                    }
                    contactsList.emptyTip = tip;
                    contactsList.toggleEmptyTip(true);
                } else {
                    contactsList.toggleEmptyTip(false);
                }
            },
            buildList : function () {
                contactsList = new SmartList({
                    itemView : ContactItemView.getClass(),
                    dataSet : [{
                        name : 'default',
                        getter : contactsCollection.getAll
                    }],
                    enableContextMenu : true,
                    keepSelect : false,
                    itemHeight : 45,
                    $observer : this.options.$observer,
                    listenToCollection : contactsCollection,
                    loading : contactsCollection.loading || contactsCollection.syncing
                });

                this.listenTo(contactsList, 'select:change', function (selected) {
                    this.trigger('select:change', selected);
                });

                this.listenTo(Device, 'change:isFastADB', this.toggleEmptyTip);

                this.$el.append(contactsList.render().$el);

                contactsList.on('switchSet', this.toggleEmptyTip, this);

                contactsList.$('.w-ui-smartlist-scroll-ctn').on('scroll', _.throttle(this.showPinyinHint.bind(this), 15));

                contactsList.on('contextMenu', this.showContextMenu, this);
            },
            showContextMenu : function (selected) {
                var contactContextMenu = ContactContextMenu.getInstance({
                    selected : selected
                });

                contactContextMenu.show();
            },
            showPinyinHint : function () {
                contactsList.once('build', function () {
                    var topItem = contactsList.onScreenItems[0];
                    if (topItem) {
                        this.$('.pinyin-hint').html(topItem.model.firstLetter).show();
                        hidePinyinHint.call(this);
                    }
                }, this);
            },

            render : function () {
                this.$el.html(this.template({}));

                this.buildList();

                this.updateHeader();

                this.$el.append($('<div>').addClass('pinyin-hint'));

                this.toggleEmptyTip();

                return this;
            },
            updateHeader : function () {
                var headerText = '';
                var length = contactsList.currentModels.length;

                if (this.list.currentSetName === 'search') {
                    this.$('.button-return').show();

                    headerText = StringUtil.format(i18n.contact.CONTACT_TIP_PART, searchResult.length, searchKeyword);
                    this.$('.count-tip').html(headerText);
                } else {
                    this.$('.button-return').hide();

                    if (currentGroupId !== 'all') {
                        headerText = StringUtil.format(i18n.contact.CONTACT_GROUP_TEXT, length);
                    } else {
                        if (currentAccountId === 'all') {
                            headerText = StringUtil.format(i18n.contact.CONTACT_ALL_TEXT, length);
                        } else if (accountCollection.get(currentAccountId).isSimAccount) {
                            headerText = i18n.contact.CONTACT_SIM_SELECT_TEXT_1;
                        } else {
                            headerText = StringUtil.format(i18n.contact.CONTACT_ACCOUNT_TEXT, length);
                        }
                    }

                    this.$('.count-tip').html(headerText);
                }
            },
            highlight : function (msg) {
                if (_.pluck(contactsList.currentModels, 'id').indexOf(msg.id) < 0) {
                    this.trigger('select:change', contactsList.selected);
                } else {
                    var contact = contactsCollection.get(msg.id);

                    contactsList.deselectAll({
                        silent : true
                    });

                    contactsList.addSelect(contact.id);
                    contactsList.scrollTo(contact);
                }
            },

            clickButtonReturn : function () {
                this.refresh('all');
                this.trigger('__RETURN_DEFAULT');
            },
            showContactsByKeyword : function (keyword) {
                searchKeyword = keyword;
                contactsCollection.searchContactsAsync(keyword).done(function (resp) {
                    var value = resp.body.result;
                    searchResult = [];

                    searchResult = _.map(value, function (contact) {
                        return contactsCollection.get(contact.id);
                    });

                    this.refresh('search');
                }.bind(this));
            },
            events: {
                'click .button-return' : 'clickButtonReturn'
            }
        });

        var contactsListView;

        var factory = _.extend({
            getInstance : function (args) {
                if (!contactsListView) {
                    contactsListView = new ContactsListView(args);
                }
                return contactsListView;
            }
        });

        return factory;
    });
}(this, this.document));
