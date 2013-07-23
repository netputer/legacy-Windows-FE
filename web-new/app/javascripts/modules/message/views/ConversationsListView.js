/*global define*/
(function (window, document) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'Configuration',
        'Internationalization',
        'IO',
        'Device',
        'ui/TemplateFactory',
        'ui/UIHelper',
        'ui/SmartList',
        'utilities/StringUtil',
        'utilities/FormatDate',
        'message/MessageService',
        'message/collections/ConversationsCollection',
        'message/collections/ThreadsCollection',
        'message/collections/Threads4ContactCollection',
        'message/views/ConversationItemView',
        'message/views/ConversationContextMenu',
        'message/views/ThreadsPanelView'
    ], function (
        Backbone,
        _,
        doT,
        $,
        CONFIG,
        i18n,
        IO,
        Device,
        TemplateFactory,
        UIHelper,
        SmartList,
        StringUtil,
        FormatDate,
        MessageService,
        ConversationsCollection,
        ThreadsCollection,
        Threads4ContactCollection,
        ConversationItemView,
        ConversationContextMenu,
        ThreadsPanelView
    ) {
        console.log('ConversationsListView - File loaded');

        var EventsMapping = UIHelper.EventsMapping;

        var conversationsCollection;
        var conversationList;

        var ConversationsListView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('message', 'conversation-list-ctn')),
            className : 'w-message-conversation-list vbox',
            initialize : function () {
                var rendered = false;
                Object.defineProperties(this, {
                    selected : {
                        get : function () {
                            return conversationList ? conversationList.selected : [];
                        }
                    },
                    unreadMessageInSelected : {
                        get : function () {
                            var unreadCount = 0;
                            var selected = this.selected;
                            var i;
                            var len = selected.length;
                            var conversation;
                            for (i = 0; i < len; i++) {
                                conversation = conversationsCollection.get(selected[i]);
                                if (conversation !== undefined) {
                                    unreadCount += conversation.get('unread_number');
                                    if (unreadCount) {
                                        break;
                                    }
                                }
                            }
                            return unreadCount;
                        }
                    },
                    rendered : {
                        set : function (value) {
                            rendered = value;
                        },
                        get : function () {
                            return rendered;
                        }
                    },
                    list : {
                        get : function () {
                            return conversationList;
                        }
                    }
                });

                this.bindConversationsCollectionEvents();
            },
            bindConversationsCollectionEvents : function () {
                conversationsCollection = ConversationsCollection.getInstance();

                conversationsCollection.on('syncStart update syncEnd refresh', function () {
                    if (conversationList !== undefined) {
                        conversationList.loading = conversationsCollection.loading || conversationsCollection.syncing;
                    }
                });

                conversationsCollection.on('refresh', function (conversationsCollection) {
                    this.updateHeader();

                    var originalSelected = conversationList.selected.concat();

                    conversationList.switchSet('default', conversationsCollection.getAll);

                    if (!_.isEqual(originalSelected, conversationList.selected)) {
                        this.trigger('select:change', conversationList.selected);
                    }
                }, this);
            },
            highlightSearchAsync : function (msg) {
                var deferred = $.Deferred();

                var doSeach = function (conversationsCollection) {
                    IO.requestAsync({
                        url : CONFIG.actions.SMS_GET_CONVERSATION,
                        data : {
                            type : CONFIG.enums.SMS_CONVERSATION_TYPE_SPECIFY_SMS_ID,
                            filter : msg.id
                        },
                        success : function (resp) {
                            if (resp.state_code === 200) {
                                console.log('ConversationsListView - Get conversion by specify SMS ID = "' + msg.id + '" success.');

                                var conversation = conversationsCollection.get(resp.body.conversation[0].conversation_id);

                                this.switchListDataSet();

                                conversationList.deselectAll({
                                    silent : true
                                });

                                ThreadsPanelView.getInstance().once('rendered', function () {
                                    this.update(conversation.get('id'), msg);
                                });
                                conversationList.addSelect(conversation.id);
                                conversationList.scrollTo(conversation);

                                deferred.resolve(resp);
                            } else {
                                console.error('ConversationsListView - Get conversion by specify SMS ID = "' + msg.id + '" failed. Error info: ' + resp.state_line);

                                deferred.reject(resp);
                            }
                        }.bind(this)
                    });
                }.bind(this);

                if (conversationsCollection.loading) {
                    conversationsCollection.once('refresh', doSeach);
                } else {
                    doSeach(conversationsCollection);
                }

                return deferred.promise();
            },
            toggleEmptyTip : function () {
                if (conversationsCollection.loading || conversationsCollection.syncing || Device.get('isFastADB')) {
                    conversationList.toggleEmptyTip(false);
                    return;
                }
                conversationList.toggleEmptyTip(conversationList.currentModels.length === 0);
            },
            switchListDataSet : function (tab) {
                tab = tab || 'default';
                var getter;

                switch (tab) {
                case 'default':
                    getter = conversationsCollection.getAll;
                    break;
                case 'search':
                    getter = conversationsCollection.getByKeyword;
                    break;
                }

                conversationList.switchSet(tab, getter);
                this.updateHeader();
            },
            renderConversationList : function () {
                conversationList = new SmartList({
                    itemView : ConversationItemView.getClass(),
                    dataSet : [{
                        name : 'default',
                        getter : conversationsCollection.getAll
                    }],
                    enableContextMenu : true,
                    keepSelect : false,
                    $observer : this.options.$observer,
                    itemHeight : 45,
                    listenToCollection : conversationsCollection,
                    emptyTip : i18n.message.NO_CONVERSATION,
                    loading : conversationsCollection.loading || conversationsCollection.syncing
                });

                this.listenTo(conversationList, 'switchSet', this.toggleEmptyTip);
                this.listenTo(conversationList, 'contextMenu', this.showContextMenu);
                this.listenTo(conversationList, 'select:change', function (selected) {
                    this.trigger('select:change', selected);
                });
                this.listenTo(Device, 'change:isFastADB', this.toggleEmptyTip);

                this.$el.append(conversationList.render().$el);
            },
            showContextMenu : function () {
                var contextMenu = ConversationContextMenu.getInstance({
                    selected : conversationList.selected
                });

                contextMenu.show();
            },
            render : function () {
                this.$el.html(this.template({}));

                this.renderConversationList();

                this.toggleEmptyTip();


                this.updateHeader();

                this.rendered = true;

                this.trigger(EventsMapping.RENDERED);

                return this;
            },
            updateHeader : function () {
                if (conversationList.currentSetName === 'search') {
                    this.$('.button-return').show();
                    this.$('.count-tip').html(StringUtil.format(i18n.message.SEARCH_TIP,
                                                                conversationsCollection.modelsByKeywordIds.length,
                                                                conversationsCollection.keyword));
                    return;
                }

                this.$('.button-return').hide();
                this.$('.count-tip').html(StringUtil.format(i18n.message.SMS_SUMMARY,
                                                                conversationsCollection.totalCount,
                                                                conversationsCollection.unreadCount));
            },
            deleteSelectedAsync : function () {
                var deferred = $.Deferred();

                MessageService.deleteConversationAsync(conversationList.selected).done(function (resp) {
                    deferred.resolve(resp);
                }).fail(function (resp) {
                    deferred.reject(resp);
                });

                return deferred.promise();
            },
            markAsReadAsync : function () {
                var deferred = $.Deferred();

                MessageService.markAsReadAsync(conversationList.selected).done(function (resp) {
                    deferred.resolve(resp);
                }).fail(function (resp) {
                    deferred.reject(resp);
                }).always(function () {
                    this.updateHeader();
                }.bind(this));

                return deferred.promise();
            },
            showByKeyword : function () {
                conversationsCollection.searchConversationAsync().done(function (resp) {
                    this.switchListDataSet('search');
                    conversationList.deselectAll({
                        silent : true
                    });

                    var models = conversationsCollection.getByKeyword();
                    if (models.length > 0) {
                        var conversation = models[0];
                        conversationList.addSelect(conversation.id);
                    }

                }.bind(this));
            },
            clickButtonReturn : function () {
                this.switchListDataSet();
            },
            events : {
                'click .button-return' : 'clickButtonReturn'
            }
        });

        var conversationsListView;

        var factory = _.extend({
            getInstance : function (args) {
                if (!conversationsListView) {
                    conversationsListView = new ConversationsListView(args);
                }
                return conversationsListView;
            }
        });

        return factory;
    });
}(this, this.document));

