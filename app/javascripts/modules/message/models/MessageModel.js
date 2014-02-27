/*global define*/
(function (window) {
    define([
        'backbone',
        'jquery',
        'IO',
        'Configuration',
        'utilities/StringUtil'
    ], function (
        Backbone,
        $,
        IO,
        CONFIG,
        StringUtil
    ) {
        console.log('MessageModel - File loaded.');

        var DEFUALT_ICON_PATH = 'i18n/' + navigator.language.toLowerCase() + '/images/contact-default-small.png';

        var MessageModel = Backbone.Model.extend({
            initialize : function () {
                Object.defineProperties(this, {
                    isRead : {
                        get : function () {
                            return !!this.get('read');
                        }
                    }
                });

                this.set({
                    contact_name : this.get('contact_name') || this.get('address'),
                    contact_icon : this.get('contact_icon') ? 'file:///' + this.get('contact_icon') : DEFUALT_ICON_PATH,
                    body : StringUtil.conditionalEscape(this.get('body'))
                });
            },
            copyMessageAsync : function () {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.SMS_COPY,
                    data : {
                        text : this.get('body')
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            deferred.resolve(resp);
                        } else {
                            deferred.reject(resp);
                        }
                    }
                });

                return deferred.promise();
            },
            deleteMessageAsync : function () {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.SMS_DELETE,
                    data : {
                        sms_id : this.get('id')
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('MessageModel - Delete message success.');
                            if (this.collection !== undefined) {
                                this.collection.remove(this);
                            }
                            deferred.resolve(resp);
                        } else {
                            console.error('MessageModel - Delete message failed. Error info: ' + resp.state_line);
                            deferred.reject(resp);
                        }
                    }.bind(this)
                });

                return deferred.promise();
            },
            markAsReadAsync : function () {
                var deferred = $.Deferred();

                if (!this.isRead) {
                    IO.requestAsync({
                        url : CONFIG.actions.SMS_MARK_AS_READ,
                        data : {
                            sms_id : this.get('id')
                        },
                        success : function (resp) {
                            if (resp.state_code === 200) {
                                console.log('MessageModel - Mark message as read success.');
                                this.set({
                                    read : true
                                });
                                deferred.resolve(resp);
                            } else {
                                console.error('MessageModel - Mark message as read failed. Error info: ' + resp.state_line);
                                deferred.reject(resp);
                            }
                        }.bind(this)
                    });
                } else {
                    deferred.resolve();
                }

                return deferred.promise();
            },
            markAsUnreadAsync : function () {
                var deferred = $.Deferred();

                if (this.isRead) {
                    IO.requestAsync({
                        url : CONFIG.actions.SMS_MARK_AS_UNREAD,
                        data : {
                            sms_id : this.get('id')
                        },
                        success : function (resp) {
                            if (resp.state_code === 200) {
                                console.log('MessageModel - Mark message as unread success.');
                                this.set({
                                    read : false
                                });
                                deferred.resolve(resp);
                            } else {
                                console.error('MessageModel - Mark message as unread failed. Error info: ' + resp.state_line);
                                deferred.reject(resp);
                            }
                        }.bind(this)
                    });
                } else {
                    deferred.resolve();
                }

                return deferred.promise();
            },
            resendAsync : function () {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.SMS_RESEND,
                    data : {
                        sms_id : this.get('id')
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('MessageModel - Resend message success.');
                            this.set({
                                type : CONFIG.enums.SMS_TYPE_SENDING
                            });
                            deferred.resolve(resp);
                        } else {
                            console.error('MessageModel - Resend message failed. Error info: ' + resp.state_line);
                            deferred.reject(resp);
                        }
                    }.bind(this)
                });

                return deferred.promise();
            },
            openOnDeviceAsync : function () {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.SMS_OPEN_ON_DEVICE,
                    data : {
                        sms_id : this.get('id')
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('MessageModel - Open message on device success.');
                            deferred.resolve(resp);
                        } else {
                            console.error('MessageModel - Open message on device failed. Error info: ' + resp.state_line);
                            deferred.reject(resp);
                        }
                    }
                });

                return deferred.promise();
            }
        });

        return MessageModel;
    });
}(this));
