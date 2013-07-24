/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'Device',
        'ui/TemplateFactory',
        'ui/AlertWindow',
        'ui/ToastBox',
        'Internationalization',
        'Configuration',
        'message/views/MessageSenderView'
    ], function (
        Backbone,
        _,
        doT,
        Device,
        TemplateFactory,
        AlertWindow,
        ToastBox,
        i18n,
        CONFIG,
        MessageSenderView
    ) {
        console.log('ThreadsMessageItemView - File loaded.');

        var alert = window.alert;

        var scrollHandler = function () {
            this.$el[0].scrollIntoView();
        };

        var connectedHandler = function (Device, isConnected) {
            this.$('button, .button-open-on-device').prop('disabled', !isConnected);
        };

        var changeHandler = function (model) {
            this.$el.toggleClass('text-bold', !model.isRead);
        };

        var copyViewInstance;

        var ThreadsMessageItemView = Backbone.View.extend({
            tagName : 'li',
            template : doT.template(TemplateFactory.get('message', 'threads-item-message')),
            className : 'hbox',
            initialize : function () {
                this.listenTo(this.model, 'change:read', changeHandler);
                this.listenTo(this.model, 'change:type change:body', this.render);
                this.listenTo(this.model, 'remove', this.remove);
                this.listenTo(this.model, 'scrollTo', scrollHandler);
                this.listenTo(Device, 'change:isConnected', connectedHandler);

                this.$el.toggleClass('from-me', this.model.get('type') !== CONFIG.enums.SMS_TYPE_RECEIVE)
                        .toggleClass('text-bold', !this.model.isRead);
            },
            render : function () {
                this.$el.html(this.template(this.model.toJSON()));

                connectedHandler.call(this, Device, Device.get('isConnected'));

                if (!this.model.isRead) {
                    setTimeout(function () {
                        this.model.markAsReadAsync();
                    }.bind(this), 3000);
                }
                return this;
            },
            clickItem : function () {
                if (!this.model.isRead) {
                    this.model.markAsReadAsync();
                }
            },
            clickButtonCopy : function () {
                this.model.copyMessageAsync().done(function () {
                    if (!copyViewInstance) {
                        copyViewInstance = new ToastBox({
                            $content : i18n.message.COPY_SMS
                        });
                    }
                    copyViewInstance.once('remove', function () {
                        copyViewInstance = undefined;
                    });
                    copyViewInstance.show();
                });
            },
            clickButtonDelete : function () {
                this.model.deleteMessageAsync().done(this.remove.bind(this)).fail(function () {
                    alert(i18n.message.DELETE_FAILD);
                });
            },
            clickButtonForward : function () {
                var messageSenderView = MessageSenderView.getInstance();
                var showHandler = function () {
                    messageSenderView.setContent(this.model.get('body'));
                };
                messageSenderView.once('show', showHandler, this);
                messageSenderView.show();
            },
            clickButtonResend : function () {
                this.model.resendAsync();
            },
            clickButtonOpenOnDevice : function () {
                this.model.openOnDeviceAsync();
            },
            clickButtonToggle : function () {
                var $content = this.$('.mms-content');
                var $button = this.$('.button-toggle');
                if ($content.hasClass('wc')) {
                    $content.removeClass('wc');
                    $button.html(i18n.misc.COLLAPSE);
                } else {
                    $content.addClass('wc');
                    $button.html(i18n.message.EXPEND);
                }
                this.$el[0].scrollIntoView();
            },
            events : {
                'click' : 'clickItem',
                'click .button-delete' : 'clickButtonDelete',
                'click .button-reply' : 'clickButtonForward',
                'click .button-resend' : 'clickButtonResend',
                'click .button-open-on-device' : 'clickButtonOpenOnDevice',
                'click .button-toggle' : 'clickButtonToggle',
                'click .button-copy' : 'clickButtonCopy'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new ThreadsMessageItemView(args);
            }
        });

        return factory;
    });
}(this));
