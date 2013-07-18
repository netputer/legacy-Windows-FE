/*global console, define*/
(function (window) {
    define([
        'backbone',
        'doT',
        'underscore',
        'ui/TemplateFactory',
        'contact/models/ContactModel',
        'contact/collections/ContactsCollection',
        'contact/collections/AccountCollection',
        'contact/views/ContactModuleToolbarView',
        'contact/views/ContactsListView',
        'contact/views/ContactPanelView',
        'main/collections/PIMCollection'
    ], function (
        Backbone,
        doT,
        _,
        TemplateFactory,
        ContactModel,
        ContactsCollection,
        AccountCollection,
        ContactModuleToolbarView,
        ContactsListView,
        ContactPanelView,
        PIMCollection
    ) {
        console.log('ContactModuleView - File loaded. ');

        var setInterval = window.setInterval;
        var clearInterval = window.clearInterval;

        var contactsListView;

        var contactsCollection;
        var contactModuleToolbarView;
        var contactPanelView;

        var ContactModuleView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('contact', 'contact-main')),
            className : 'w-contact-module-main module-main vbox',
            initialize : function () {
                var rendered = false;
                Object.defineProperties(this, {
                    rendered : {
                        set : function (value) {
                            rendered = value;
                        },
                        get : function () {
                            return rendered;
                        }
                    }
                });

                contactModuleToolbarView = ContactModuleToolbarView.getInstance();
                contactsCollection = ContactsCollection.getInstance();
            },
            render : function () {
                this.$el.html(this.template({}));

                this.$el.prepend(contactModuleToolbarView.render().$el);

                contactsListView = ContactsListView.getInstance();
                contactPanelView = ContactPanelView.getInstance();

                this.$('.w-contact-ctn').append(contactsListView.render().$el).append(contactPanelView.render().$el);

                this.rendered = true;
                return this;
            }
        });

        var contactModuleView;

        var factory = _.extend({
            enablePreload : false,
            getInstance : function () {
                if (!contactModuleView) {
                    contactModuleView = new ContactModuleView();
                }
                return contactModuleView;
            },
            preload : function () {
                ContactsCollection.getInstance();
                AccountCollection.getInstance();
            },
            navigateGroup : function (msg) {
                PIMCollection.getInstance().get(1).set({
                    selected : true
                });

                var search = function () {
                    contactsCollection.keyword = msg.keyword;
                    contactsListView.showContactsByKeyword();
                    contactModuleToolbarView.toggleSelectorWrap();

                    contactsListView.once('__RETURN_DEFAULT', function () {
                        contactModuleToolbarView.toggleSelectorWrap();
                    });
                };
                if (!contactsCollection.loading && !contactsCollection.syncing) {
                    search();
                } else {
                    contactsCollection.once('refresh', function (){
                        search();
                    });
                }
            },
            navigate : function (msg) {

                PIMCollection.getInstance().get(1).set({
                    selected : true
                });
                var highlight = function () {
                    contactModuleToolbarView.restoreFilter();
                    contactsListView.highlight(msg);
                    contactModuleToolbarView.toggleSelectorWrap();
                };

                if (!contactsCollection.loading && !contactsCollection.syncing) {
                    highlight();
                } else {
                    contactsCollection.on('refresh', function (){
                        highlight();
                    });
                }
            },
            createNew : function (model) {
                PIMCollection.getInstance().get(1).set({
                    selected : true
                });

                model = new ContactModel(model);

                var createNew = function (model) {
                    contactPanelView.createNew(model);
                    contactModuleToolbarView.toggleSelectorWrap();
                };

                createNew(model);
            }
        });

        return factory;
    });
}(this));

