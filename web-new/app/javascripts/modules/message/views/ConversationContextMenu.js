/*global define*/
(function (window, undefined) {
    define([
        'underscore',
        'jquery',
        'ui/Menu',
        'ui/behavior/ClickToHideMixin',
        'ui/AlertWindow',
        'Internationalization',
        'Device',
        'Log',
        'message/collections/ConversationsCollection',
        'message/MessageService',
        'message/ExportController',
        'message/models/ExportContextModel'
    ], function (
        _,
        $,
        Menu,
        ClickToHideMixin,
        AlertWindow,
        i18n,
        Device,
        log,
        ConversationsCollection,
        MessageService,
        ExportController,
        ExportContextModel
    ) {
        console.log('ConversationContextMenu - File loaded. ');

        var alert = window.alert;

        var conversationsCollection;

        var unreadInSelected = function (selected) {
            var unreadCount = 0;
            var i;
            var len = selected.length;
            for (i = 0; i < len; i++) {
                unreadCount += conversationsCollection.get(selected[i]).get('unread_number');
                if (unreadCount) {
                    break;
                }
            }
            return unreadCount;
        };

        var ConversationContextMenu = Menu.extend({
            initialize : function () {
                ConversationContextMenu.__super__.initialize.apply(this, arguments);
                ClickToHideMixin.mixin(this);

                conversationsCollection = ConversationsCollection.getInstance();

                this.addItems();

                this.on('select', function (data) {
                    switch (data.value) {
                    case 'delete':
                        this.deleteConversations();
                        break;
                    case 'markAsRead':
                        this.markAsReadConversations();
                        break;
                    case 'export':
                        this.exportConversations();
                        break;
                    }
                }, this);
            },
            deleteConversations : function () {
                MessageService.deleteConversationAsync(this.options.selected);

                log({
                    'event' : 'ui.click.message.button.delete.contextmenu',
                    'count' : this.options.selected.length
                });
            },
            markAsReadConversations : function () {
                MessageService.markAsReadAsync(this.options.selected);

                log({
                    'event' : 'ui.click.message.button.markasread.contextmenu',
                    'count' : this.options.selected.length
                });
            },
            exportConversations : function () {
                var ids = this.options.selected;
                var coversationTotalCount = 0;
                var coversationMmsCount = 0;

                ExportContextModel.set('ids', ids);
                _.each(ids, function (id) {
                    var conversation = conversationsCollection.get(id);
                    if (conversation) {
                        coversationTotalCount += conversation.get('total_number');
                        coversationMmsCount += conversation.get('mms_number');
                    }
                });

                if (coversationMmsCount > 0) {
                    alert(i18n.message.ALERT_TIP_EXPORT_MMS, function () {
                        ExportController.start(ids.length, coversationTotalCount - coversationMmsCount, conversationsCollection.totalCount);
                    });
                } else {
                    ExportController.start(ids.length, coversationTotalCount - coversationMmsCount, conversationsCollection.totalCount);
                }

                log({
                    'event' : 'ui.click.message.button.export.contextmenu',
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
                        disabled : selected.length === 0 ||
                                    !Device.get('isConnected')
                    }, {
                        type : 'normal',
                        name : 'markAsRead',
                        value : 'markAsRead',
                        label : i18n.message.MARK_AS_READ,
                        disabled : unreadInSelected(selected) === 0 ||
                                    !Device.get('isConnected')
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

        var conversationContextMenu;

        var factory = _.extend({
            getInstance : function (args) {
                if (!conversationContextMenu) {
                    conversationContextMenu = new ConversationContextMenu(args);
                } else {
                    conversationContextMenu.options.selected = args.selected;
                    conversationContextMenu.addItems();
                    conversationContextMenu.render();
                }
                return conversationContextMenu;
            }
        });

        return factory;
    });
}(this));
