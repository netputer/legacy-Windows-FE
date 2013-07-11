/*global define*/
(function (window) {
    define([
        'backbone',
        'doT',
        'underscore',
        'IO',
        'Configuration',
        'Environment',
        'Internationalization',
        'utilities/QueryString',
        'utilities/StringUtil',
        'ui/TemplateFactory',
        'message/views/MessageSender4NotificationView'
    ], function (
        Backbone,
        doT,
        _,
        IO,
        CONFIG,
        Environment,
        i18n,
        QueryString,
        StringUtil,
        TemplateFactory,
        MessageSender4NotificationView
    ) {
        console.log('NewMessageNotificationView - File loaded.');

        var document = window.document;

        var senderView;

        var NewMessageNotificationView = Backbone.View.extend({
            className : 'w-sms-notification',
            template : doT.template(TemplateFactory.get('message', 'message-notification')),
            initialize : function () {

                senderView = MessageSender4NotificationView.getInstance({
                    model : this.model,
                    enableTip : false
                });

                this.model.on('change', function (message) {
                    this.$('.w-sms-notification-avatar img').attr({
                        src : message.get('contact_icon'),
                        alt : message.get('contact_name')
                    });
                    this.$('.w-sms-notification-body .body').html(message.get('body'));
                    this.$('.w-sms-notification-body .date').html(StringUtil.formatDate(' - hh:mm', message.get('date')));

                    this.updateNotificationTitle();
                }, this);
            },
            updateNotificationTitle : function () {
                IO.requestAsync({
                    url : CONFIG.actions.UPDATE_NOTIFICATION_TITLE,
                    data : {
                        title : StringUtil.format(i18n.message.MESSAGE_FROM, this.model.get('contact_name')),
                        url : document.URL
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('NewMessageNotificationView - Update window title success.');
                        } else {
                            console.error('NewMessageNotificationView - Update window title failed. Error info: ' + resp.state_line);
                        }
                    }
                });
            },
            render :  function () {
                this.$el.html(this.template(this.model.toJSON()));

                this.$el.append(senderView.render().$el);
                return this;
            }
        });

        var factory = _.extend(function () {}, {
            getInstance : function (args) {
                return new NewMessageNotificationView(args);
            }
        });

        return factory;
    });
}(this));
