/*global define*/
(function (window) {
    define([
        'doT',
        'jquery',
        'underscore',
        'backbone',
        'ui/TemplateFactory',
        'ui/Toolbar',
        'ui/Panel',
        'ui/MenuButton',
        'Device',
        'Log',
        'Internationalization',
        'contact/ExportController',
        'contact/models/ExportContextModel',
        'contact/collections/ContactsCollection',
        'contact/collections/AccountCollection',
        'contact/views/ContactsListView',
        'contact/views/AccountSelectorView',
        'contact/views/GroupSelectorView',
        'contact/views/ContactPanelView',
        'contact/ContactService',
        'main/collections/PIMCollection',
        'contact/ImportController'
    ], function (
        doT,
        $,
        _,
        Backbone,
        TemplateFactory,
        Toolbar,
        Panel,
        MenuButton,
        Device,
        log,
        i18n,
        ExportController,
        ExportContextModel,
        ContactsCollection,
        AccountCollection,
        ContactsListView,
        AccountSelectorView,
        GroupSelectorView,
        ContactPanelView,
        ContactService,
        PIMCollection,
        ImportController
    ) {
        console.log('ContactModuleToolbarView - File loaded.');

        var accountCollection;
        var pimCollection;

        var contactsListView;
        var contactsCollection;

        var accountSelectorView;
        var groupSelectorView;

        var currentAccountId = 'all';
        var currentGroupId = 'all';
        var currentTab = 'all';

        var LABEL_MAPPING = {
            all : i18n.misc.NAV_CONTACT_ALL,
            hasnumber : i18n.misc.NAV_CONTACT_HAS_PHONE,
            starred : i18n.misc.NAV_CONTACT_STARRED
        };

        var genTab = function () {
            return [{
                label : i18n.misc.NAV_CONTACT_ALL + '(' + pimCollection.get(7).get('count') + ')',
                type : 'radio',
                name : 'contact-tab-selector',
                value : 'all',
                checked : currentTab === 'all'
            }, {
                label : i18n.misc.NAV_CONTACT_HAS_PHONE + '(' + pimCollection.get(8).get('count') + ')',
                type : 'radio',
                name : 'contact-tab-selector',
                value : 'hasnumber',
                checked : currentTab === 'hasnumber'
            }, {
                label : i18n.misc.NAV_CONTACT_STARRED + '(' + pimCollection.get(9).get('count') + ')',
                type : 'radio',
                name : 'contact-tab-selector',
                value : 'starred',
                checked : currentTab === 'starred'
            }];
        };

        var TabSelectorView = MenuButton.extend({
            initialize : function () {
                TabSelectorView.__super__.initialize.apply(this, arguments);

                pimCollection = pimCollection || PIMCollection.getInstance();

                this.items = genTab.call();

                this.label = LABEL_MAPPING[_.find(this.items, function (item) {
                    return item.checked;
                }).value];

                this.on('select', function (data) {
                    this.label = LABEL_MAPPING[data.value];

                    Backbone.trigger('switchModule', {
                        module : 'contact',
                        tab : data.value
                    });
                }, this);

                var navModels = pimCollection.filter(function (item) {
                    return item.get('parent') === 1;
                });

                _.each(navModels, function (item) {
                    item.on('change:count', function (item) {
                        this.items = genTab.call();
                    }, this);
                }, this);
            },
            reset : function () {
                this.items = genTab.call();

                this.label = LABEL_MAPPING[_.find(this.items, function (item) {
                    return item.checked;
                }).value];
            }
        });

        var tabSelectorView;

        var ContactModuleToolbarView = Toolbar.extend({
            template : doT.template(TemplateFactory.get('contact', 'toolbar')),
            initialize : function () {
                Device.on('change:isConnected', this.setButtonState, this);

                accountCollection = AccountCollection.getInstance();

                contactsCollection = ContactsCollection.getInstance();
                contactsCollection.on('refresh', this.setButtonState, this);

                Backbone.on('switchModule', function (data) {
                    if (data.module === 'contact') {
                        currentTab = data.tab;
                        this.refresh();

                        tabSelectorView.reset();
                    }
                }, this);
            },
            refresh : function () {
                contactsListView.refresh(currentTab, currentAccountId, currentGroupId);
            },
            setButtonState : function () {
                var selected = contactsListView.selected;

                this.$('.button-new').prop({
                    disabled : !Device.get('isConnected')
                });

                this.$('.button-delete').prop({
                    disabled : !Device.get('isConnected') ||
                                selected.length === 0
                });

                this.$('.button-merge').prop({
                    disabled : !Device.get('isConnected') ||
                                selected.length <= 1 ||
                                contactsCollection.containsReadOnly(selected)
                });

                this.$('.button-import').prop({
                    disabled : !Device.get('isConnected')
                });

                this.$('.button-export').prop({
                    disabled : contactsCollection.length === 0
                });

                this.$('.button-refresh').prop({
                    disabled : !Device.get('isConnected')
                });
            },
            restoreFilter : function () {
                accountSelectorView.selectByAccountId('all');
            },
            toggleSelectorWrap : function () {
                this.$('.selector-wrap').toggle();
            },
            render : function () {
                this.$el.html(this.template({}));

                tabSelectorView = new TabSelectorView();
                this.$('.selector-wrap').append(tabSelectorView.render().$el);

                contactsListView = ContactsListView.getInstance({
                    $observer : this.$('.check-select-all')
                });

                contactsListView.on('select:change', this.setButtonState, this);

                accountSelectorView = AccountSelectorView.getInstance();
                this.$('.selector-wrap').append(accountSelectorView.render().$el);

                accountSelectorView.on('select', function (data) {
                    if (currentAccountId !== data.value) {
                        currentAccountId = data.value;
                        currentGroupId = 'all';

                        if (currentAccountId !== 'all' && accountCollection.get(currentAccountId).isSimAccount) {
                            var disposableAlert = new Panel({
                                draggable : true,
                                disposableName : 'contactSimTip',
                                disposableChecked : false,
                                buttonSet : 'yes',
                                $bodyContent : $(doT.template(TemplateFactory.get('contact', 'contact-sim-tip'))({})),
                                title : i18n.ui.TIP,
                                width : 500
                            });
                            disposableAlert.show();
                        }
                    }

                    groupSelectorView.update(data.value, currentGroupId);
                    this.refresh();
                }, this);

                groupSelectorView = GroupSelectorView.getInstance({
                    accountId : 'all'
                });

                groupSelectorView.on('select', function (data) {
                    currentGroupId = data.value;

                    if (currentGroupId !== 'all') {
                        var ungroupReg = new RegExp(/ungroup\[\w+\]/);
                        if (ungroupReg.test(currentGroupId)) {
                            currentGroupId.replace(/(\[)(\w+)(\])/, function (arg1, arg2, id) {
                                currentAccountId = id;
                            });
                        } else {
                            currentAccountId = accountCollection.getAccountByGroupId(currentGroupId).get('id');
                        }

                        accountSelectorView.selectByGroupId(currentGroupId);
                    }
                    this.refresh();
                }, this);

                this.$('.selector-wrap').append(groupSelectorView.render().$el);

                this.setButtonState();

                return this;
            },
            clickButtonNew : function () {
                ContactPanelView.getInstance().createNew();

                log({
                    'event' : 'ui.click.contact.button.new.toolbar'
                });
            },
            clickButtonDelete : function () {
                ContactService.deleteContactsAsync(contactsListView.selected);

                log({
                    'event' : 'ui.click.contact.delete.button.toolbar',
                    'count' : contactsListView.selected.length
                });
            },
            clickButtonExport : function () {
                ExportContextModel.set({
                    fileType : 0,
                    dataType : 0,

                    selectedIdList : contactsListView.selected,
                    hasPhoneIdList : _.map(contactsCollection.getContactsHasPhoneNumber(), function (model) {
                        return model.get('id');
                    }),

                    selectNumber : contactsListView.selected.length,
                    allNumber : contactsCollection.length,
                    hasPhoneNumber : contactsCollection.getContactsHasPhoneNumber().length
                });

                ExportController.start();
            },
            clickButtonRefresh : function () {
                ContactsCollection.getInstance().syncAsync();

                log({
                    'event' : 'ui.click.contact.refresh.button.toolbar'
                });
            },
            clickButtonMerge : function () {
                ContactPanelView.getInstance().mergeContacts(contactsListView.selected);

                log({
                    'event' : 'ui.click.contact.merge.button.toolbar',
                    'count' : contactsListView.selected.length
                });
            },
            clickButtonImport : function () {
                ContactService.getContactHasBackupAsync().done(function (resp) {
                    ImportController.start(resp.body.value);
                });
            },
            events : {
                'click .button-new' : 'clickButtonNew',
                'click .button-delete' : 'clickButtonDelete',
                'click .button-export' : 'clickButtonExport',
                'click .button-merge' : 'clickButtonMerge',
                'click .button-import' : 'clickButtonImport'
            }
        });

        var contactModuleToolbarView;

        var factory = _.extend({
            getInstance : function () {
                if (!contactModuleToolbarView) {
                    contactModuleToolbarView = new ContactModuleToolbarView();
                }
                return contactModuleToolbarView;
            }
        });

        return factory;
    });

}(this));
