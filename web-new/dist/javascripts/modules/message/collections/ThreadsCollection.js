/*global define*/
(function (window, undefined) {
    define([
        'backbone',
        'underscore',
        'jquery',
        'Configuration',
        'Device',
        'IOBackendDevice',
        'message/models/ThreadModel',
        'message/models/MessageModel'
    ], function (
        Backbone,
        _,
        $,
        CONFIG,
        Device,
        IO,
        ThreadModel,
        MessageModel
    ) {
        console.log('ThreadsCollection - File loaded.');


        var ThreadsCollection = Backbone.Collection.extend({
            url : CONFIG.actions.SMS_GET_THREADS,
            model : ThreadModel,
            data : {
                type : CONFIG.enums.SMS_THREADS_TYPE_SPECIFY_ID,
                unread : 0,
                start : 0,
                page_number : -1
            },
            initialize : function () {
                var loading = false;
                var isBatch = false;
                var receivers = [];
                var defaultNumber;
                Object.defineProperties(this, {
                    loading : {
                        set : function (value) {
                            loading = Boolean(value);
                        },
                        get : function () {
                            return loading;
                        }
                    },
                    isBatch : {
                        get : function () {
                            return isBatch;
                        }
                    },
                    receivers : {
                        get : function () {
                            return receivers;
                        }
                    },
                    failedCount : {
                        get : function () {
                            var count = 0;
                            _.map(this.models, function (thread) {
                                var types = _.pluck(thread.get('sms'), 'type');
                                count += (types.length - _.without(types, CONFIG.enums.SMS_TYPE_SENT_FAILD).length);
                            });
                            return count;
                        }
                    },
                    sendingCount : {
                        get : function () {
                            var count = 0;
                            _.map(this.models, function (thread) {
                                var types = _.pluck(thread.get('sms'), 'type');
                                count += types.length - _.without(types, CONFIG.enums.SMS_TYPE_SENDING).length;
                            });
                            return count;
                        }
                    },
                    defaultNumber : {
                        get : function () {
                            return defaultNumber;
                        }
                    }
                });

                var convertBatchReceivers = function () {
                    receivers.length = 0;
                    if (this.length > 0) {
                        var addresses = _.uniq(_.map(this.models, function (thread) {
                            return thread.get('address');
                        }));

                        isBatch = addresses.length > 1;

                        if (isBatch) {
                            _.each(addresses, function (address) {
                                this.receivers.push(_.find(this.models, function (thread) {
                                    return thread.get('address') === address;
                                }));
                            }, this);
                        } else {
                            defaultNumber = this.models[0].get('phone_number');
                        }
                    }
                };

                this.on('update', function () {
                    loading = true;
                    this.fetch({
                        success : function (collection) {
                            console.log('ThreadsCollection - Collection updated.');
                            collection.loading = false;
                            convertBatchReceivers.call(collection);
                            collection.trigger('refresh', collection);
                        },
                        reset : true
                    });
                }, this);

                this.on('remove', function (thread) {
                    if (this.length === 0) {
                        this.trigger('empty');
                    }
                }, this);

                this.listenTo(Device, 'change:isConnected', function (Device, isConnected) {
                    if (isConnected) {
                        this.trigger('update');
                    }
                }, this);

                IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.SMS_CALLLOG_SMS_RECEIVE
                }, function (data) {
                    if (this.getThreadWithMessage(data.id)) {
                        this.trigger('update');
                    }
                }, this);

                IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.SMS_CALLLOG_SMS_UPDATED
                }, function (data) {
                    if (!!data) {
                        this.trigger('update');
                    }
                }, this);
            },
            parse : function (resp) {
                return resp.body.thread || [];
            },
            getThreadWithMessage : function (id) {
                return this.filter(function (thread) {
                    var ids = _.pluck(thread.get('sms'), 'id');
                    return ids.indexOf(id) >= 0;
                })[0];
            },
            getFailedMessage : function () {
                var messageFailed = [];
                _.map(this.models, function (thread) {
                    messageFailed = messageFailed.concat(_.filter(thread.get('sms'), function (sms) {
                        return sms.type === CONFIG.enums.SMS_TYPE_SENT_FAILD;
                    }));
                });
                return messageFailed;
            },
            resendAllAsync : function () {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.SMS_BATCH_RESEND,
                    data : {
                        sms_id : _.pluck(this.getFailedMessage(), 'id').join(',')
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('ThreadsCollection - Batch resend SMS success.');
                            deferred.resolve(resp);
                        } else {
                            console.error('ThreadsCollection - Batch resend SMS faild. Error info: ' + resp.state_line);
                            deferred.reject(resp);
                        }
                    }
                });

                return deferred.promise();
            }
        });

        var threadsCollection;

        var factory = _.extend({
            getInstance : function (args) {
                if (!threadsCollection) {
                    threadsCollection = new ThreadsCollection(args);
                    threadsCollection.trigger('update');
                }
                return threadsCollection;
            },
            getClass : function () {
                return ThreadsCollection;
            }
        });

        return factory;
    });
}(this));
