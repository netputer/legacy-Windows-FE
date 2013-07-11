/*global define, _, $*/
(function (window) {
    define([
        'underscore',
        'backbone',
        'ui/Menu',
        'ui/behavior/ClickToHideMixin',
        'Internationalization',
        'Device',
        'Log',
        'contact/models/ExportContextModel',
        'contact/collections/ContactsCollection',
        'contact/ContactService',
        'contact/ExportController'
    ], function (
        _,
        Backbone,
        Menu,
        ClickToHideMixin,
        i18n,
        Device,
        log,
        ExportContextModel,
        ContactsCollection,
        ContactService,
        ExportController
    ) {
        console.log('ContactContextMenu - File loaded. ');

        var contactsCollection;

        var ContactContextMenu = Menu.extend({
            initialize : function () {
                ContactContextMenu.__super__.initialize.apply(this, arguments);
                ClickToHideMixin.mixin(this);

                contactsCollection = ContactsCollection.getInstance();

                this.addItems();

                this.on('select', function (data) {
                    switch (data.value) {
                    case 'delete':
                        this.deleteContact();
                        break;
                    case 'merge':
                        this.mergeContact();
                        break;
                    case 'export':
                        this.exportContact();
                        break;
                    }
                }, this);
            },
            deleteContact : function () {
                ContactService.deleteContactsAsync(this.options.selected);

                log({
                    'event' : 'ui.click.contact.button.delete.contextmenu',
                    'count' : this.options.selected.length
                });
            },
            mergeContact : function () {
                Backbone.trigger('contactContextMenuMerge', this.options.selected);

                log({
                    'event' : 'ui.click.contact.button.merge.contextmenu',
                    'count' : this.options.selected.length
                });
            },
            exportContact : function () {
                ExportContextModel.set({
                    fileType : 0,
                    dataType : 0,

                    selectedIdList : this.options.selected,
                    hasPhoneIdList : _.map(contactsCollection.getContactsHasPhoneNumber(), function (model) {
                        return model.get('id');
                    }),

                    selectNumber : this.options.selected.length,
                    allNumber : contactsCollection.length,
                    hasPhoneNumber : contactsCollection.getContactsHasPhoneNumber().length
                });

                ExportController.start();

                log({
                    'event' : 'ui.click.contact.button.export.contextmenu',
                    'count' : this.options.selected.length
                });
            },
            addItems : function () {
                var selected = this.options.selected;

                this.items = [
                    {
                        type : 'normal',
                        name : 'delete',
                        value : 'delete',
                        label : i18n.misc.DELETE,
                        disabled : !Device.get('isConnected') ||
                                    selected.length === 0
                    }, {
                        type : 'normal',
                        name : 'merge',
                        value : 'merge',
                        label : i18n.contact.MERGE,
                        disabled : !Device.get('isConnected') ||
                                    selected.length <= 1 ||
                                    contactsCollection.containsReadOnly(selected)
                    }, {
                        type : 'hr'
                    }, {
                        type : 'normal',
                        name : 'export',
                        value : 'export',
                        label : i18n.misc.EXPORT,
                        disabled : false
                    }
                ];
            }
        });

        var contactContextMenu;

        var factory = _.extend({
            getInstance : function (args) {
                if (!contactContextMenu) {
                    contactContextMenu = new ContactContextMenu(args);
                } else {
                    contactContextMenu.options.selected = args.selected;
                    contactContextMenu.addItems();
                    contactContextMenu.render();
                }
                return contactContextMenu;
            }
        });

        return factory;
    });
}(this));
