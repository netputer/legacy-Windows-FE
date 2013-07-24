/*global define*/
(function (window, document) {
    define([
        'underscore',
        'backbone',
        'jquery',
        'ui/TemplateFactory',
        'utilities/StringUtil',
        'contact/views/QuickAddPanelView',
        'contact/views/BatchContactsView',
        'contact/views/ContactsListView',
        'contact/views/DetailPanelView',
        'contact/collections/ContactsCollection',
        'contact/ContactService'
    ], function (
        _,
        Backbone,
        $,
        TemplateFactory,
        StringUtil,
        QuickAddPanelView,
        BatchContactsView,
        ContactsListView,
        DetailPanelView,
        ContactsCollection,
        ContactService
    ) {
        console.log('ContactPanelView - File loaded.');

        var ClassMapping = {
            QUICK_ADD_PANEL : '.w-contact-quick-add-panel',
            BATCH_CONTACT_PANEL : '.w-contact-batch-contacts',
            DETAIL_PANEL : '.w-contact-detail-panel'
        };

        var contactsListView;
        var quickAddPanelView;
        var batchContactsView;
        var detailPanelView;

        var ContactPanelView = Backbone.View.extend({
            className : 'w-contact-panel',
            initialize : function () {
                contactsListView = ContactsListView.getInstance();
                contactsListView.on('select:change', this.handelSwitch, this);

                Backbone.on('contactContextMenuMerge', this.mergeContacts, this);
            },
            render : function () {
                quickAddPanelView = QuickAddPanelView.getInstance();
                this.$el.append(quickAddPanelView.render().$el);
                return this;
            },
            renderDetailPanelView : function () {
                detailPanelView = DetailPanelView.getInstance();
                this.$el.append(detailPanelView.$el);

                detailPanelView.on('cancel', function () {
                    this.handelSwitch(contactsListView.selected);
                }, this);

                detailPanelView.on('save', function (id) {
                    contactsListView.highlight({
                        id : id
                    });
                }, this);
            },
            handelSwitch : function (selected) {
                if (selected.length !== 0) {
                    if (selected.length > 1) {
                        this.switchTo('batch', selected);
                    } else {
                        this.switchTo('detail', selected[0]);
                    }
                } else {
                    this.switchTo('quick-add');
                }
            },
            createNew : function (model) {
                model = model || ContactsCollection.getInstance().generateNewContact();
                model.set({
                    isNew : true
                });
                this.$([ClassMapping.QUICK_ADD_PANEL, ClassMapping.BATCH_CONTACT_PANEL].join(',')).addClass('w-layout-hidden');
                if (!detailPanelView) {
                    this.renderDetailPanelView();
                    detailPanelView.createNewContact(model);
                } else {
                    this.$(ClassMapping.DETAIL_PANEL).removeClass('w-layout-hidden');
                    detailPanelView.createNewContact(model);
                }
            },
            mergeContacts : function (ids) {
                ContactService.mergeContactAsync(ids).done(function (model) {
                    this.createNew(model);
                }.bind(this));
            },
            switchTo : function (state, ids) {
                this.$([ClassMapping.QUICK_ADD_PANEL, ClassMapping.BATCH_CONTACT_PANEL, ClassMapping.DETAIL_PANEL].join(',')).addClass('w-layout-hidden');
                switch (state) {
                case 'quick-add':
                    this.$(ClassMapping.QUICK_ADD_PANEL).removeClass('w-layout-hidden');
                    break;
                case 'detail':
                    if (!detailPanelView) {
                        this.renderDetailPanelView();
                        detailPanelView.update(ids);
                    } else {
                        this.$(ClassMapping.DETAIL_PANEL).removeClass('w-layout-hidden');
                        detailPanelView.update(ids);
                    }
                    break;
                case 'batch':
                    if (!batchContactsView) {
                        batchContactsView = BatchContactsView.getInstance();
                        this.$el.append(batchContactsView.render().$el);
                        batchContactsView.update(ids);
                    } else {
                        this.$(ClassMapping.BATCH_CONTACT_PANEL).removeClass('w-layout-hidden');
                        batchContactsView.update(ids);
                    }
                    break;
                }
            }
        });

        var contactPanelView;

        var factory = _.extend({
            getInstance : function () {
                if (!contactPanelView) {
                    contactPanelView = new ContactPanelView();
                }
                return contactPanelView;
            }
        });

        return factory;
    });
}(this, this.document));
