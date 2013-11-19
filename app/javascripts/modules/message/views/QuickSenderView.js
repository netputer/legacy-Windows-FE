/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'jquery',
        'IO',
        'Internationalization',
        'Device',
        'Log',
        'ui/UIHelper',
        'ui/AlertWindow',
        'ui/MenuButton',
        'ui/PopupPanel',
        'utilities/StringUtil',
        'message/MessageService'
    ], function (
        Backbone,
        _,
        $,
        IO,
        i18n,
        Device,
        log,
        UIHelper,
        AlertWindow,
        MenuButton,
        PopupPanel,
        StringUtil,
        MessageService
    ) {
        console.log('QuickSenderView - File loaded. ');

        var confirm = window.confirm;
        var alert = window.alert;

        var KeyMapping = UIHelper.KeyMapping;

        var QuickSenderView = Backbone.View.extend({
            initialize : function () {
                var enableTip = true;
                var duoquPanel;
                Object.defineProperties(this, {
                    enableTip : {
                        set : function (value) {
                            enableTip = value;
                        },
                        get : function () {
                            return enableTip;
                        }
                    },
                    duoquPanel : {
                        set : function (value) {
                            duoquPanel = value;
                        },
                        get : function () {
                            return duoquPanel;
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
            buildButton : function () {
                MessageService.getServiceCenterAsync().done(function (resp) {
                    var serviceCenter = resp.body.sim || [];

                    if (serviceCenter.length > 0) {
                        this.$el.addClass('dual-sim');

                        var $sendBtnGroup = $('<span>').addClass('w-ui-buttongroup button-send-group');
                        var $sendBtn = $('<button>').addClass('primary button-send').html(i18n.message.SEND + StringUtil.format(i18n.message.SEND_WITH_SPEC_SIM, 1, resp.body.sim[0].sim_name));

                        var items = [];

                        _.each(resp.body.sim, function (service, i) {
                            items.push({
                                type : 'radio',
                                name : 'service-center-send-window',
                                label : service.sim_phone_number ?
                                            StringUtil.format(i18n.message.MUTIL_SIM_SELECT_HAS_NUM, service.sim_name, service.sim_phone_number) :
                                            StringUtil.format(i18n.message.MUTIL_SIM_SELECT, service.sim_name, i + 1),
                                value : i,
                                checked : i === 0
                            });
                        });

                        items.push({
                            type : 'hr'
                        });

                        items.push({
                            type : 'link',
                            name : 'duoqu',
                            label : i18n.message.MUTIL_SIM_SUPPORT_LINK,
                            value : 'duoqu',
                            action : function () {
                                log({
                                    'event' : 'ui.click.message_duoqu'
                                });
                            }
                        });

                        this.serviceCenter = resp.body.sim[0].sim_id;

                        this.serviceBtn = new MenuButton({
                            items : items
                        });

                        $sendBtnGroup.append($sendBtn).append(this.serviceBtn.render().$el.addClass('primary toggle'));
                        this.$('.button-send').replaceWith($sendBtnGroup);

                        this.serviceBtn.on('select', function (item) {
                            var sim = resp.body.sim[item.value];
                            if (sim) {
                                this.serviceCenter = sim.sim_id;
                                $sendBtn.html(i18n.message.SEND + StringUtil.format(i18n.message.SEND_WITH_SPEC_SIM, parseInt(item.value, 10) + 1, sim.sim_name));
                            }
                        }, this);

                        this.buttons = this.buttons;

                        var $duoqu = this.$('.duoqu').show();

                        this.duoquPanel = new PopupPanel({
                            $host : $duoqu,
                            $content :  i18n.message.MUTIL_SIM_SUPPORT_LINK,
                            alignToHost : false,
                            popIn : true,
                            autoClose : 2000
                        });

                        this.listenToOnce(this.duoquPanel, 'show', function () {
                            this.duoquPanel.$('a').one('click', function () {
                                log({
                                    'event' : 'ui.click.duoqu'
                                });
                            });
                        });

                        this.once('remove', function () {
                            this.duoquPanel.remove();
                            this.duoquPanel = undefined;
                        }.bind(this));
                    }
                }.bind(this));
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
                            MessageService.sendMessageAsync(this.addresses, content, this.serviceCenter).done(function () {
                                this.trigger('sendSuccess');

                                $content.prop({
                                    placeholder : i18n.message.SENDER_PLACEHOLDER
                                }).val('');
                            }.bind(this)).fail(function () {
                                alert(i18n.message.SEND_FAILED_ALERT);
                            }).always(function () {
                                this.disabled(false);
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

        var factory = _.extend({
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
