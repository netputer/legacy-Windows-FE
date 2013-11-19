/*global define*/
(function (window, document) {
    define([
        'backbone',
        'underscore',
        'doT',
        'ui/TemplateFactory',
        'ui/Notification',
        'utilities/StringUtil',
        'IOBackendDevice',
        'Configuration',
        'Internationalization',
        'Environment',
        'message/models/MessageModel',
        'message/views/MessageModuleToolbarView',
        'message/views/ConversationsListView',
        'message/views/MessageSenderView',
        'message/views/MessagePanelView',
        'message/collections/ConversationsCollection',
        'message/collections/ThreadsCollection',
        'message/collections/Threads4ContactCollection'
    ], function (
        Backbone,
        _,
        doT,
        TemplateFactory,
        Notification,
        StringUtil,
        IO,
        CONFIG,
        i18n,
        Environment,
        MessageModel,
        MessageModuleToolbarView,
        ConversationsListView,
        MessageSenderView,
        MessagePanelView,
        ConversationsCollection,
        ThreadsCollection,
        Threads4ContactCollection
    ) {
        console.log('MessageModuleView - File loaded.');

        var setInterval = window.setInterval;
        var clearInterval = window.clearInterval;

        var conversationsListView;

        var MessageModuleView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('message', 'message-main')),
            className : 'w-message-module-main module-main vbox',
            initilize : function () {
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
            },
            render : function () {
                this.$el.html(this.template({}));

                this.$el.prepend(MessageModuleToolbarView.getInstance().render().$el);

                conversationsListView = ConversationsListView.getInstance();

                var $ctn = this.$('.w-message-ctn');
                var fragment = document.createDocumentFragment();
                fragment.appendChild(conversationsListView.render().$el[0]);
                fragment.appendChild(MessagePanelView.getInstance().render().$el[0]);

                $ctn.append(fragment);

                this.rendered = true;

                return this;
            }
        });

        // Backend events binding
        IO.Backend.Device.onmessage({
            'data.channel' : CONFIG.events.MESSAGE_MARK_AS_READ
        }, function (data) {
            var message = new MessageModel(data);

            message.markAsReadAsync().done(function () {
                if (ThreadsCollection.getInstance().getThreadWithMessage(message.id)) {
                    ThreadsCollection.getInstance().trigger('update');
                }

                if (Threads4ContactCollection.getInstance().getThreadWithMessage(message.id)) {
                    Threads4ContactCollection.getInstance().trigger('update');
                }

                ConversationsCollection.getInstance().updateConversationAsync(message);
            });
        }, this);

        var noNewMessageWindow = true;

        IO.Backend.Device.onmessage({
            'data.channel' : CONFIG.events.SMS_CALLLOG_SMS_RECEIVE
        }, function (data) {
            var contactName = data.contact_name || data.address;

            var notification = new Notification({
                type : 'html',
                url : CONFIG.BASE_PATH + 'modules/message/message_notification_receive.html' + Environment.get('search') + '&data=' + encodeURIComponent(JSON.stringify(data)),
                title : StringUtil.format(i18n.message.MESSAGE_FROM, contactName),
                onclose : function () {
                    var message = new MessageModel(data);

                    message.markAsReadAsync().done(function () {
                        if (ThreadsCollection.getInstance().getThreadWithMessage(message.id)) {
                            ThreadsCollection.getInstance().trigger('update');
                        }

                        if (Threads4ContactCollection.getInstance().getThreadWithMessage(message.id)) {
                            Threads4ContactCollection.getInstance().trigger('update');
                        }

                        ConversationsCollection.getInstance().updateConversationAsync(message);
                    });

                    noNewMessageWindow = true;
                }
            });

            if (noNewMessageWindow) {
                noNewMessageWindow = !notification.show();

                var handler = IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.MESSAGE_CLOSE_MESSAGE_NOTIFICATION
                }, function () {
                    notification.cancel();
                    noNewMessageWindow = true;
                    IO.Backend.Device.offmessage(handler);
                });
            }
        });

        var messageModuleView;

        var factory = _.extend({
            enablePreload : false,
            getInstance: function () {
                if (!messageModuleView) {
                    messageModuleView = new MessageModuleView();
                }
                return messageModuleView;
            },
            preload : function () {
                ConversationsCollection.getInstance();
                ThreadsCollection.getInstance();
            },
            navigateGroup : function (msg) {
                Backbone.trigger('switchModule', {
                    module : 'message',
                    tab : 'all'
                });

                var search = function () {
                    ConversationsCollection.getInstance().keyword = msg.keyword;
                    conversationsListView.showByKeyword();
                };

                if (conversationsListView) {
                    search();
                } else {
                    var delegate = setInterval(function () {
                        if (conversationsListView) {
                            clearInterval(delegate);
                            search();
                        }
                    }, 10);
                }
            },
            navigate : function (msg) {
                Backbone.trigger('switchModule', {
                    module : 'message',
                    tab : 'all'
                });

                var highlightSearch = function () {
                    conversationsListView.highlightSearchAsync(msg);
                };

                if (conversationsListView) {
                    highlightSearch();
                } else {
                    var delegate = setInterval(function () {
                        if (conversationsListView) {
                            clearInterval(delegate);
                            highlightSearch();
                        }
                    }, 10);
                }
            },
            sendMessage : function (data) {
                var messageSenderView = MessageSenderView.getInstance();
                var receivers = data.receivers || [];
                var content = data.content || '';
                var source = data.source || 'unknown';

                if (messageSenderView.rendered) {
                    messageSenderView.setContent(content);
                } else {
                    messageSenderView.once('show', function () {
                        messageSenderView.addReceivers(receivers);
                        messageSenderView.setContent(content);
                    });
                    messageSenderView.show();
                    messageSenderView.setSource(source);
                }
            }
        });

        return factory;
    });
}(this, this.document));
