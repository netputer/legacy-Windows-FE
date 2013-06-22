/*global define*/
(function (window, undefined) {
    define([
        'backbone',
        'underscore',
        'message/collections/ConversationsCollection',
        'message/models/MessageModel'
    ], function (
        Backbone,
        _,
        ConversationsCollection,
        MessageModel
    ) {
        console.log('MessageCollection - File loaded.');

        var MessageCollection = Backbone.Collection.extend({
            model : MessageModel,
            initialize : function () {
                Object.defineProperties(this, {
                    unreadCount : {
                        get : function () {
                            return this.filter(function (message) {
                                return !message.isRead;
                            }).length;
                        }
                    }
                });

                this.on('add', function (message) {
                    if (message.collection !== undefined) {
                        message.on('change:read change:type', function (message) {
                            ConversationsCollection.getInstance().updateConversationAsync(message);
                        }, message);
                    }

                    message.on('remove', function () {
                        this.off();
                    }, message);
                });

                // Events binding
                this.on('remove', function (model) {
                    if (this.length === 0) {
                        this.trigger('empty');
                    }
                }, this);
            }
        });

        var factory = _.extend(function () {}, {
            getInstance : function (args) {
                return new MessageCollection(args);
            }
        });

        return factory;
    });
}(this));
