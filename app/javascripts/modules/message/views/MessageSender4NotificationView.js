/*global define*/
(function (window) {
    define([
        'doT',
        'underscore',
        'Configuration',
        'IOBackendDevice',
        'Device',
        'Log',
        'ui/TemplateFactory',
        'message/views/QuickSenderView',
        'message/models/MessageModel',
        'message/MessageService'
    ], function (
        doT,
        _,
        CONFIG,
        IO,
        Device,
        log,
        TemplateFactory,
        QuickSenderView,
        MessageModel,
        MessageService
    ) {
        console.log('MessageSender4NotificationView - File loaded.');

        var MessageSender4NotificationView = QuickSenderView.getClass().extend({
            className : 'w-sms-notification-sender vbox',
            template : doT.template(TemplateFactory.get('message', 'message-notification-sender')),
            initialize : function () {
                var nextList = [];
                var prevList = [];
                Object.defineProperties(this, {
                    addresses : {
                        get : function () {
                            return this.model.get('address');
                        }
                    },
                    nextList : {
                        get : function () {
                            return nextList;
                        }
                    },
                    prevList : {
                        get : function () {
                            return prevList;
                        }
                    }
                });

                Device.on('change:isConnected', function (Device, isConnected) {
                    this.$('.button-send').prop({
                        disabled : !isConnected
                    });
                }, this);

                IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.SMS_CALLLOG_SMS_RECEIVE
                }, function (msg) {
                    this.nextList.push((new MessageModel(msg)).toJSON());

                    this.$('.button-next').show();
                }, this);

                this.on('sendSuccess', function () {
                    log({
                        'event' : 'debug.message_receive_window_send'
                    });

                    if (this.nextList.length === 0 && this.prevList.length === 0) {
                        IO.requestAsync({
                            url : CONFIG.actions.PUBLISH_EVENT,
                            data : {
                                value : JSON.stringify(this.model.toJSON()),
                                channel : CONFIG.events.MESSAGE_CLOSE_MESSAGE_NOTIFICATION
                            }
                        });
                        MessageService.closeAllNotificationAsync();
                    } else if (this.nextList.length > 0) {
                        this.markAsRead();
                        this.nextMessage(true);
                    } else {
                        this.markAsRead();
                        this.prevMessage(true);
                    }
                }, this);
            },
            render : function () {
                _.extend(this.events, MessageSender4NotificationView.__super__.events);
                this.delegateEvents();

                this.$el.html(this.template({}));

                this.buildButton();
                this.$('.button-send').prop({
                    disabled : !Device.get('isConnected')
                });
                this.$('.button-delete').show();

                return this;
            },
            nextMessage : function (ignoreCurrent) {
                this.$('.input-content').val('');
                if (!ignoreCurrent) {
                    this.prevList.push(this.model.toJSON());
                }

                if (this.prevList.length > 0) {
                    this.$('.button-prev').show();
                }


                this.model.clear({ silent : true });
                this.model.set(this.nextList.shift());

                if (this.nextList.length === 0) {
                    this.$('.button-next').hide();
                }
            },
            prevMessage : function (ignoreCurrent) {
                this.$('.input-content').val('');
                if (!ignoreCurrent) {
                    this.nextList.unshift(this.model.toJSON());
                }

                if (this.nextList.length > 0) {
                    this.$('.button-next').show();

                }

                this.model.clear({ silent : true });
                this.model.set(this.prevList.pop());

                if (this.prevList.length === 0) {
                    this.$('.button-prev').hide();
                }
            },
            markAsRead : function () {
                IO.requestAsync({
                    url : CONFIG.actions.PUBLISH_EVENT,
                    data : {
                        value : JSON.stringify(this.model.toJSON()),
                        channel : CONFIG.events.MESSAGE_MARK_AS_READ
                    }
                });
            },
            deleteMessage : function () {
                this.$('.button-delete').removeClass('link');
                this.model.deleteMessageAsync().done(function () {
                    MessageService.closeAllNotificationAsync();
                }).always(function () {
                    this.$('.button-delete').addClass('link');
                });
            },
            clickButtonDelete : function () {
                this.deleteMessage();

                log({
                    'event' : 'ui.click.message_receive_window_delete'
                });
            },
            clickButtonNext : function () {
                this.markAsRead();
                this.nextMessage();

                log({
                    'event' : 'ui.click.message_receive_window_next'
                });
            },
            clickButtonPrev : function () {
                this.markAsRead();
                this.prevMessage();

                log({
                    'event' : 'ui.click.message_receive_window_prev'
                });
            },
            events : {
                'click .button-delete' : 'clickButtonDelete',
                'click .button-next' : 'clickButtonNext',
                'click .button-prev' : 'clickButtonPrev'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new MessageSender4NotificationView(args);
            }
        });

        return factory;
    });
}(this));
