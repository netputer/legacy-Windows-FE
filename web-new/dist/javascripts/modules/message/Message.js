(function(window, undefined) {
    define(['message/views/ThreadsMessageItemView',
            'message/collections/MessageCollection',
            'message/collections/ThreadsCollection',
            'message/collections/Threads4ContactCollection',
            'message/collections/ConversationsCollection',
            'message/views/NewMessageNotificationView',
            'message/views/MessageSenderView',
            'message/views/BatchContactsSelectorView',
            'message/views/ThreadsPanelView',
            'message/views/ThreadsPanel4ContactView',
            'message/views/MessageSender4ThreadsPanelView',
            'message/views/ConversationsListView',
            'message/views/MessageModuleToolbarView',
            'message/views/BatchConversationsView',
            'message/views/ImportAutoBackupView',
            'message/MessageService'
    ], function(ThreadsMessageItemView,
                MessageCollection,
                ThreadsCollection,
                Threads4ContactCollection,
                ConversationsCollection,
                NewMessageNotificationView,
                MessageSenderView,
                BatchContactsSelectorView,
                ThreadsPanelView,
                ThreadsPanel4ContactView,
                MessageSender4ThreadsPanelView,
                ConversationsListView,
                MessageModuleToolbarView,
                BatchConversationsView,
                ImportAutoBackupView,
                MessageService) {
        console.log('Message - File loaded.');

        var Message = {
            ThreadsMessageItemView : ThreadsMessageItemView,
            NewMessageNotificationView : NewMessageNotificationView,
            ThreadsCollection : ThreadsCollection,
            Threads4ContactCollection : Threads4ContactCollection,
            MessageCollection : MessageCollection,
            ConversationsCollection : ConversationsCollection,
            MessageSenderView : MessageSenderView,
            BatchContactsSelectorView : BatchContactsSelectorView,
            ThreadsPanelView : ThreadsPanelView,
            ThreadsPanel4ContactView : ThreadsPanel4ContactView,
            MessageSender4ThreadsPanelView : MessageSender4ThreadsPanelView,
            ConversationsListView : ConversationsListView,
            MessageModuleToolbarView : MessageModuleToolbarView,
            BatchConversationsView : BatchConversationsView,
            ImportAutoBackupView : ImportAutoBackupView,
            MessageService : MessageService
        };

        // TODO Remove this after migarate finished.
        window.Message = Message;

        return Message;
    });
})(this);