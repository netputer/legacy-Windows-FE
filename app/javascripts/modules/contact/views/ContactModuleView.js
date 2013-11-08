/*global console, define*/
(function (window) {
    define([
        'backbone',
        'doT',
        'underscore',
        'jquery',
        'ui/TemplateFactory',
        'contact/models/ContactModel',
        'contact/collections/ContactsCollection',
        'contact/collections/AccountCollection',
        'contact/views/ContactModuleToolbarView',
        'contact/views/ContactsListView',
        'contact/views/ContactPanelView'
    ], function (
        Backbone,
        doT,
        _,
        $,
        TemplateFactory,
        ContactModel,
        ContactsCollection,
        AccountCollection,
        ContactModuleToolbarView,
        ContactsListView,
        ContactPanelView
    ) {
        console.log('ContactModuleView - File loaded. ');

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
                Backbone.trigger('switchModule', {
                    module : 'contact',
                    tab : 'all'
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
                    contactsCollection.once('refresh', function () {
                        search();
                    });
                }
            },
            navigateAsync : function (msg) {
                var deferred = $.Deferred();

                Backbone.trigger('switchModule', {
                    module : 'contact',
                    tab : 'all'
                });

                var highlight = function () {
                    contactModuleToolbarView.restoreFilter();
                    contactsListView.highlight(msg);
                    contactModuleToolbarView.toggleSelectorWrap();

                    deferred.resolve();
                };

                if (!contactsCollection.loading && !contactsCollection.syncing) {
                    highlight();
                } else {
                    contactsCollection.on('refresh', function () {
                        highlight();
                    });
                }

                return deferred.promise();
            },
            createNew : function (model) {
                Backbone.trigger('switchModule', {
                    module : 'contact',
                    tab : 'all'
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

