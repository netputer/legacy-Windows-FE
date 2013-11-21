/*global define, console*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'Internationalization',
        'Device',
        'Configuration',
        'FunctionSwitch',
        'IO',
        'Log',
        'ui/UIHelper',
        'ui/TemplateFactory',
        'ui/Panel',
        'ui/AlertWindow',
        'ui/PopupPanel',
        'ui/MenuButton',
        'utilities/StringUtil',
        'message/MessageService',
        'message/views/ContactSuggestionView',
        'message/views/MonitorItemView',
        'message/views/BatchContactsSelectorView',
        'contact/collections/ContactMultiNumbersCollection'
    ], function (
        Backbone,
        _,
        doT,
        $,
        i18n,
        Device,
        CONFIG,
        FunctionSwitch,
        IO,
        log,
        UIHelper,
        TemplateFactory,
        Panel,
        AlertWindow,
        PopupPanel,
        MenuButton,
        StringUtil,
        MessageService,
        ContactSuggestionView,
        MonitorItemView,
        BatchContactsSelectorView,
        ContactMultiNumbersCollection
    ) {
        console.log('MessageSenderView - File loaded.');

        var document = window.document;
        var confirm = window.confirm;
        var alert = window.alert;
        var clearInterval = window.clearInterval;
        var setInterval = window.setInterval;

        var EventsMapping = UIHelper.EventsMapping;
        var KeyMapping = UIHelper.KeyMapping;

        var CLASS_MAPPING = {
            CONTACT_ADDRESS_INPUT : '.input-contact',
            CONTACT_ITEM : '.text',
            MONITOR_ITEM : '.w-message-contact-selector-monitor-item',
            CONTACTS_COUNT : '.monitor .contacts-count',
            CONTENT_COUNT : '.monitor .content-count'
        };

        var validateNumber = function (phoneNumber) {
            return true;
        };

        var contactMultiNumbersCollection;

        var senderBodyView;

        var contactsSelector;

        var receiverList = [];

        var contactSuggestionView;

        var serviceBtn;

        var SenderBodyView = Backbone.View.extend({
            className : 'w-message-sender-window',
            template : doT.template(TemplateFactory.get('message', 'message-sender')),
            initialize : function () {
                var contactsCount = 0;
                var contentCount = 0;
                Object.defineProperties(this, {
                    contactsCount : {
                        set : function (value) {
                            this.$(CLASS_MAPPING.CONTACTS_COUNT).html(StringUtil.format(i18n.message.CONTACTS_COUNT, value));
                        },
                        get : function () {
                            return contactsCount;
                        }
                    },
                    contentCount : {
                        set : function (value) {
                            var content = StringUtil.format(i18n.message.CONTENT_COUNT, value);
                            var messageNumber = Math.round(parseInt(value, 10) / CONFIG.enums.SINFGLE_MESSAGE_CHAR_NUMBER);
                            if (messageNumber > 0) {
                                content += StringUtil.format(i18n.message.MESSAGE_COUNT, messageNumber);
                            }
                            this.$(CLASS_MAPPING.CONTENT_COUNT).html(content);
                        },
                        get : function () {
                            return contentCount;
                        }
                    }
                });

                receiverList.length = 0;

                contactMultiNumbersCollection = ContactMultiNumbersCollection.getInstance();

                this.on(EventsMapping.RENDERED, this.buildContent, this);
            },
            addContact : function (contact) {
                var item;
                if (contact instanceof Array) {
                    var fragment = document.createDocumentFragment();
                    _.each(contact, function (con) {
                        var model = con.id ? contactMultiNumbersCollection.get(con.id) : con;
                        if (receiverList.indexOf(model.get('phoneNumber')) < 0) {
                            receiverList.push(model.get('phoneNumber'));

                            var monitorItemView = MonitorItemView.getInstance({
                                model : model
                            });
                            var deleteHandler = function (contact) {
                                receiverList.splice(receiverList.indexOf(contact.get('phoneNumber')), 1);

                                this.contactsCount = receiverList.length;

                                monitorItemView.off('delete', deleteHandler);
                            };
                            monitorItemView.on('delete', deleteHandler, this);

                            fragment.appendChild(monitorItemView.render().$el[0]);
                        }

                    }, this);
                    item = fragment;
                } else {
                    var model = contact.id ? contactMultiNumbersCollection.get(contact.id) : contact;
                    if (receiverList.indexOf(model.get('phoneNumber')) < 0) {
                        receiverList.push(model.get('phoneNumber'));

                        var monitorItemView = MonitorItemView.getInstance({
                            template : doT.template(TemplateFactory.get('message', 'monitor-item-sender')),
                            model : model
                        });

                        var deleteHandler = function (contact) {
                            receiverList.splice(receiverList.indexOf(contact.get('phoneNumber')), 1);

                            this.contactsCount = receiverList.length;

                            monitorItemView.off('delete', deleteHandler);
                        };

                        monitorItemView.on('delete', deleteHandler, this);

                        item = monitorItemView.render().$el;
                    }
                }

                var $searchbox = this.$('.searchbox');

                $searchbox.before(item);
                $searchbox[0].scrollIntoView();

                this.contactsCount = receiverList.length;
            },
            buildSuggestion : function () {
                contactSuggestionView = ContactSuggestionView.getInstance({
                    $host : this.$('.searchbox'),
                    $locator : this.$('.address'),
                    autoHighlight : false
                });

                contactSuggestionView.bind('selectContact', function (contact) {
                    this.$('.searchbox').val('');
                    this.addContact(contact);
                }, this);

                contactSuggestionView.on('focused', this.focusInputContact, this);
            },
            buildContent : function () {
                this.buildSuggestion();
            },
            render : function () {
                this.delegateEvents();
                this.$el.html(this.template({}));

                this.contentCount = 0;
                this.contactsCount = 0;

                var panel;
                if (!FunctionSwitch.ENABLE_DUAL_SIM) {
                    this.$('.multi-sim-tip').remove();
                } else {
                    var $simTip = this.$('.multi-sim-tip');
                    panel = new PopupPanel({
                        $content : i18n.message.PROBLEM_WITH_DUAL_SIM_PHONE_TIP,
                        $host : $simTip
                    });
                }

                var $batchTip = this.$('.batch-send-tip');
                panel = new PopupPanel({
                    $content : i18n.message.ADD_BATCH_RECEIVER_TIP,
                    $host : $batchTip
                });
                panel.zero();

                this.trigger(EventsMapping.RENDERED);
                return this;
            },
            addPlaceholder : function () {
                var $input = this.$('.input-content');
                var $t = $input[0];

                var value = '$NAME';

                if (document.selection) {
                    $input.focus();
                    var sel = document.selection.createRange();
                    sel.text = value;
                    $input.focus();
                } else if ($t.selectionStart || $t.selectionStart === 0) {
                    var startPos = $t.selectionStart;
                    var endPos = $t.selectionEnd;
                    var scrollTop = $t.scrollTop;
                    $t.value = $t.value.substring(0, startPos) + value + $t.value.substring(endPos, $t.value.length);
                    $input.focus();
                    $t.selectionStart = startPos + value.length;
                    $t.selectionEnd = startPos + value.length;
                    $t.scrollTop = scrollTop;
                } else {
                    $input.value += value;
                    $input.focus();
                }

            },
            keydownContent : function (evt) {
                this.contentCount = evt.target.value.length;
            },
            keyupInputContact : function () {
                var value = $(CLASS_MAPPING.CONTACT_ADDRESS_INPUT).val();
                if (value.length === 0) {
                    var $contactItems = this.$(CLASS_MAPPING.CONTACT_ITEM);
                    $($contactItems[$contactItems.length - 1]).remove();
                }
            },
            addContatInputValueToList : function () {
                var $input = this.$('.input-contact');
                var value = $input.val();

                if (value.trim().length !== 0) {
                    value = value.replace(/,|，|;|；/gi, ',');
                    var contacts = value.split(',');
                    _.each(contacts, function (contact) {
                        if (validateNumber(contact)) {
                            var model = new Backbone.Model({
                                displayNumber : contact,
                                phoneNumber : contact
                            });

                            this.addContact(model);
                        }
                    }, this);

                    $input.val('');
                }
            },
            keydownInputContact : function (evt) {
                var keyCode = evt.keyCode;
                var $input = this.$('.input-contact');
                var value = $input.val();

                if (keyCode === KeyMapping.BACKSPACE) {
                    if (value.length === 0) {
                        var $monitorItems = this.$(CLASS_MAPPING.MONITOR_ITEM);
                        var deleteNumber = $($monitorItems[$monitorItems.length - 1]).remove().find('span').prop('title');
                        receiverList.splice(receiverList.indexOf(deleteNumber), 1);

                        this.contactsCount = receiverList.length;
                    }
                } else {
                    var acceptKey = [KeyMapping.ENTER, KeyMapping.SPACEBAR, 186, 188];

                    if (acceptKey.indexOf(keyCode) >= 0) {
                        if (keyCode === KeyMapping.ENTER &&
                                contactSuggestionView.collection.getCurrentSelectContact()) {
                            return;
                        }
                        evt.preventDefault();
                        this.addContatInputValueToList();
                    }
                }
            },
            clickAddress : function (evt) {
                this.$('.input-contact').focus();
            },
            focusInputContact : function () {
                var $input = this.$('.input-contact');

                var keydownInputContactHandler = this.keydownInputContact.bind(this);

                $input.on('keydown', keydownInputContactHandler);

                var blurHandler = function () {
                    this.$('.address').removeClass('focus');
                    if (contactSuggestionView.$($(UIHelper.MouseState.currentElement)).length === 0 && contactSuggestionView.$el[0] !== UIHelper.MouseState.currentElement) {
                        this.addContatInputValueToList();
                    }
                    $input.off('keydown', keydownInputContactHandler);
                    $input.off('blur', blurHandler);
                    $input.removeClass('focus');
                }.bind(this);

                $input.on('blur', blurHandler);
            },
            focusInputContent : function () {
                var $input = this.$('.input-content');

                if ($input.hasClass('focus')) {
                    return;
                }

                var countInterval = setInterval(function () {
                    this.contentCount = this.$('.input-content').val().length;
                }.bind(this), 100);

                var blurHandler = function () {
                    clearInterval(countInterval);
                    $input.off('blur', blurHandler).removeClass('focus');
                }.bind(this);

                $input.on('blur', blurHandler).addClass('focus');
            },
            clickButtonAddContact : function () {
                contactsSelector.show();
            },
            setContent : function (content) {
                this.$('.input-content').val(content);
                this.contentCount = content.length;
            },
            events : {
                'click .address' : 'clickAddress',
                'click .button-add-contact' : 'clickButtonAddContact',
                'focus .input-content' : 'focusInputContent'
            }
        });

        var MessageSenderView = Panel.extend({
            initialize : function () {
                MessageSenderView.__super__.initialize.call(this, arguments);

                var serviceCenter;
                var sendFrom = '';
                Object.defineProperties(this, {
                    serviceCenter : {
                        set : function (value) {
                            serviceCenter = value;
                        },
                        get : function () {
                            return serviceCenter;
                        }
                    },
                    sendFrom : {
                        set : function (value) {
                            sendFrom = value;
                        },
                        get : function () {
                            return sendFrom;
                        }
                    }
                });

                var $sendBtn = $('<button>').html(i18n.message.SEND).addClass('button-send primary');

                Device.on('change:isConnected', function (Device, isConnected) {
                    this.$el.find('.button-send').prop({
                        disabled : !isConnected
                    });

                    if (serviceBtn) {
                        serviceBtn.$el.prop('disabled', !isConnected);
                    }
                }, this);

                this.buttons = [{
                    $button : $sendBtn,
                    eventName : 'button_send'
                }, {
                    $button : $('<button>').html(i18n.ui.CANCEL),
                    eventName : EventsMapping.BUTTON_CANCEL
                }];

                this.on(EventsMapping.SHOW, function () {
                    this.buildButton();

                    senderBodyView = new SenderBodyView();

                    this.$bodyContent = senderBodyView.render().$el;

                    this.center();

                    this.once(EventsMapping.REMOVE, function () {
                        senderBodyView.remove();
                        senderBodyView = undefined;

                        contactsSelector.remove();
                        contactsSelector = undefined;

                        contactSuggestionView.remove();
                        contactSuggestionView = undefined;

                        if (serviceBtn) {
                            serviceBtn.remove();
                            serviceBtn = undefined;
                        }
                    }, this);
                }, this);

                contactsSelector = BatchContactsSelectorView.getInstance();

                contactsSelector.on(EventsMapping.BUTTON_YES, function () {
                    var contacts = contactsSelector.getSelectedContacts();
                    senderBodyView.addContact(contacts);
                }, this);
            },
            addReceivers : function (contacts) {
                if (contacts instanceof Array && contacts.length > 0) {
                    contacts = _.map(contacts, function (contact) {
                        if (contact.defaultNumber) {
                            return new Backbone.Model({
                                displayTitle : contact.get('displayName'),
                                title : contact.get('displayName'),
                                displayNumber : contact.defaultNumber,
                                phoneNumber : contact.defaultNumber
                            });
                        }
                    });
                    senderBodyView.addContact(_.compact(contacts));
                } else {
                    var model = new Backbone.Model({
                        displayNumber : contacts,
                        phoneNumber : contacts
                    });

                    senderBodyView.addContact(model);
                }

                if (receiverList.length > 0) {
                    senderBodyView.$('.input-content').focus();
                }
            },
            setContent : function (content) {
                content = content.replace(/<em>|<\/em>/gi, '');
                senderBodyView.setContent(content);

                if (receiverList.length === 0) {
                    senderBodyView.$('.input-contact').focus();
                }
            },
            setSource : function (source) {
                this.sendFrom = source;
            },
            buildButton : function () {
                MessageService.getServiceCenterAsync().done(function (resp) {
                    var serviceCenter = resp.body.sim || [];

                    if (serviceCenter.length > 0) {

                        this.buttons.shift();

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
                                    'event' : 'ui.click.duoqu'
                                });
                            }
                        });

                        this.serviceCenter = resp.body.sim[0].sim_id;

                        serviceBtn = new MenuButton({
                            items : items
                        });
                        serviceBtn.menu.alignToHost = false;

                        $sendBtnGroup.append($sendBtn).append(serviceBtn.render().$el.addClass('primary toggle'));

                        this.buttons.unshift({
                            $button : $sendBtnGroup
                        });

                        serviceBtn.on('select', function (item) {

                            var sim = resp.body.sim[item.value];
                            if (sim) {
                                this.serviceCenter = sim.sim_id;
                                $sendBtn.html(i18n.message.SEND + StringUtil.format(i18n.message.SEND_WITH_SPEC_SIM, parseInt(item.value, 10) + 1, sim.sim_name));
                            }
                        }, this);

                        this.buttons = this.buttons;
                    }
                }.bind(this));
            },
            render : function () {
                _.extend(this.events, MessageSenderView.__super__.events);
                this.delegateEvents();
                MessageSenderView.__super__.render.apply(this, arguments);
            },
            disabled : function (disabled) {
                disabled = disabled === undefined ? true : disabled;

                var $content = this.$('.input-content');
                var $buttonSend = this.$('.button-send, .button-send-sim1, .button-send-sim2');

                $content.prop({
                    disabled : disabled
                });

                $buttonSend.prop({
                    disabled : disabled
                });
            },
            sendMessage : function () {
                var $content = this.$('.input-content');
                var content = $content.val();

                if (content.length === 0) {
                    $content.prop({
                        placeholder : i18n.message.PLEASE_INPUT_CONTENT
                    });
                    $content.focus();
                } else if (receiverList.length === 0) {
                    senderBodyView.$('.input-contact').focus();
                } else {
                    var sendHandler = function () {
                        this.disabled();
                        MessageService.sendMessageAsync(receiverList, content, this.serviceCenter, this.sendFrom)
                            .always(function () {
                                this.disabled(false);
                            }.bind(this))
                            .done(this.close.bind(this))
                            .fail(function (resp) {
                                if (resp.state_code === 740) {
                                    var panel = new AlertWindow({
                                        title : i18n.message.BATCH_SEND_TITLE,
                                        $bodyContent : i18n.message.BATCH_SEND_TOO_MANY_TIP,
                                        buttonSet : 'yes',
                                        width : 360
                                    });

                                    panel.show();
                                } else {
                                    alert(i18n.message.SEND_FAILED_ALERT);
                                }
                            });
                    };

                    if (content.length >= 350) {
                        confirm(i18n.message.MESSAGE_TOO_LONG, sendHandler, this);
                    } else {
                        sendHandler.call(this);
                    }
                }
            },
            addContactById : function (id) {
                senderBodyView.addContact(contactMultiNumbersCollection.get(id));
            },
            clickButtonSend : function () {
                this.sendMessage();
            },
            clickButtonAddPlaceholder : function () {
                senderBodyView.addPlaceholder();
            },
            keydownInputContent : function (evt) {
                if (evt.ctrlKey && evt.keyCode === KeyMapping.ENTER) {
                    this.sendMessage();
                }
            },
            events : {
                'click .button-send' : 'clickButtonSend',
                'click .button-add-placeholder' : 'clickButtonAddPlaceholder',
                'keydown .input-content' : 'keydownInputContent'
            }
        });

        var factory = _.extend({
            getInstance : function () {
                return new MessageSenderView({
                    draggable : true,
                    title : i18n.message.SEND_MESSAGE,
                    width : 480
                });
            },
            getClass : function () {
                return MessageSenderView;
            }
        });

        return factory;
    });
}(this));
