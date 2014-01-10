/*global define*/
(function (window) {
    define([
        'jquery',
        'backbone',
        'doT',
        'underscore',
        'IO',
        'Log',
        'Configuration',
        'Internationalization',
        'ui/TemplateFactory',
        'utilities/StringUtil'
    ], function (
        $,
        Backbone,
        doT,
        _,
        IO,
        log,
        CONFIG,
        i18n,
        TemplateFactory,
        StringUtil
    ) {

        console.log('PhotoIosSmsView - File loaded');

        var LinkView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('sync', 'ios-sms-get-link')),
            className : 'w-ios-advertisement-get-link',
            render : function () {
                this.$el.html(this.template({}));
                return this;
            },
            clickBtnGetLink : function () {

                this.trigger('ios.show.send_sms');
                log({
                    event: 'ui.click.ios_download_sms',
                    from : 'notification'
                });
            },
            clickGoTo : function () {
                log({
                    event : 'ui.click.ios_download_link',
                    from : 'notification'
                });
            },
            events : {
                'click .goto' : 'clickGoTo',
                'click .button-getlink' : 'clickBtnGetLink'
            }
        });

        var SendView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('sync', 'ios-sms-send')),
            className : 'w-ios-advertisement-send',
            initialize : function () {

                var state = 'disable';
                Object.defineProperties(this, {
                    sendButtonState : {
                        set : function (value) {
                            state = value;
                            var btn = this.$('.button-send');
                            switch (value) {
                            case 'enable':
                                btn.prop('disabled', false);
                                break;
                            case 'disable':
                                btn.prop('disabled', true);
                                break;
                            case 'countdown':
                                btn.prop('disabled', true);
                                var input = this.$('.phone-number').prop('disabled', true);
                                var t = 61;
                                var handler = setInterval(function () {
                                    if (t-- === 1) {
                                        clearInterval(handler);
                                        btn.prop('disabled', false).html(i18n.sync.IOS_ADVERTISMENT_SEND);
                                        input.prop('disabled', false);
                                    } else {
                                        if (t < 10) {
                                            btn.html(StringUtil.format(i18n.sync.IOS_ADVERTISMENT_COUNT_DOWN, '0' + t));
                                        } else {
                                            btn.html(StringUtil.format(i18n.sync.IOS_ADVERTISMENT_COUNT_DOWN, t));
                                        }
                                    }
                                }, 1000);
                                break;
                            }
                        },
                        get : function () {
                            return state;
                        }
                    }
                });
            },
            render : function () {
                this.$el.html(this.template({}));

                var input = this.$('.phone-number');
                var val = input.val();
                setInterval(function () {
                    var newVal = input.val();
                    if (newVal !== val) {
                        val = newVal;
                        this.onInputChange();
                    }
                }.bind(this), 200);

                return this;
            },
            onInputChange : function () {
                var num = $.trim($('.phone-number').val());
                if (num && /1\d{10}/.test(num)) {
                    this.sendButtonState = 'enable';
                } else {
                    this.sendButtonState = 'disable';
                }
            },
            onInputKeyDown : function (e) {
                if (e.keyCode === 13 && this.sendButtonState === 'enable') {
                    this.clickBtnSend();
                }
            },
            clickBtnSend : function () {

                var num = $.trim($('.phone-number').val());
                $.ajax(CONFIG.enums.SMS_GATE, {
                    data : {
                        type : 'YUNXIANGCE',
                        action : 'send',
                        phone : num
                    },
                    dataType : 'jsonp'
                });

                this.sendButtonState = 'countdown';

                log({
                    event : 'ui.click.ios_download_send_sms'
                });
            },
            events : {
                'click .button-send' : 'clickBtnSend',
                'keydown .phone-number' : 'onInputKeyDown'
            }
        });

        var linkView;
        var sendView;
        var factory = {
            getLinkView : function () {
                if (!linkView) {
                    linkView = new LinkView();
                }
                return linkView;
            },
            getSendView : function () {
                if (!sendView) {
                    sendView = new SendView();
                }
                return sendView;
            }
        };

        return factory;
    });
}(this));
