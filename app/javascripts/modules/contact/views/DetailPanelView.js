/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'ui/TemplateFactory',
        'ui/MenuButton',
        'ui/AlertWindow',
        'ui/PopupTip',
        'ui/PopupPanel',
        'utilities/StringUtil',
        'Configuration',
        'Device',
        'Internationalization',
        'IO',
        'Log',
        'contact/EditorConfig',
        'contact/collections/ContactsCollection',
        'contact/collections/AccountCollection',
        'contact/views/AddGroupWindowView',
        'contact/views/CategoryMenuView',
        'contact/views/ContactsListView',
        'contact/views/CustomInfoWindowView',
        'contact/views/AvatarEditorView',
        'contact/views/AccountSelectorView',
        'message/views/ThreadsPanel4ContactView',
        'message/views/MessageSender4ThreadsPanelView',
        'message/collections/Threads4ContactCollection'
    ], function (
        Backbone,
        _,
        doT,
        $,
        TemplateFactory,
        MenuButton,
        AlertWindow,
        PopupTip,
        PopupPanel,
        StringUtil,
        CONFIG,
        Device,
        i18n,
        IO,
        log,
        EditorConfig,
        ContactsCollection,
        AccountCollection,
        AddGroupWindowView,
        CategoryMenuView,
        ContactsListView,
        CustomInfoWindowView,
        AvatarEditorView,
        AccountSelectorView,
        ThreadsPanel4ContactView,
        MessageSender4ThreadsPanelView,
        Threads4ContactCollection
    ) {
        console.log('DetailPanelView - File loaded. ');

        var alert = window.alert;

        var $helper = $('<div>').addClass('w-ui-helper');

        var isChangedItem = function (item, propValue, oldValue) {
            var isChanged = false;
            if (item) {
                oldValue = oldValue || '';
                if (String(item[propValue]) !== String(oldValue)) {
                    isChanged = true;
                } else {
                    isChanged = false;
                }
            } else if (oldValue) {
                isChanged = true;
            } else {
                isChanged = false;
            }
            return isChanged;
        };

        var isEmptyArray = function (arr, propValue) {
            return (!arr || arr.length === 0 || (arr.length === 1 && !arr[0][propValue]));
        };

        var isChangedItems = function (arr1, arr2, propType, propValue) {
            var empty1 = isEmptyArray(arr1, propValue);
            var empty2 = isEmptyArray(arr2, 'value');

            var flag = false;
            if (!empty1 && !empty2) {
                if (arr1.length !== arr2.length) {
                    flag = true;
                } else {
                    var p1, p2;
                    var i;
                    for (i = 0; i < arr1.length; i++) {
                        p1 = arr1[i];
                        p2 = arr2[i];
                        if (String(p1[propType]) !== String(p2.type) ||
                                String(p1.label) !== String(p2.label) ||
                                String(p1[propValue]) !== String(p2.value)) {
                            flag = true;
                        }
                    }
                }
            } else if (empty1 && empty2) {
                flag = false;
            } else {
                flag = true;
            }

            return flag;
        };

        var genButtons = function ($ctn) {
            var source = [];
            var cate = $ctn.data('cate');

            switch (cate) {
            case 'phone':
                source = EditorConfig.PHONE_OPTION;
                break;
            case 'email':
                source = EditorConfig.EMAIL_OPTION;
                break;
            case 'im':
                source = EditorConfig.IM_OPTION;
                break;
            case 'address':
                source = EditorConfig.ADDRESS_OPTION;
                break;
            case 'org':
                source = EditorConfig.ORGANIZATION_OPTION;
                break;
            default:
                return;
            }

            var items = [];
            var type = $ctn.data('type');
            var cateLabel = $ctn.data('label');
            var name = _.uniqueId('contact-editor-' + cate);
            var item;
            var targetCate = _.find(source, function (item) {
                return item.value === parseInt(type, 10);
            });
            var i;
            for (i = 0; i < source.length; i++) {
                item = source[i];
                items.push({
                    type : 'radio',
                    name : name,
                    value : item.value,
                    label : item.name,
                    checked : targetCate ? _.isEqual(item, targetCate) : false
                });
            }

            if (targetCate === undefined) {
                items[0].checked = true;
            }

            var menuButton = new MenuButton({
                items : items,
                label : targetCate ? (_.isEqual(targetCate, source[source.length - 1]) ? cateLabel : targetCate.name) : items[0].label
            });

            menuButton.on('select', function (data) {
                data.value = parseInt(data.value, 10);
                var targetInfo = _.find(source, function (item) {
                    return item.value === data.value;
                });
                if (_.isEqual(targetInfo, source[source.length - 1])) {
                    var customInfoWindowView = CustomInfoWindowView.getInstance();
                    customInfoWindowView.show();
                    var yesHandler  = function () {
                        var label = customInfoWindowView.getLabel();
                        if (label) {
                            menuButton.label = label;
                            $(menuButton.$el.parent().next().find('input')).data({
                                type : data.value,
                                label : label
                            });
                        }
                    };

                    customInfoWindowView.on('button_yes', yesHandler);

                    var removeHandler = function () {
                        customInfoWindowView.off('remove', removeHandler);
                        customInfoWindowView.off('button_yes', yesHandler);
                    };

                    customInfoWindowView.on('remove', removeHandler);
                } else {
                    menuButton.label = data.label;
                    $(menuButton.$el.parent().next().find('input')).data({
                        type : data.value,
                        label : data.label
                    });
                }
            });

            $ctn.append(menuButton.render().$el);
        };

        var contactsCollection;
        var accountCollection;
        var threads4ContactCollection;

        var contactsListView;
        var threadsPanel4ContactView;
        var quickSenderView;
        var groupButton;
        var categoryMenuView;
        var accountSelectorView;

        var normalTemplate;
        var editorTemplate;

        var dialNotifierPanel;

        var DetailPanelView = Backbone.View.extend({
            className : 'w-contact-detail-panel vbox',
            initialize : function () {
                contactsCollection = ContactsCollection.getInstance();
                contactsCollection.on('refresh', function (contactsCollection) {
                    var contact = contactsCollection.get(this.model.id);
                    if (contact !== undefined) {
                        this.update(contact.id);
                    }
                }, this);

                accountCollection = AccountCollection.getInstance();
                accountCollection.on('refresh', this.buildGroupsButton, this);

                threadsPanel4ContactView = ThreadsPanel4ContactView.getInstance();
                threads4ContactCollection = Threads4ContactCollection.getInstance();

                contactsListView = ContactsListView.getInstance();

                categoryMenuView = CategoryMenuView.getInstance();
                categoryMenuView.on('select', function (data) {
                    var cate = data.value.toLowerCase();
                    var template;
                    var $ctn;
                    switch (cate) {
                    case 'phone':
                        template = TemplateFactory.get('contact', 'edit-phone');
                        $ctn = this.$('li.phone dl');
                        break;
                    case 'email':
                        template = TemplateFactory.get('contact', 'edit-email');
                        $ctn = this.$('li.email dl');
                        break;
                    case 'im':
                        template = TemplateFactory.get('contact', 'edit-im');
                        $ctn = this.$('li.im dl');
                        break;
                    case 'address':
                        template = TemplateFactory.get('contact', 'edit-address');
                        $ctn = this.$('li.address dl');
                        break;
                    case 'organization':
                        template = TemplateFactory.get('contact', 'edit-organization');
                        $ctn = this.$('li.organization dl');
                        break;
                    }
                    $ctn.append(doT.template(template)({}));
                    genButtons.call(this, $($ctn.find('dt:last')));
                }, this);

                normalTemplate = doT.template(TemplateFactory.get('contact', 'detail-panel'));
                editorTemplate = doT.template(TemplateFactory.get('contact', 'detail-panel-edit'));

                Device.on('change:isConnected', function (Device, isConnected) {
                    if (!this.$el.hasClass('edit')) {
                        this.$('.button-edit, .button-group').prop({
                            disabled : !isConnected
                        });
                    }
                    this.$('.button-dial').toggle(isConnected);
                }, this);

                $helper.on('click', function () {
                    if (this.isChanged()) {
                        var alertWindow = new AlertWindow({
                            draggable : true,
                            buttons : [{
                                $button : $('<button>').html(i18n.misc.SAVE).addClass('primary'),
                                eventName : 'button_yes'
                            }, {
                                $button : $('<button>').html(i18n.misc.DONTSAVE),
                                eventName : 'button_no'
                            }],
                            title : i18n.ui.TIP,
                            $bodyContent : i18n.contact.SAVE_TIP_TEXT
                        });
                        alertWindow.on('button_no', this.clickButtonCancel, this);

                        alertWindow.on('button_yes', this.clickButtonSave, this);

                        alertWindow.show();
                    } else {
                        this.clickButtonCancel();
                    }
                }.bind(this));
            },
            createNewContact : function (model) {
                model = model || contactsCollection.generateNewContact();

                if (contactsListView.currentAccountId !== 'all') {
                    var account = accountCollection.get(contactsListView.currentAccountId);
                    model.set({
                        account_name : account.get('name'),
                        account_type : account.get('type')
                    });
                }

                this.model = model;
                this.template = editorTemplate;
                this.renderEditor();
            },
            groupContact : function (targetGroupId, action) {
                var groupContact = function () {
                    contactsCollection.batchGroupAsync([this.model.id], targetGroupId, action, undefined).always(function (resp) {
                        if (resp.state_code !== 200 ||
                                (resp.body && resp.body.failed && resp.body.failed.length > 0)) {
                            groupButton.menu.$('input[type="checkbox"][value="' + targetGroupId + '"]').prop({
                                checked : false
                            });
                        }
                    }.bind(this));
                }.bind(this);

                var targertAccount = accountCollection.getAccountByGroupId(targetGroupId);

                var willMove = this.model.get('account_name') !== targertAccount.get('name') ||
                                this.model.get('account_type') !== targertAccount.get('type');

                if (willMove) {
                    var disposableAlert = new AlertWindow({
                        draggable : true,
                        disposableName : 'contact-group-detail-panel',
                        disposableChecked : false,
                        buttonSet : 'yes_no',
                        $bodyContent : $(StringUtil.format(i18n.contact.ALERT_BATCH_MOVE_GROUP_SINGLE, this.model.get('name').display_name || i18n.contact.UNNAMED_CONTACT, targertAccount.get('displayName')))
                    });
                    disposableAlert.on('button_yes', groupContact, this);

                    disposableAlert.on('button_no', function () {
                        groupButton.menu.$('input[type="checkbox"][value="' + targetGroupId + '"]').prop({
                            checked : false
                        });
                    });

                    disposableAlert.show();
                } else {
                    groupContact.call(this);
                }
            },
            buildGroupsButton : function () {
                if (this.$el.hasClass('edit')) {
                    return;
                }
                var items = [];
                var currentGroups = _.pluck(this.model.get('group'), 'group_row_id');

                accountCollection.each(function (account) {
                    if (items.length > 0) {
                        items.push({
                            type : 'hr'
                        });
                    }

                    items.push({
                        type : 'group',
                        name : account.get('id'),
                        label : account.get('displayName')
                    });

                    accountCollection.getGroupsByAccount(account.id).each(function (group) {
                        items.push({
                            type : 'checkbox',
                            name : group.get('id'),
                            label : group.get('title'),
                            checked : currentGroups.indexOf(group.get('id')) !== -1,
                            value : group.get('id')
                        });
                    }, this);


                    if (!account.get('read_only')) {
                        items.push({
                            type : 'link',
                            label : i18n.contact.ADD_GROUP,
                            action : function () {
                                var addGroupWindowView = AddGroupWindowView.getInstance();
                                addGroupWindowView.show(account);
                                addGroupWindowView.on('addNewGroup', function (groupId) {
                                    this.groupContact(groupId, true);
                                }, this);
                            }.bind(this)
                        });
                    }
                }, this);

                if (!groupButton) {
                    groupButton = new MenuButton({
                        label : i18n.contact.GROUP,
                        items : items
                    });

                    groupButton.on('select', function (data) {
                        this.groupContact(data.value, groupButton.menu.$('input[type="checkbox"][name="' + data.name + '"]')[0].checked);
                    }, this);
                    groupButton.render().$el.addClass('button-group');
                } else {
                    groupButton.items = items;
                }

                if (!this.model.isReadOnly) {
                    this.$('.switch').append(groupButton.$el);
                }
            },
            buildMenuButtons : function () {
                var $ctns = this.$('.info-ctn dl dt');
                _.each($ctns, function (ctn) {
                    genButtons.call(this, $(ctn));
                }, this);
            },
            renderEditor : function () {
                this.$el.addClass('edit');

                if (quickSenderView) {
                    quickSenderView.$el.detach();
                }

                if (groupButton) {
                    groupButton.$el.detach();
                }

                if (categoryMenuView) {
                    categoryMenuView.$el.detach();
                }
                if (accountSelectorView) {
                    accountSelectorView.$el.detach();
                }

                this.$el.html(this.template({
                    contact : this.model.toJSON(),
                    config : EditorConfig
                }));

                if (!accountSelectorView) {
                    accountSelectorView = AccountSelectorView.getInstance({
                        disableAllLabel : true,
                        displayReadOnly : false
                    });
                }

                this.$('.button-edit').prop({
                    disabled : true
                });

                this.$('.button-group').prop({
                    disabled : true
                });

                this.buildMenuButtons();

                this.$('.category-selector').append(categoryMenuView.render().$el);
                if (this.model.get('isNew')) {
                    this.$('.account-ctn').append(accountSelectorView.render().$el);
                    var account = accountCollection.getAccountByNameAndType(this.model.get('account_name'), this.model.get('account_type'));
                    if (account !== undefined && !account.get('read_only')) {
                        accountSelectorView.selectByAccountId(account.id);
                    } else {
                        account = accountCollection.find(function (acc) {
                            return !acc.get('read_only');
                        });
                        if (account !== undefined) {
                            accountSelectorView.selectByAccountId(account.id);
                        }
                    }
                    this.$('.account-label').show();
                } else {
                    this.$('.account-label').hide();
                }

                this.$el.parent().prepend($helper);
            },
            render : function () {
                $helper.detach();

                this.$el.removeClass('edit');

                if (quickSenderView) {
                    quickSenderView.$el.detach();
                }
                if (groupButton) {
                    groupButton.$el.detach();
                }
                if (categoryMenuView) {
                    categoryMenuView.$el.detach();
                }
                if (accountSelectorView) {
                    accountSelectorView.$el.detach();
                }

                this.$el.html(this.template({
                    contact : this.model.toJSON(),
                    config : EditorConfig
                }));

                this.$('.sms-ctn').append(threadsPanel4ContactView.render().$el);
                threads4ContactCollection.data = {
                    type : CONFIG.enums.SMS_THREADS_TYPE_SPECIFY_CONTACT,
                    filter : this.model.id,
                    start : 0,
                    number : 100
                };

                threads4ContactCollection.trigger('update');

                if (this.model.get('phone')
                        && _.compact(_.pluck(this.model.get('phone'), 'number')).length > 0) {
                    if (!quickSenderView) {
                        quickSenderView = MessageSender4ThreadsPanelView.getInstance({
                            model : this.model
                        }).render();
                    } else {
                        quickSenderView.update(this.model);
                    }
                    this.$el.append(quickSenderView.$el);
                }

                if (this.model.isReadOnly) {
                    this.$('.switch').html($('<span>').html(i18n.contact.CANNOT_EDIT_CONTACTS_UNDER_READONLY_ACCOUNT));
                } else {
                    this.buildGroupsButton();
                }

                this.$('.button-edit, .button-group').prop({
                    disabled : !Device.get('isConnected')
                });

                this.$('[data-title]').each(function () {
                    var tip = new PopupTip({
                        $host : $(this)
                    });
                    tip.zero();
                });

                if (!Device.get('isConnected')) {
                    this.$('.button-dial').hide();
                }

                return this;
            },
            update : function (id) {
                var newModel = contactsCollection.get(id);

                if (this.model !== undefined &&
                        this.model.id === newModel.id) {
                    this.model = newModel;
                    if (this.$el.hasClass('edit')) {
                        this.template = editorTemplate;
                        this.renderEditor();
                    } else {
                        this.template = normalTemplate;
                        this.render();
                    }
                } else {
                    this.model = newModel;
                    this.template = normalTemplate;
                    this.render();
                }
            },
            buildContactData : function () {
                var photo_id = this.getAtomicData('avatar');
                var photo = this.getAtomicData('avatar_photo');
                var merge = this.getAtomicData('merge');

                if (merge) {
                    photo = this.getAtomicData('avatar_path');
                }

                if (!!photo) {
                    photo_id = '';
                }

                var data = {
                    id : this.model.id || '',
                    account_name : this.model.get('isNew') ? accountCollection.get(accountSelectorView.accountId).get('name') : this.model.get('account_name'),
                    account_type : this.model.get('isNew') ? accountCollection.get(accountSelectorView.accountId).get('type') : this.model.get('account_type'),
                    group : this.model.get('group'),
                    name : this.getAtomicData('name')[0],
                    nickname : this.getAtomicData('nickname'),
                    phone : this.getAtomicData('phone'),
                    photo_id : photo_id,
                    photo : [{
                        value : photo,
                        id : photo_id
                    }],
                    email : this.getAtomicData('email'),
                    IM : this.getAtomicData('im'),
                    address : this.getAtomicData('address'),
                    organization : this.getAtomicData('organization'),
                    note : this.getAtomicData('note')
                };

                if (merge) {
                    data.mergeIds = this.model.get('mergeIds');
                }

                return data;
            },
            getAtomicData : function (type) {
                var contact = this.model.toJSON();
                var $avatar = this.$('.avatar img');
                if (type === 'avatar') {
                    var value = null;
                    if (contact && contact.photo && contact.photo.length > 0) {
                        value = contact.photo[0].id;
                    }
                    return value;
                }

                if (type === 'merge') {
                    var merge = false;
                    if (contact && contact.merge) {
                        merge = true;
                    }
                    return merge;
                }

                if (type === 'avatar_path') {
                    var path = $avatar.attr('src').replace('file:///', '');
                    if (path === CONFIG.enums.CONTACT_DEFAULT_ICON_LARGE) {
                        path = '';
                    }
                    return path;
                }

                if (type === 'avatar_photo') {
                    return $avatar.data('path');
                }

                var $inputs = this.$('.input-' + type);
                var data = _.map($inputs, function (input) {
                    var $input = $(input);
                    var id = $input.data('id');
                    var inputValue = $input.val();
                    var sourceType = $input.data('type');
                    if (!id && !inputValue) {
                        return;
                    }

                    var obj = {
                        id : id || '',
                        value : inputValue || ''
                    };

                    if (!_.isUndefined(sourceType)) {
                        obj.type = sourceType;

                        if ((type.toLowerCase() === 'im' && parseInt(sourceType, 10) === -1) ||
                                (type.toLowerCase() !== 'im' && parseInt(sourceType, 10) === 0)) {
                            obj.label = $input.data('label') || '';
                        }
                    }

                    return obj;
                });

                return _.compact(data);
            },
            getAvatarSize : function () {
                var $avatar = this.$('.avatar img');
                return $avatar.width() + ';' + $avatar.height();
            },
            refreshAvatar : function (path) {
                var $avatar = this.$('.avatar img');

                if (path === '') {
                    var contact = this.model.toJSON();
                    $avatar.attr('src', CONFIG.enums.CONTACT_DEFAULT_ICON_LARGE)
                            .data('path', '');

                    if (contact && contact.photo) {
                        contact.photo[0].id = null;
                    }
                } else {
                    $avatar.attr('src', 'file:///' + path)
                            .data('path', path);
                }
            },
            validate : function () {
                var isValidate = false;
                var $inputs = this.$('input');
                var nonemptyInputs = _.find($inputs, function (input) {
                    return $(input).val().trim() !== '';
                });
                if (!nonemptyInputs) {
                    $('input').eq(0).focus();
                    isValidate = false;
                } else if (this.$('input:invalid').length > 0) {
                    this.$('input:invalid').focus();
                    isValidate = false;
                } else {
                    isValidate = true;
                }

                return isValidate;
            },
            isChanged : function () {
                if (this.model.get('isNew')) {
                    return true;
                }

                var model = this.model.toJSON();
                var data = this.buildContactData();
                if (isChangedItem(model.name, 'display_name', data.name ? data.name.value : '')) {
                    return true;
                }
                if (isChangedItem(model, 'account_name', data.account_name)) {
                    return true;
                }
                if (isChangedItem(model, 'account_type', data.account_type)) {
                    return true;
                }
                if (isChangedItems(model.nickname, data.nickname, 'type', 'name')) {
                    return true;
                }
                if (isChangedItems(model.phone, data.phone, 'type', 'number')) {
                    return true;
                }
                if (isChangedItems(model.email, data.email, 'type', 'address')) {
                    return true;
                }
                if (isChangedItems(model.address, data.address, 'type', 'formatted_address')) {
                    return true;
                }
                if (isChangedItems(model.organization, data.organization, 'type', 'company')) {
                    return true;
                }
                if (isChangedItems(model.note, data.note, 'type', 'note')) {
                    return true;
                }
                if (isChangedItems(model.photo, data.photo, 'type', 'data')) {
                    return true;
                }
                if (isChangedItems(model.IM, data.IM, 'protocol', 'data')) {
                    return true;
                }
                return false;
            },
            clickButtonEmail : function (evt) {
                var id = $(evt.target).data('email-id').toString();
                var contact = this.model.toJSON();
                var email = _.find(contact.email, function (email) {
                    return email.id === id;
                });

                IO.requestAsync({
                    url : CONFIG.actions.MAILTO,
                    data : {
                        email : email.address
                    },
                    success : function (resp) {
                        if (resp.state_code === 405) {
                            alert(i18n.contact.NO_EMAIL_CLIENT_TIP);
                        } else if (resp.state_code !== 200) {
                            alert(i18n.misc.SEND_MAIL_FAILD);
                        }
                    }
                });

                log({
                    'event' : 'ui.click.contact.email'
                });
            },
            clickButtonEdit : function () {
                this.template = editorTemplate;
                this.renderEditor();

                log({
                    'event' : 'ui.click.contact.edit'
                });
            },
            clickButtonCancel : function () {
                this.$el.removeClass('edit');
                $helper.detach();
                this.trigger('cancel');
            },
            clickButtonAvatar : function () {
                if (!Device.get('hasSDCard') &&
                        !Device.get('hasEmulatedSD')) {
                    alert(i18n.misc.ALERT_TIP_NO_SD_CARD);
                } else {
                    AvatarEditorView.getInstance({
                        detailView : this
                    }).show();
                }

                log({
                    'event' : 'ui.click.contact.edit.avatar'
                });
            },
            clickButtonDelete : function (evt) {
                var $target = $(evt.target);
                var $parent = $target.parent();
                $parent.prev().remove();
                $parent.remove();
            },
            clickButtonSave : function () {
                if (!this.validate()) {
                    return;
                }

                if (!this.isChanged()) {
                    this.template = normalTemplate;
                    this.render();
                    return;
                }

                $helper.detach();

                var inputs = this.$('input[type="text"], input[type="email"], textarea, .button-save').prop({
                    disabled : true
                });

                var data = this.buildContactData();

                contactsCollection.saveContactAsync(data).done(function (resp) {
                    this.$el.removeClass('edit');
                    this.trigger('save', resp.body.id);
                    if (data.mergeIds) {
                        contactsCollection.deleteContactsAsync(data.mergeIds);
                    }
                    threads4ContactCollection.data.filter = resp.body.id;

                    threads4ContactCollection.trigger('update');
                }.bind(this)).always(function () {
                    inputs.prop({
                        disabled : false
                    });
                });
            },
            clickButtonDial : function (evt) {
                if (dialNotifierPanel === undefined) {
                    var phoneNumber = $(evt.target).data('phone-number');
                    var i = new window.AndroidIntent('android.intent.action.DIAL',
                                '',
                                'tel:' + phoneNumber,
                                '',
                                '',
                                ''
                            );
                    i.startActivity();

                    dialNotifierPanel = new PopupPanel({
                        $host : $(evt.originalEvent.srcElement),
                        $content : $('<div>').width(140).html(i18n.contact.DIAL_SUCCESS),
                        alignToHost : false,
                        popIn : true,
                        autoClose : 2000
                    });

                    dialNotifierPanel.destoryBlurToHideMixin();

                    dialNotifierPanel.show();

                    dialNotifierPanel.once('remove', function () {
                        dialNotifierPanel = undefined;
                    });

                    log({
                        'event' : 'ui.click.contact.dial'
                    });
                }
            },
            events : {
                'click .button-dial' : 'clickButtonDial',
                'click .button-email' : 'clickButtonEmail',
                'click .button-edit' : 'clickButtonEdit',
                'click .button-cancel' : 'clickButtonCancel',
                'click .button-avatar' : 'clickButtonAvatar',
                'click .button-delete' : 'clickButtonDelete',
                'click .button-save' : 'clickButtonSave'
            }
        });

        var detailPanelView;

        var factory = _.extend({
            getInstance : function () {
                if (!detailPanelView) {
                    detailPanelView = new DetailPanelView();
                }
                return detailPanelView;
            }
        });

        return factory;
    });
}(this));
