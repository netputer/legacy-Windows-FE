(function(window, undefined) {
    define(['contact/models/ContactModel',
            'contact/collections/ContactsCollection',
            'contact/collections/AccountCollection',
            'contact/views/BatchContactsView',
            'contact/views/AccountSelectorView',
            'contact/views/GroupSelectorView',
            'contact/views/ImportAutoBackupView',
            'contact/views/DetailPanelView',
            'contact/views/ExportTipWindowView',
            'contact/ContactService'
    ], function(ContactModel,
                ContactsCollection,
                AccountCollection,
                BatchContactsView,
                AccountSelectorView,
                GroupSelectorView,
                ImportAutoBackupView,
                DetailPanelView,
                ExportTipWindowView,
                ContactService) {
        
        var Contact = {
            ContactModel : ContactModel,
            ContactCollection : ContactsCollection,
            AccountCollection : AccountCollection,
            BatchContactsView : BatchContactsView,
            AccountSelectorView : AccountSelectorView,
            GroupSelectorView : GroupSelectorView,
            ImportAutoBackupView : ImportAutoBackupView,
            DetailPanelView : DetailPanelView,
            ExportTipWindowView : ExportTipWindowView,
            ContactService : ContactService
        };

        window.Contact = Contact;

        return Contact;
    });
})(this);