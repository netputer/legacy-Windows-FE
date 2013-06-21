/*global define*/
(function (window, undefined) {
    define([
        'backbone',
        'underscore',
        'IO',
        'Internationalization',
        'Device',
        'ui/TemplateFactory',
        'ui/UIHelper',
        'ui/AlertWindow',
        'message/MessageService'
    ], function (
        Backbone,
        _,
        IO,
        i18n,
        Device,
        TemplateFactory,
        UIHelper,
        AlertWindow,
        MessageService
    ) {
        console.log('QuickSenderView - File loaded. ');

        var confirm = window.confirm;

        var KeyMapping = UIHelper.KeyMapping;

        var QuickSenderView = Backbone.View.extend({
            initialize : function () {
                var enableTip = true;
                Object.defineProperties(this, {
                    enableTip : {
                        set : function (value) {
                            enableTip = value;
                        },
                        get : function () {
                            return enableTip;
                        }
                    }
                });

                this.listenTo(Device, 'change:isConnected', function (Device, isConnected) {
                    this.disabled(!isConnected);
                });

                if (this.options.hasOwnProperty('enableTip')) {
                    enableTip = this.options.enableTip;
                }
            },
            disabled : function (disabled) {
                disabled = disabled === undefined ? true : disabled;

                this.$('.input-content, .button-send').prop({
                    disabled : disabled
                });
            },
            sendMessage : function () {
                var $content = this.$('.input-content');
                if (!$content.prop('disabled')) {
                    var content = $content.val();

                    if (content.length === 0) {
                        $content.prop({
                            placeholder : i18n.message.PLEASE_INPUT_CONTENT
                        });
                    } else {
                        var sendHandler = function () {
                            this.disabled();
                            MessageService.sendMessageAsync(this.addresses, content).done(function () {
                                this.trigger('sendSuccess');
                            }.bind(this)).always(function () {
                                this.disabled(false);

                                $content.prop({
                                    placeholder : ''
                                }).val('');
                            }.bind(this));
                        };
                        if (this.enableTip) {
                            if (content.length >= 350) {
                                confirm(i18n.message.MESSAGE_TOO_LONG, sendHandler, this);
                            } else {
                                sendHandler.call(this);
                            }
                        } else {
                            sendHandler.call(this);
                        }
                    }
                }
            },
            clickButtonSend : function () {
                this.sendMessage();
            },
            keydownInputContent : function (evt) {
                if (evt.ctrlKey && evt.keyCode === KeyMapping.ENTER) {
                    this.sendMessage();
                }

                if (evt.keyCode === KeyMapping.ESC) {
                    this.$('.input-content').blur();
                }
            },
            events : {
                'click .button-send' : 'clickButtonSend',
                'keydown .input-content' : 'keydownInputContent'
            }
        });

        var factory = _.extend(function () {}, {
            getInstance : function (args) {
                return new QuickSenderView(args);
            },
            getClass : function () {
                return QuickSenderView;
            }
        });

        return factory;
    });
}(this));
