/*global define*/
(function (window, document) {
    define([
        'backbone',
        'underscore',
        'doT',
        'Internationalization',
        'utilities/StringUtil',
        'ui/UIHelper',
        'ui/TemplateFactory',
        'ui/Panel',
        'ui/behavior/ButtonSetMixin',
        'ui/SmartList',
        'ui/BaseListItem',
        'message/views/ContactSuggestionView',
        'message/views/MonitorItemView',
        'contact/views/AccountSelectorView',
        'contact/views/GroupSelectorView',
        'contact/collections/AccountCollection',
        'contact/collections/ContactMultiNumbersCollection'
    ], function (
        Backbone,
        _,
        doT,
        i18n,
        StringUtil,
        UIHelper,
        TemplateFactory,
        Panel,
        ButtonSetMixin,
        SmartList,
        BaseListItem,
        ContactSuggestionView,
        MonitorItemView,
        AccountSelectorView,
        GroupSelectorView,
        AccountCollection,
        ContactMultiNumbersCollection
    ) {
        console.log('BatchContactsSelectorView - File loaded.');

        var EventsMapping = UIHelper.EventsMapping;

        var contactMultiNumbersCollection;
        var accountCollection;

        var ContactItemView = BaseListItem.extend({
            className : 'w-message-contact-selector-list-item hbox',
            template : doT.template(TemplateFactory.get('message', 'contact-list-item')),
            render : function () {
                this.$el.html(this.template(this.model.toJSON()));
                return this;
            },
            clickItem : function () {
                this.$('.item-checker').click();
            },
            events : {
                'click' : 'clickItem'
            }
        });

        var FooterView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('message', 'contact-selector-footer')),
            render : function () {
                this.$el.html(this.template({}));
                return this;
            }
        });

        var footerView;

        var BodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('message', 'contact-seletor-body')),
            className : 'w-message-contact-selector-body',
            initialize : function () {
                contactMultiNumbersCollection = ContactMultiNumbersCollection.getInstance();

                accountCollection = accountCollection || AccountCollection.getInstance();
            },
            addSelector : function () {
                this.accountSelectorView = AccountSelectorView.getInstance({
                    hasNumber : true
                });

                this.groupSelectorView = GroupSelectorView.getInstance({
                    enableManagement : false
                });

                this.$('.selector-ctn').append(this.accountSelectorView.render().$el)
                                        .append(this.groupSelectorView.render().$el);


                var accountSelectHandler;
                var groupSelectHandler;
                accountSelectHandler = function (data) {
                    this.stopListening(this.groupSelectorView, 'select', groupSelectHandler);
                    this.contactList.toggleEmptyTip(this.contactList.currentModels.length === 0);

                    if (data.value !== this.groupSelectorView.accountId || data.value === 'all') {
                        this.groupSelectorView.update(data.value, 'all');
                    } else {
                        this.groupSelectorView.update(data.value, this.groupSelectorView.groupId);
                    }
                    this.buildList();
                    this.listenTo(this.groupSelectorView, 'select', groupSelectHandler);
                };

                groupSelectHandler = function (data) {
                    this.stopListening(this.accountSelectorView, 'select', accountSelectHandler);
                    if (data.value !== 'all') {
                        this.accountSelectorView.selectByGroupId(data.value);
                    }
                    this.buildList();
                    this.listenTo(this.accountSelectorView, 'select', accountSelectHandler);
                };

                this.listenTo(this.accountSelectorView, 'select', accountSelectHandler);

                this.listenTo(this.groupSelectorView, 'select', groupSelectHandler);
            },
            buildList : _.debounce(function () {
                var accountId = this.accountSelectorView.accountId;
                var groupId = this.groupSelectorView.groupId;

                var getter;

                if (groupId === 'all') {
                    if (accountId === 'all') {
                        getter = contactMultiNumbersCollection.getAll;
                    } else {
                        getter = function () {
                            return contactMultiNumbersCollection.getContactsByAccountName(accountCollection.get(accountId).get('name'));
                        };
                    }
                } else {
                    if (accountId === 'all') {
                        getter = function () {
                            return contactMultiNumbersCollection.getContactsByGroupId(groupId);
                        };
                    } else {
                        getter = function () {
                            return contactMultiNumbersCollection.getContactsByGroupIdAndAccountName(groupId, accountCollection.get(accountId).get('name'));
                        };
                    }
                }
                this.contactList.switchSet('default', getter);
            }),
            addSuggestion : function () {
                this.contactSuggestionView = ContactSuggestionView.getInstance({
                    $host : this.$('.searchbox')
                });

                this.listenTo(this.contactSuggestionView, 'selectContact', this.addContact);
            },
            addContctList : function () {
                this.contactList = new SmartList({
                    itemView : ContactItemView,
                    dataSet : [{
                        name : 'default',
                        getter : contactMultiNumbersCollection.getContactsHasPhoneNumber
                    }],
                    keepSelect : true,
                    $observer : this.$('.w-message-contact-selector-ctrl .check-select-all'),
                    itemHeight : 31,
                    selectable : false,
                    listenToCollection : contactMultiNumbersCollection,
                    emptyTip : i18n.message.NO_CONTACT_UNDER_THIS_ACCOUNT
                });

                this.$('.list-ctn').append(this.contactList.render().$el);

                if (contactMultiNumbersCollection.loading) {
                    var refreshHandler = function () {
                        this.contactList.switchSet('default', contactMultiNumbersCollection.getContactsHasPhoneNumber);
                    };
                    contactMultiNumbersCollection.once('refresh', refreshHandler);
                }

                var viewList = [];

                var addItem = function (ids) {
                    var fragment = document.createDocumentFragment();
                    _.each(ids, function (id) {
                        var monitorItemView = MonitorItemView.getInstance({
                            model : contactMultiNumbersCollection.get(id)
                        });
                        fragment.appendChild(monitorItemView.render().$el[0]);

                        viewList.push(monitorItemView);

                        var deleteHandler = function (contact) {
                            this.contactList.removeSelect(contact.id);
                            monitorItemView.off('delete', deleteHandler);
                        };

                        monitorItemView.on('delete', deleteHandler, this);
                    }, this);

                    this.$('.selector-monitor').append(fragment);
                };

                var removeItem = function (ids) {
                    _.each(ids, function (id) {
                        _.find(viewList, function (view, index) {
                            if (view.model.id === id) {
                                viewList.splice(index, 1)[0].off().remove();
                                return true;
                            }
                        });
                    });
                };

                this.listenTo(this.contactList, 'select:change', function () {
                    var existed = _.map(viewList, function (item) {
                        return item.model.id;
                    });

                    var newIds = this.contactList.getAllSelected();
                    var removed = _.difference(existed, newIds);
                    var added = _.difference(newIds, existed);
                    if (removed.length > 0) {
                        removeItem.call(this, removed);
                    }

                    if (addItem.length > 0) {
                        addItem.call(this, added);
                    }

                    footerView.$('.count').html(StringUtil.format(i18n.message.CONTACT_SELECT, this.contactList.getAllSelected().length));
                });
            },
            addContact : function (contact) {
                this.contactList.addSelect(contact.get('id'));
            },
            render : function () {
                this.delegateEvents();

                this.$el.html(this.template({}));

                this.addSelector();
                this.addSuggestion();
                this.addContctList();

                this.trigger(EventsMapping.RENDERED);

                return this;
            },
            clickButtonSelectAll : function () {
                this.contactList.selectAll();
            },
            remove : function () {
                this.contactSuggestionView.remove();
                this.contactList.remove();
                this.accountSelectorView.remove();
                BodyView.__super__.remove.call(this);
            },
            events : {
                'click .button-select-all' : 'clickButtonSelectAll'
            }
        });

        var bodyView;

        var BatchContactsSelectorView = Panel.extend({
            initialize : function () {
                BatchContactsSelectorView.__super__.initialize.apply(this, arguments);

                this.title = i18n.message.ADD_CONTACT;
                this.width = 410;

                this.on(EventsMapping.SHOW, function () {
                    footerView = new FooterView();
                    this.$('.w-ui-window-footer-monitor').append(footerView.render().$el);

                    bodyView = new BodyView();
                    this.$bodyContent = bodyView.render().$el;

                    this.once(EventsMapping.REMOVE, bodyView.remove, bodyView);
                    this.once(EventsMapping.REMOVE, footerView.remove, footerView);
                }, this);
            },
            getSelectedContacts : function () {
                var contacts = [];
                _.each(bodyView.contactList.selected, function (id) {
                    contacts.push(contactMultiNumbersCollection.get(id));
                });
                return contacts;
            },
            render : function () {
                _.extend(this.events, BatchContactsSelectorView.__super__.events);
                BatchContactsSelectorView.__super__.render.call(this);
            },
            clickButtonClearAll : function () {
                bodyView.contactList.erase();
            },
            events : {
                'click .button-clear-all' : 'clickButtonClearAll'
            }
        });

        var factory = _.extend({
            getInstance : function () {
                return new BatchContactsSelectorView({
                    buttonSet : ButtonSetMixin.BUTTON_SET.YES_NO
                });
            }
        });

        return factory;
    });
}(this, this.document));
