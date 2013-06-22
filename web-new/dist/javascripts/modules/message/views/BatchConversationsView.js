/*global define*/
(function (window, undefined) {
    define([
        'backbone',
        'doT',
        'jquery',
        'underscore',
        'Internationalization',
        'Device',
        'ui/TemplateFactory',
        'ui/SmartList',
        'ui/AlertWindow',
        'utilities/StringUtil',
        'message/collections/ConversationsCollection',
        'message/views/ConversationItemView'
    ], function (
        Backbone,
        doT,
        $,
        _,
        i18n,
        Device,
        TemplateFactory,
        SmartList,
        AlertWindow,
        StringUtil,
        ConversationsCollection,
        ConversationItemView
    ) {
        console.log('BatchConversationsView - File loaded.');

        var CLASS_MAPPING = {
            CONVERSATION_LIST_CTN : '.w-message-batch-conversations-list-ctn'
        };

        var conversationsList;
        var conversationsCollection;

        var BatchConversationsView = Backbone.View.extend({
            className : 'w-message-batch-conversations vbox',
            template : doT.template(TemplateFactory.get('message', 'batch-conversations')),
            initialize : function () {
                conversationsCollection = conversationsCollection || ConversationsCollection.getInstance();
                Device.on('change:isConnected', this.setButtonState, this);
            },
            render : function () {
                this.$el.html(this.template({}));
                return this;
            },
            setButtonState : function () {
                this.$('.button-delete').prop({
                    disabled : !Device.get('isConnected')
                });
            },
            update : function (ids) {
                var conversations = function () {
                    return _.map(ids, function (id) {
                        return conversationsCollection.get(id);
                    });
                };

                this.$('.title .count').html(StringUtil.format(i18n.message.BATCH_CONVERSATION_TITLE, ids.length));

                if (!conversationsList) {
                    conversationsList = new SmartList({
                        itemView : ConversationItemView.getClass(),
                        dataSet : [{
                            name : 'default',
                            getter : conversations
                        }],
                        keepSelect : false,
                        itemHeight : 45,
                        selectable : false,
                        listenToCollection : conversationsCollection
                    });
                    this.$(CLASS_MAPPING.CONVERSATION_LIST_CTN).append(conversationsList.render().$el);

                } else {
                    conversationsList.switchSet('default', conversations);
                    conversationsList.deselectAll();
                }

                this.setButtonState();

                return this;
            },
            clickButtonDeselect : function () {
                this.trigger('deselect');
            },
            clickItemButtonClose : function (evt) {
                var id = $(evt.currentTarget).data('id').toString();
                this.trigger('remove', id);
            },
            events : {
                'click .button-deselect' : 'clickButtonDeselect',
                'click .w-message-conversation-list-item .button-close' : 'clickItemButtonClose'
            }
        });

        var batchConversationsView;

        var factory = _.extend({
            getInstance : function (args) {
                if (!batchConversationsView) {
                    batchConversationsView = new BatchConversationsView(args);
                }

                return batchConversationsView;
            }
        });

        return factory;
    });
}(this));
