/*global define*/
(function (window) {
    define([
        'doT',
        'backbone',
        'underscore',
        'ui/TemplateFactory',
        'message/views/ConversationsListView',
        'message/views/BatchConversationsView',
        'message/views/ThreadsPanelView'
    ], function (
        doT,
        Backbone,
        _,
        TemplateFactory,
        ConversationsListView,
        BatchConversationsView,
        ThreadsPanelView
    ) {
        console.log('MessagePanelView - File loaded. ');

        var conversationsListView;
        var batchConversationsView;
        var threadsPanelView;

        var PANEL_CLASS_NAMES = [
            '.empty-info',
            '.w-message-threads-ctn',
            '.w-message-batch-conversations'
        ];

        var MessagePanelView = Backbone.View.extend({
            className : 'w-message-panel',
            template : doT.template(TemplateFactory.get('message', 'message-panel')),
            initialize : function () {
                conversationsListView = ConversationsListView.getInstance();
                this.listenTo(conversationsListView, 'select:change', this.switchState);
            },
            switchState : function (selected) {
                switch (selected.length) {
                case 0:
                    this.$(['.w-message-threads-ctn', '.w-message-batch-conversations'].join(',')).addClass('w-layout-hidden');
                    this.$('.empty-info').removeClass('w-layout-hidden');
                    break;
                case 1:
                    this.$(['.empty-info', '.w-message-batch-conversations'].join(',')).addClass('w-layout-hidden');
                    if (!threadsPanelView) {
                        threadsPanelView = ThreadsPanelView.getInstance();
                        threadsPanelView.render();

                        threadsPanelView.once('rendered', function () {
                            this.$el.append(threadsPanelView.$el);
                        }, this);
                    } else {
                        threadsPanelView.once('rendered', function () {
                            threadsPanelView.$el.removeClass('w-layout-hidden');
                        });
                    }

                    threadsPanelView.update(selected[0]);
                    break;
                default:
                    this.$(['.w-message-threads-ctn', '.empty-info'].join(',')).addClass('w-layout-hidden');
                    if (!batchConversationsView) {
                        batchConversationsView = BatchConversationsView.getInstance();
                        batchConversationsView.render().update(selected);
                        this.$el.append(batchConversationsView.$el);

                        batchConversationsView.on('deselect', function () {
                            conversationsListView.list.deselectAll();
                        });

                        batchConversationsView.on('remove', function (id) {
                            conversationsListView.list.removeSelect(id);
                        });
                    } else {
                        batchConversationsView.update(selected).$el.removeClass('w-layout-hidden');
                    }
                }
            },
            render : function () {
                this.$el.html(this.template({}));
                return this;
            }
        });

        var messagePanelView;

        var factory = _.extend({
            getInstance : function () {
                if (!messagePanelView) {
                    messagePanelView = new MessagePanelView();
                }
                return messagePanelView;
            }
        });

        return factory;
    });
}(this));
