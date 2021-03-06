/*global define*/
(function (window) {
    define([
        'underscore',
        'jquery',
        'ui/Menu',
        'ui/behavior/ClickToHideMixin',
        'ui/AlertWindow',
        'ui/ToastBox',
        'Internationalization',
        'Device',
        'Log',
        'Configuration',
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
        ToastBox,
        i18n,
        Device,
        log,
        CONFIG,
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

                if (Device.get('SDKVersion') >= CONFIG.enums.ANDROID_4_4) {
                    var box = new ToastBox({
                        $content : i18n.message.DELET_TIP_4_4
                    });
                    box.once('remove', function () {
                        box = undefined;
                    });
                    box.show();
                }

                MessageService.deleteConversationAsync(this.options.selected);

                log({
                    'event' : 'ui.click.message.button.delete.contextmenu',
                    'count' : this.options.selected.length
                });
            },
            markAsReadConversations : function () {

                if (Device.get('SDKVersion') >= CONFIG.enums.ANDROID_4_4) {
                    var box = new ToastBox({
                        $content : i18n.message.MARK_AS_READ_TIP_4_4
                    });
                    box.once('remove', function () {
                        box = undefined;
                    });
                    box.show();
                }

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


                var selectSmsCount = coversationTotalCount - coversationMmsCount;
                var allSms = conversationsCollection.totalCount;

                ExportContextModel.set('selectSmsCount', selectSmsCount);
                ExportContextModel.set('allSms', allSms);

                var handler = function () {
                    ExportController.start();
                };
                if (coversationMmsCount > 0) {
                    alert(i18n.message.ALERT_TIP_EXPORT_MMS, function () {
                        handler();
                    });
                } else {
                    handler();
                }

                log({
                    'event' : 'ui.click.message.button.export.contextmenu',
                    'count' : this.options.selected.length
                });
            },
            addItems : function () {
                var selected = this.options.selected;

                this.items = [{
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
                },{
                    type : 'normal',
                    name : 'export',
                    value : 'export',
                    label : i18n.misc.EXPORT,
                    disabled : false
                }];
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
