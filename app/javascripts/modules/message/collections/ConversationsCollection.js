/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'jquery',
        'Device',
        'IO',
        'Configuration',
        'message/models/ConversationModel',
        'main/collections/PIMCollection'
    ], function (
        Backbone,
        _,
        $,
        Device,
        IO,
        CONFIG,
        ConversationModel,
        PIMCollection
    ) {
        console.log('ConversationsCollection - File loaded.');

        var ConversationsCollection = Backbone.Collection.extend({
            url : CONFIG.actions.SMS_GET_CONVERSATION,
            model : ConversationModel,
            data : {
                type : CONFIG.enums.SMS_CONVERSATION_TYPE_ALL,
                start : 0,
                number : -1
            },
            comparator : function (conversation) {
                return -conversation.get('last_date');
            },
            parse : function (resp) {
                if (resp.state_code === 202 && Device.get('isConnected')) {
                    console.log('ConversationsCollection - Conversation is syncing.');
                    this.syncing = true;
                    this.trigger('syncStart');
                }

                this.totalCount = resp.body.total_sms || 0;
                this.unreadCount = resp.body.unread_sms || 0;

                _.each(resp.body.conversation, function (conversation) {
                    conversation.id = conversation.conversation_id;
                });

                return resp.body.conversation;
            },
            syncAsync : function () {
                var deferred = $.Deferred();

                this.syncing = true;
                this.trigger('syncStart');

                IO.requestAsync({
                    url : CONFIG.actions.SMS_SYNC,
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('ConversationsCollection - Conversation sync success.');

                            deferred.resolve(resp);
                        } else {
                            console.error('ConversationsCollection - Conversation sync failed. Error info: ' + resp.state_line);

                            this.syncing = false;
                            this.trigger('syncEnd');
                            deferred.reject(resp);
                        }
                    }.bind(this)
                });

                return deferred.promise();
            },
            initialize : function () {
                var totalCount = 0;
                var unreadCount = 0;
                var loading = false;
                var syncing = false;
                var keyword = "";
                var modelsByKeywordIds = [];
                Object.defineProperties(this, {
                    totalCount : {
                        set : function (value) {
                            totalCount = parseInt(value, 10);
                        },
                        get : function () {
                            return totalCount;
                        }
                    },
                    unreadCount : {
                        set : function (value) {
                            unreadCount = parseInt(value, 10);
                        },
                        get : function () {
                            return unreadCount;
                        }
                    },
                    loading : {
                        set : function (value) {
                            loading = Boolean(value);
                        },
                        get : function () {
                            return loading;
                        }
                    },
                    syncing : {
                        set : function (value) {
                            syncing = Boolean(value);
                        },
                        get : function () {
                            return syncing;
                        }
                    },
                    keyword : {
                        set : function (value) {
                            keyword = value;
                            this.modelsByKeywordIds = [];
                        },
                        get : function () {
                            return keyword;
                        }
                    },
                    modelsByKeywordIds : {
                        set : function (value) {
                            modelsByKeywordIds = value;
                        },
                        get : function () {
                            return modelsByKeywordIds;
                        }
                    }
                });

                this.on('update', function () {
                    loading = true;
                    this.fetch({
                        success : function (collection) {
                            console.log('ConversationsCollection - Conversation updated.');
                            loading = false;
                            collection.trigger('refresh', collection);
                        }
                    });
                }, this);

                IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.SMS_CALLLOG_SMS_UPDATED
                }, function (data) {
                    if (syncing) {
                        syncing = false;
                        this.trigger('syncEnd');
                    }
                    if (!!data) {
                        this.trigger('update');
                    }
                }, this);

                this.on('add', function (conversation) {
                    conversation.on('change:address', conversation.changeAddressHandler, conversation);
                    conversation.once('remove', function () {
                        conversation.off();
                    }, conversation);
                });
            },
            updateConversationAsync : function (message) {
                var deferred = $.Deferred();

                var messageId = message.get('id');

                IO.requestAsync({
                    url : CONFIG.actions.SMS_GET_CONVERSATION,
                    data : {
                        type : CONFIG.enums.SMS_CONVERSATION_TYPE_SPECIFY_SMS_ID,
                        filter : messageId
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('ConversationsCollection - Get conversation by SMS ID = ' + messageId + ' success.');

                            this.totalCount = resp.body.total_sms;
                            this.unreadCount = resp.body.unread_sms;

                            if (resp.body.conversation.length === 0) {
                                this.trigger('update');
                            } else {
                                var conversation = new ConversationModel(resp.body.conversation[0]);
                                var target = this.get(conversation.get('id'));
                                if (target !== undefined) {
                                    target.set(conversation.toJSON());
                                }

                                this.trigger('refresh', this);
                            }

                            deferred.resolve(resp);
                        } else {
                            console.error('ConversationsCollection - Get conversation by SMS ID = ' + messageId + ' failed. Error info: ' + resp.state_line);
                            deferred.reject(resp);
                        }
                    }.bind(this)
                });

                return deferred.promise();
            },
            getConversationWithUnreadMessage : function () {
                return this.filter(function (conversation) {
                    return conversation.hasUnread;
                });
            },
            deleteConversationsAsync : function (ids, session) {
                var deferred = $.Deferred();

                var data = {
                    conversations : ids.join(',')
                };

                if (session) {
                    data.session = session;
                }

                IO.requestAsync({
                    url : CONFIG.actions.SMS_DELETE_CONVERSATION,
                    data : data,
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('ConversationsCollection - Delete conversation success.');

                            _.each(ids, function (id) {
                                var conversation = this.get(id);
                                this.totalCount -= conversation.get('total_number');
                                this.unreadCount -= conversation.get('unread_number');
                                this.remove(conversation);
                            }, this);

                            this.trigger('refresh', this);

                            deferred.resolve(resp);
                        } else {
                            console.error('ConversationsCollection - Delete conversation failed. Error info: ' + resp.state_line);

                            this.trigger('update');

                            deferred.reject(resp);
                        }
                    }.bind(this)
                });

                return deferred.promise();
            },
            markAsReadAsync : function (ids, session) {
                var deferred = $.Deferred();

                var data = {
                    conversations : ids.join(',')
                };

                if (session) {
                    data.session = session;
                }

                IO.requestAsync({
                    url : CONFIG.actions.SMS_CONVERSATION_MARK_AS_READ,
                    data : data,
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('ConversationsCollection - Mark as read success.');
                            _.each(ids, function (id) {
                                var target = this.get(id);
                                if (target !== undefined) {
                                    target.set('unread_number', 0);
                                }
                            }, this);

                            deferred.resolve(resp);
                        } else {
                            console.error('ConversationsCollection - Mark as read failed. Error info: ' + resp.state_line);

                            deferred.reject(resp);
                        }
                    }.bind(this)
                });

                return deferred.promise();
            },
            exportConversationAsync : function (ids, session) {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.SMS_EXPORT,
                    data : {
                        session : session,
                        conversations : ids
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('ConversationsCollection - Export success.');

                            deferred.resolve(resp);
                        } else {
                            console.error('ConversationsCollection - Export failed. Error info: ' + resp.tate_line);

                            deferred.reject(resp);
                        }
                    }
                });

                return deferred.promise();
            },
            importConversationAsync : function (file, session) {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.SMS_IMPORT,
                    data : {
                        session : session,
                        csv_file : file
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('ConversationsCollection - Import success.');

                            deferred.resolve(resp);
                        } else {
                            console.error('ConversationsCollection - Import failed. Error info: ' + resp.state_code);

                            deferred.reject(resp);
                        }
                    }
                });

                return deferred.promise();
            },
            searchConversationAsync : function () {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.SMS_SEARCH_CONVERSATION,
                    data : {
                        query : this.keyword
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('ConversationsCollection - Search success.');

                            var value = resp.body.value;
                            if (value.length === 0) {
                                this.modelsByKeywordIds = [];
                            } else {
                                this.modelsByKeywordIds = resp.body.value.split(',');
                            }
                            deferred.resolve(resp);

                        } else {
                            console.error('ConversationsCollection - Search failed. Error info: ' + resp.state_code);
                            this.modelsByKeywordIds = [];
                            deferred.reject(resp);
                        }
                    }.bind(this)
                });

                return deferred.promise();
            },
            getAll : function () {
                return this.models;
            },
            getByKeyword : function () {
                return _.map(this.modelsByKeywordIds, function (id) {
                    return this.get(id);
                }, this);
            }
        });

        var conversationsCollection;

        var factory = _.extend({
            getInstance : function () {

                var listenHandler;
                var events = 'change:isConnected change:isSameWifi';

                if (!conversationsCollection) {
                    conversationsCollection = new ConversationsCollection();

                    var pimCollection = PIMCollection.getInstance();
                    conversationsCollection.on('refresh', function (conversationsCollection) {
                        pimCollection.get(2).set({
                            count : conversationsCollection.unreadCount
                        });
                    });

                    if (window.SnapPea.isPimEnabled) {
                        conversationsCollection.trigger('update');
                    } else {
                        listenHandler = function (Device) {

                            if (window.SnapPea.isPimEnabled) {
                                this.trigger('update');
                                this.stopListening(this, events, listenHandler);
                            }
                        };

                        conversationsCollection.listenTo(Device, events, listenHandler);
                    }
                }
                return conversationsCollection;
            }
        });

        return factory;
    });
}(this));
