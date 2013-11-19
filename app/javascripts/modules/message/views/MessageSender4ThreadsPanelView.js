/*global define*/
(function (window) {
    define([
        'doT',
        'underscore',
        'Device',
        'Log',
        'utilities/StringUtil',
        'ui/TemplateFactory',
        'ui/MenuButton',
        'ui/MouseState',
        'ui/PopupPanel',
        'Internationalization',
        'message/views/QuickSenderView',
        'message/MessageService'
    ], function (
        doT,
        _,
        Device,
        log,
        StringUtil,
        TemplateFactory,
        MenuButton,
        MouseState,
        PopupPanel,
        i18n,
        QuickSenderView,
        MessageService
    ) {
        console.log('MessageSender4ThreadsPanelView - File loaded.');

        var setInterval = window.setInterval;
        var clearInterval = window.clearInterval;
        var setTimeout = window.setTimeout;
        var duoquPanel;

        var adjustHeight = function () {
            var maxHeight = 400;
            var $input = this.$('.input-content');
            var adjustedHeight = $input.height();
            if (maxHeight > adjustedHeight) {
                adjustedHeight = Math.max($input[0].scrollHeight - 4, adjustedHeight);
                adjustedHeight = Math.min(maxHeight, adjustedHeight);
                $input.css({
                    height : adjustedHeight
                });
            }

            this.$('.count-down').html(StringUtil.format(i18n.message.CONTENT_COUNT2, $input.val().length));
        };

        var buildSelector = function (contact) {
            this.addresses = contact.defaultNumber;
            var contactPhone = contact.get('phone');

            if (contactPhone.length > 1) {
                var items = _.map(contact.get('phone'), function (phone) {
                    return {
                        type : 'radio',
                        name : contact.get('id'),
                        label : phone.number,
                        checked : this.addresses === phone.number,
                        value : phone.number
                    };
                }, this);

                if (!this.numberSelectorView) {
                    this.numberSelectorView = new MenuButton({
                        label : this.addresses,
                        items : items
                    });

                    this.numberSelectorView.on('select', function (data) {
                        this.numberSelectorView.label = data.label;
                        this.addresses = data.value;
                    }, this);

                    this.$('.number-selector').append(this.numberSelectorView.render().$el);
                } else {
                    this.numberSelectorView.items = items;
                    this.numberSelectorView.label = this.addresses;
                }

                this.$('.selector-ctn').css({
                    display : '-webkit-box'
                });
            } else {
                this.$('.selector-ctn').css({
                    display : 'none'
                });
            }
        };

        var checkDate = function (originDate) {
            originDate = originDate.split('-');
            if (originDate.length === 3) {
                originDate.shift();
            }

            var currentDate = StringUtil.formatDate('MM-dd').split('-');

            return _.isEqual(originDate, currentDate);
        };

        var parseAddresses = function (contact, defaultNumber) {
            if (defaultNumber) {
                this.addresses = defaultNumber;
                this.$('.selector-ctn').hide();
            } else if (contact.get('id') !== '-1') {
                buildSelector.call(this, contact);
            } else {
                this.addresses = contact.defaultNumber;
                this.$('.selector-ctn').hide();
            }

            // This is an Easter egg, will notice u to say hello to ur friend on their birthdays
            if (this.model.birthday && checkDate.call(this, this.model.birthday)) {
                this.$('.input-content').prop({
                    placeholder : i18n.message.BIRTHDAY_TIP
                });
            } else {
                this.$('.input-content').prop({
                    placeholder : i18n.message.SENDER_PLACEHOLDER
                });
            }
        };

        var MessageSender4ThreadsPanelView = QuickSenderView.getClass().extend({
            template : doT.template(TemplateFactory.get('message', 'message-sender-threads-panel')),
            className : 'w-message-quick-sender vbox',
            initialize : function () {
                MessageSender4ThreadsPanelView.__super__.initialize.apply(this, arguments);

                var addresses;
                var hideNumberSelector = true;
                var isFocused = false;
                Object.defineProperties(this, {
                    addresses : {
                        set : function (value) {
                            addresses = value;
                        },
                        get : function () {
                            return addresses;
                        }
                    },
                    hideNumberSelector : {
                        set : function (value) {
                            hideNumberSelector = value;
                        },
                        get : function () {
                            return hideNumberSelector;
                        }
                    },
                    isFocused :  {
                        set : function (value) {
                            isFocused = Boolean(value);
                        },
                        get : function () {
                            return isFocused;
                        }
                    }
                });

                this.on('sendSuccess', function () {
                    this.$('.input-content').focus();
                }, this);

                Device.on('change:isConnected', function (Device, isConnected) {
                    this.disabledSender(!isConnected);
                }, this);
            },
            disabledSender : function (disabled) {
                this.$el.toggle(!disabled);
            },
            update : function (contact, defaultNumber) {
                if (!_.isEqual(contact.toJSON(), this.model.toJSON()) ||
                        defaultNumber !== this.addresses) {

                    this.model = contact.clone();

                    this.$('.input-content').val('');

                    parseAddresses.call(this, contact, defaultNumber);
                }

                setTimeout(function () {
                    this.$('.input-content').focus();
                }.bind(this), 150);
            },
            render : function () {
                _.extend(this.events, MessageSender4ThreadsPanelView.__super__.events);
                this.delegateEvents();

                this.$el.html(this.template({}));

                this.$('.count-down-container').hide();

                setTimeout(function () {
                    this.disabledSender(!Device.get('isConnected'));
                }.bind(this), 0);

                parseAddresses.call(this, this.model, this.options.defaultNumber);

                this.buildButton();

                MessageService.getServiceCenterAsync().done(function (resp) {
                    var serviceCenter = resp.body.sim || [];
                    if (serviceCenter.length > 0) {
                        var $duoqu = this.$('.duoqu').show();

                        if (duoquPanel === undefined) {
                            duoquPanel = new PopupPanel({
                                $host : $duoqu,
                                $content :  i18n.message.MUTIL_SIM_SUPPORT_LINK,
                                alignToHost : false,
                                popIn : true,
                                autoClose : 2000
                            });
                            duoquPanel.$el.on('click', function () {
                                duoquPanel.hide();
                                log({
                                    'event' : 'ui.click.duoqu'
                                });
                            });

                            this.once('remove', function () {
                                duoquPanel.remove();
                                duoquPanel = undefined;
                            });

                            $duoqu.hover(function () {
                                duoquPanel.show();
                            });
                        }
                    }
                }.bind(this));

                return this;
            },
            focusInputContent : function () {
                if (this.isFocused) {
                    return;
                }
                this.isFocused = true;
                var $input = this.$('.input-content');
                var $countDownContainer = this.$('.count-down-container');

                var inputIntervalDelegate = setInterval(function () {
                    if ($input.val().length !== 0) {
                        $countDownContainer.show();
                        $input.css('min-height', '38px');
                        clearInterval(inputIntervalDelegate);
                    }
                }.bind(this), 25);

                var intervalDelegate = setInterval(function () {
                    adjustHeight.call(this);
                }.bind(this), 25);

                var blurHandler = function () {
                    $input.css('min-height', '20px');
                    $input.css('height', '20px');
                    $countDownContainer.hide();

                    clearInterval(intervalDelegate);
                    clearInterval(inputIntervalDelegate);

                    if (this.$('.button-send')[0].contains(MouseState.currentElement)) {
                        this.sendMessage();
                    }
                    this.isFocused = false;
                }.bind(this);

                $input.one('blur', blurHandler);
            },
            events : {
                'focus .input-content' : 'focusInputContent'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new MessageSender4ThreadsPanelView(args);
            }
        });

        return factory;
    });
}(this));
