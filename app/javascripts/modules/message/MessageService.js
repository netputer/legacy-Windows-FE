/*global define*/
(function (window) {
    define([
        'jquery',
        'underscore',
        'backbone',
        'IOBackendDevice',
        'Configuration',
        'Internationalization',
        'utilities/StringUtil',
        'ui/AlertWindow',
        'ui/BatchActionWindow',
        'message/collections/ConversationsCollection',
        'message/collections/ThreadsCollection',
        'message/collections/Threads4ContactCollection'
    ], function (
        $,
        _,
        Backbone,
        IO,
        CONFIG,
        i18n,
        StringUtil,
        AlertWindow,
        BatchActionWindow,
        ConversationsCollection,
        ThreadsCollection,
        Threads4ContactCollection
    ) {
        console.log('MessageService - File loaded.');

        var confirm = window.confirm;

        var conversationsCollection;

        var MessageService = _.extend({}, Backbone.Events);

        MessageService.getServiceCenterAsync = function () {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.SMS_GET_SERVICE_CENTER,
                success : function (resp) {
                    if (resp.state_code === 200) {
                        console.log('MessageService - Get SMS service center success.');

                        deferred.resolve(resp);
                    } else {
                        console.error('MessageService - Get SMS service center faild. Error info: ' + resp.state_line);

                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        MessageService.sendMessageAsync = function (addresses, body, serviceCenter, sendFrom) {
            var deferred = $.Deferred();

            var callback = function (resp) {
                if (resp.state_code === 200) {
                    console.log('MessageSenderView - Send message success.');
                    deferred.resolve(resp);
                } else {
                    console.error('MessageSenderView - Send message failed. Error info: ' + resp.state_line);
                    deferred.reject(resp);
                }
            };

            if (addresses instanceof Array && addresses.length > 1) {
                IO.requestAsync({
                    type : 'POST',
                    url : CONFIG.actions.SMS_BATCH_SEND + '?sendFrom=' + (sendFrom || ''),
                    data : {
                        address : {
                            value : addresses
                        },
                        body : body,
                        service_center : serviceCenter
                    },
                    success : callback
                });
            } else {
                if (addresses instanceof Array) {
                    addresses = addresses[0];
                }
                IO.requestAsync({
                    type: 'post',
                    url : CONFIG.actions.SMS_SEND + '?sendFrom=' + (sendFrom || ''),
                    data : {
                        address : addresses,
                        body : body,
                        service_center : serviceCenter
                    },
                    success : callback
                });
            }
            return deferred.promise();
        };

        MessageService.markAsReadAsync = function (ids) {
            conversationsCollection = conversationsCollection || ConversationsCollection.getInstance();

            var deferred = $.Deferred();

            var total = 0;
            _.each(ids, function (id) {
                total += conversationsCollection.get(id).get('unread_number');
            });

            confirm(StringUtil.format(i18n.message.CONFIRM_MARK_AS_READ, ids.length), function () {
                var session;
                if (ids.length > 1 && total > 1) {
                    session = _.uniqueId('sms.batch.mark_as_read_');
                    var batchActionWindow = new BatchActionWindow({
                        session : session,
                        progressText : i18n.message.CONVERSATION_MARK_AS_READ_PROGRESS,
                        cancelUrl : CONFIG.actions.SMS_CANCEL,
                        total : total,
                        successText : i18n.message.CONVERSATION_MARK_AS_READ_SUCCESS
                    });
                    batchActionWindow.show();
                }

                conversationsCollection.markAsReadAsync(ids, session).done(function (resp) {
                    ThreadsCollection.getInstance().trigger('update');
                    Threads4ContactCollection.getInstance().trigger('update');

                    deferred.resolve(resp);
                }).fail(function (resp) {
                    deferred.reject(resp);
                });
            });

            return deferred.promise();
        };

        MessageService.deleteConversationAsync = function (ids) {
            conversationsCollection = conversationsCollection || ConversationsCollection.getInstance();

            var deferred = $.Deferred();

            var smsCount = 0;
            _.each(ids, function (id) {
                smsCount += conversationsCollection.get(id).get('total_number');
            });

            var disposableAlert = new AlertWindow({
                draggable : true,
                disposableName : 'sms-conversation-delete-single',
                buttonSet : 'yes_no',
                $bodyContent : StringUtil.format(i18n.message.CONFIRM_DELETE_CONVERSATION, ids.length, smsCount)
            });

            disposableAlert.once('button_yes', function () {
                var session;
                if (ids.length > 1 && smsCount > 1) {
                    session = _.uniqueId('sms.batch.delete_');
                    var batchActionWindow = new BatchActionWindow({
                        session : session,
                        progressText : i18n.misc.DELETING,
                        cancelUrl : CONFIG.actions.SMS_CANCEL,
                        total : smsCount,
                        successText : i18n.message.CONVERSATION_DELETE_SUCCESS
                    });
                    batchActionWindow.show();
                }

                conversationsCollection.deleteConversationsAsync(ids, session).done(function (resp) {
                    deferred.resolve(resp);
                }).fail(function (resp) {
                    deferred.reject(resp);
                }).always(function () {
                    Threads4ContactCollection.getInstance().trigger('update');
                });
            }, this);

            disposableAlert.show();

            return deferred.promise();
        };

        MessageService.getSmsHasBackupAsync = function () {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.SMS_HAS_BACKUP,
                success : function (resp) {
                    if (resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        MessageService.loadSmsBackupAsync = function () {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.SMS_LOAD_BACKUP,
                success : function (resp) {
                    if (resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        MessageService.closeAllNotificationAsync = function () {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.CLOSE_ALL_NOTIFICATION,
                success : function (resp) {
                    if (resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        return MessageService;
    });
}(this));
