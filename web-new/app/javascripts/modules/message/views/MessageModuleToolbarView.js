/*global define*/
(function (window) {
    define([
        'underscore',
        'doT',
        'jquery',
        'Internationalization',
        'Device',
        'Log',
        'ui/Toolbar',
        'ui/TemplateFactory',
        'message/MessageService',
        'message/collections/ConversationsCollection',
        'message/views/MessageSenderView',
        'message/views/ConversationsListView',
        'main/collections/PIMCollection',
        'message/ImportController',
        'message/ExportController',
        'message/models/ExportContextModel'
    ], function (
        _,
        doT,
        $,
        i18n,
        Device,
        log,
        Toolbar,
        TemplateFactory,
        MessageService,
        ConversationsCollection,
        MessageSenderView,
        ConversationsListView,
        PIMCollection,
        ImportController,
        ExportController,
        ExportContextModel
    ) {
        console.log('MessageModuleToolbarView - File loaded.');

        var alert = window.alert;

        var conversationsListView;
        var conversationsCollection;
        var pimCollection;

        var MessageModuleToolbarView = Toolbar.extend({
            template : doT.template(TemplateFactory.get('message', 'toolbar')),
            initialize : function () {
                Device.on('change:isConnected', this.setButtonState, this);
                conversationsCollection = ConversationsCollection.getInstance();
                conversationsCollection.on('refresh', this.setButtonState, this);
            },
            render : function () {
                this.$el.html(this.template({}));

                conversationsListView = ConversationsListView.getInstance({
                    $observer : this.$('.check-select-all')
                });

                conversationsListView.on('select:change', this.setButtonState, this);

                this.setButtonState();

                return this;
            },
            setButtonState : function () {
                var isConnected = Device.get('isConnected');

                this.$('.button-send').prop({
                    disabled : !isConnected
                });

                this.$('.button-delete').prop({
                    disabled : conversationsListView.selected.length === 0 || !isConnected
                });

                this.$('.button-mark-as-read').prop({
                    disabled : !conversationsListView.unreadMessageInSelected || !isConnected
                });

                this.$('.button-import').prop({
                    disabled : !isConnected
                });

                this.$('.button-export').prop({
                    disabled : conversationsCollection.length === 0
                });

                this.$('.button-refresh').prop({
                    disabled : !isConnected
                });
            },
            clickButtonSend : function () {
                MessageSenderView.getInstance().show();

                log({
                    'event' : 'ui.click.message.button.send'
                });
            },
            clickButtonDelete : function () {
                conversationsListView.deleteSelectedAsync();
            },
            clickButtonMarkAsRead : function () {
                conversationsListView.markAsReadAsync();
            },
            clickButtonImport : function () {
                MessageService.getSmsHasBackupAsync().done(function (resp) {
                    ImportController.start(resp.body.value);
                });
            },
            clickButtonExport : function () {
                var ids = conversationsListView.selected;
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
            },
            clickButtonRefresh : function () {
                conversationsCollection.syncAsync().fail(function () {
                    alert(i18n.misc.REFRESH_ERROR);
                });
            },
            events : {
                'click .button-send' : 'clickButtonSend',
                'click .button-delete' : 'clickButtonDelete',
                'click .button-mark-as-read' : 'clickButtonMarkAsRead',
                'click .button-import' : 'clickButtonImport',
                'click .button-export' : 'clickButtonExport',
                'click .button-refresh' : 'clickButtonRefresh'
            }
        });

        var messageModuleToolbarView;

        var factory = _.extend({
            getInstance : function () {
                if (!messageModuleToolbarView) {
                    messageModuleToolbarView = new MessageModuleToolbarView();
                }
                return messageModuleToolbarView;
            }
        });

        return factory;
    });
}(this));
