/**
 * @fileoverview
 * @author jingfeng@wandoujia.com
 */
wonder.addModule('contact/group', function(W) {
    W.namespace('wonder.contact');

    var groupManager = null;
    var groupGrid = null;
    var currentAccount = null;
    var locale = i18n.contact;

    var AccountSource = {
        ACCT_SRC_LOCAL : 1,
        ACCT_SRC_SIM : 2,
        ACCT_SRC_NETWORK : 3,
        ACCT_SRC_OTHER : 4
    }
    //Base information in account. Data definition in backend.
    var baseAccount = {
        id : "0",
        label : "",
        name : "",
        read_only : false,
        source : 0,
        type : "",
        getLabel : function() {
            if(this.source === AccountSource.ACCT_SRC_LOCAL) {
                this.label = locale.ACCOUNT_PHONE;
            } else if(this.source === AccountSource.ACCT_SRC_SIM) {
                if(W.contact.group.getSimAccounts().length > 1) {
                    this.label = locale.ACCOUNT_SIM + ': ' + this.name;
                } else {
                    this.label = locale.ACCOUNT_SIM;
                }
            } else if(this.source === AccountSource.ACCT_SRC_OTHER) {
                this.label = locale.ACCOUNT_UNKNOWN;
            } else if(this.source === AccountSource.ACCT_SRC_NETWORK) {
                var typeNames = this.type.split('.');
                if(typeNames.length > 1) {
                    var firstLetter = typeNames[1].slice(0, 1);
                    var typeName = firstLetter.toUpperCase() + typeNames[1].slice(1);
                    this.label = typeName + ' ' + locale.ACCOUNT_TEXT + ': ' + this.name;
                } else {
                    this.label = typeNames[0];
                }
            } else if(this.name === AccountGroup.ALL) {
                this.label = this.label;
            } else {
                this.label = this.name;
            }
            return this.label;
        },
        isReadOnly : function() {
            return this.read_only;
        },
        isSimAccount : function() {
            return this.source === AccountSource.ACCT_SRC_SIM;
        }
    }

    //Base group info which is definined in backed.
    var baseGroup = {
        account_name : "",
        account_type : "",
        contacts : 0,
        dirty : 1,
        id : 0,
        should_sync : 0,
        source_id : "",
        title : ""
    }

    /**
     * @constructor Group
     */
    function Group() {
    };

    Group.Events = {
        UPDATE : 'update'
    };
    W.mix(Group.prototype, W.events);
    W.mix(Group.prototype, {
        accounts : null,
        groups : {},
        fetched : false,
        hasFetched : function() {
            return this.fetched;
        },
        getAccountCallback : function(options, response) {
            this.fetched = true;
            response = JSON.parse(response);
            this.accounts = [];
            this.groups = {};
            if(response.state_code === 200 || response.state_code === 202) {
                _.each(response.body.group, function(account) {
                    if(account.group && account.group.length > 0) {
                        for(var i = 0; i < account.group.length; i++) {
                            var group = account.group[i];
                            this.groups[group.id] = group;
                            group = W.mix(group, baseGroup, false);
                            group.title = group.title || i18n.contact.GROUP_UNKNOW_LABEL
                        }
                    }
                    W.mix(account.account, baseAccount, false);
                    this.accounts.push(account);
                }, this);
            }
            this.trigger(Group.Events.UPDATE, options);
        },
        fetch : function(options) {
            options = options || {};
            W.ajax({
                url : CONFIG.actions.CONTACT_GROUPS_SHOW,
                data : {
                    show : 0
                },
                success : _.bind(this.getAccountCallback, this, options)
            });
        },
        getAccountByName : function(name) {
            if(!this.accounts)
                return null;
            for(var i = 0; i < this.accounts.length; i++) {
                if(this.accounts[i].account.name === name) {
                    return this.accounts[i];
                }
            }
            return null;
        },
        getAccountByNameAndType : function(name, type) {
            if(!this.accounts)
                return null;
            for(var i = 0; i < this.accounts.length; i++) {
                var account = this.accounts[i].account;
                if(account.name === name && account.type === type) {
                    return this.accounts[i];
                }
            }
            return null;
        },
        getGroupById : function(groupId) {
            return this.groups[groupId];
        },
        getGroupsByAccount : function(accountId) {
            if(!this.accounts)
                return null;
            for(var i = 0; i < this.accounts.length; i++) {
                if(this.accounts[i].account.id === accountId) {
                    return this.accounts[i].group;
                }
            }
            return null;
        },
        getAccounts : function() {
            return this.accounts;
        },
        hasAccount : function() {
            var accounts = this.getAccounts();
            return (!accounts || accounts.length <= 0) ? false : true;
        },
        getAllContactCount : function() {
            var count = 0;
            if(this.accounts) {
                for(var i = 0; i < this.accounts.length; i++) {
                    count += this.accounts[i].contacts;
                }
            }
            return count;
        },
        getWritableAccount : function() {
            var writableAccounts = _.filter(this.accounts, function(account) {
                account = account.account;
                return !account.read_only
            });
            return writableAccounts;
        },
        isExisted : function(accountName) {
            var existed = false;
            for(var i = 0; i < this.accounts.length; i++) {
                if(this.accounts[i].account.name === accountName) {
                    existed = true;
                    break;
                }
            }
            return existed;
        },
        getSimAccounts : function() {
            return _.filter(this.accounts, function(account) {
                return account.account.isSimAccount();
            });
        },
        hasGroupTitle : function(title, account) {
            var account = this.getAccountByNameAndType(account.name, account.type);
            var hasGroupName = _.find(account.group, function(group) {
                return group.title === title;
            });
            return !!hasGroupName;
        }
    });
    W.contact.group = new Group();

    /**
     * @function GroupManagerItem
     */
    function GroupManagerItem(title) {
        W.ui.MenuItem.call(this, title);
    }


    W.extend(GroupManagerItem, W.ui.MenuItem);
    W.mix(GroupManagerItem.prototype, {
        render : function(opt_parent) {
            GroupManagerItem._super_.render.call(this, opt_parent);
            var managerEl = $('<a/>').html(this._title);
            this._element.empty().append(managerEl).addClass('w-menu-group-manager-item');
        }
    });

    W.contact.Group = Group;
    W.contact.GroupManagerItem = GroupManagerItem;

    /**
     * @constructor GroupManager
     */
    function GroupManager() {
        W.ui.Window.call(this, i18n.contact.GROUP_MANAGER_TITLE);
        this._group = W.contact.group;
    }


    W.extend(GroupManager, W.ui.Window);
    W.mix(GroupManager.prototype, {
        curAccount : null,
        headerEl : null,
        bodyEl : null,
        requestList : [],
        accountIndex : {},
        curIndex : 0,
        setCurAccountId : function(accountId) {
            this.curAccountId = accountId;
        },
        update : function() {
            this.curAccountId && this.accountMenu.selectByAccountId(this.curAccountId);
        },
        buildAccountMenu : function() {
            var addGroupEl = this._element.find('.w-contact-group-add');

            this.accountMenu = window.Contact.AccountSelectorView.getInstance({
                disableAllLabel : true
            });
            this.headerEl.append(this.accountMenu.render().$el.width(120));
            this.accountMenu.on('select', function(data) {
                this.curAccountId = data.value;
                this.setGridContent(window.Contact.AccountCollection.getInstance().getGroupsByAccount(this.curAccountId).toJSON());
                window.Contact.AccountCollection.getInstance().get(this.curAccountId).get('read_only') ? addGroupEl.hide() : addGroupEl.show();
            }, this);

            window.Contact.AccountCollection.getInstance().on('refresh', function(AccountCollection) {
                this.curAccountId && this.setGridContent(AccountCollection.getGroupsByAccount(this.curAccountId).toJSON());
            }, this);
        },
        setGridContent : function(list) {
            var data = [];
            var self = this;
            self.requestList = [];
            _.each(list, function(group) {
                var obj = {};
                var deleteEl = $('<a/>').text(i18n.contact.GROUP_DELETE_LABEL);
                var renameEl = $('<a/>').text(i18n.contact.GROUP_UPDATE_LABEL);
                var inputEl = $('<input/>').prop('type', 'text');
                var removeTextEl = $('<span/>').text(i18n.contact.GROUP_DELETED_TEXT);

                obj.id = group.id;
                obj.showInput = false;
                obj.deleted = false;
                obj.deleteRequest = null;
                obj.updateRequest = null;
                obj.name = {
                    el : null,
                    data : group.title,
                    newVal : '',
                    update : function(text) {
                        newVal = text;
                        this.$el.text(newVal || this.data);
                        if(newVal && newVal != this.data) {
                            obj.updateRequest = new UpdateRequet({
                                group : group.id,
                                name : newVal
                            });
                        } else {
                            obj.updateRequest = null;
                        }
                    },
                    render : function(target) {
                        this.$el = $('<label/>').text(group.title).appendTo(target);
                    },
                    getValue : function() {
                        return group.title;
                    }
                };
                obj.del = {
                    render : function(delColTarget) {
                        if(self.curAccountId && window.Contact.AccountCollection.getInstance().get(self.curAccountId).get('read_only')) {
                            $(delColTarget).html(i18n.contact.READ_ONLY_ACCOUNT_GROUP_TEXT);
                            return;
                        }
                        if(group.system_id) {
                            $(delColTarget).html(i18n.contact.UNEDITABLE_GROUP_TEXT);
                            return;
                        }
                        removeTextEl.remove();
                        deleteEl.remove();
                        if(obj.deleted) {
                            removeTextEl.appendTo(delColTarget);
                        } else {
                            deleteEl.appendTo(delColTarget);
                            deleteEl.bind('click', $.proxy(function() {
                                obj.deleteRequest = new DeleteRequet({
                                    group : group.id
                                });
                                renameEl.remove();
                                obj.name.update();
                                obj.deleted = true;
                                this.render(delColTarget);
                            }, this));
                        }
                    }
                };
                obj.rename = {
                    render : function(renameColTarget) {
                        if(window.Contact.AccountCollection.getInstance().get(self.curAccountId).get('read_only'))
                            return;
                        if(group.system_id)
                            return;
                        renameEl.remove();
                        inputEl.remove();
                        if(obj.deleted)
                            return;
                        if(!this.showInput) {
                            renameEl.appendTo(renameColTarget);
                            renameEl.bind('click', $.proxy(function() {
                                this.showInput = true;
                                this.render(renameColTarget);
                            }, this));
                        } else {
                            inputEl.appendTo(renameColTarget).focus();
                            inputEl.bind('keyup', function() {
                                var text = $(this).val();
                                obj.name.update(text);
                            }).bind('blur', $.proxy(function() {
                                var newTitle = inputEl.val();
                                if(W.contact.group.hasGroupTitle(newTitle.trim(), window.Contact.AccountCollection.getInstance().get(self.curAccountId).toJSON())) {
                                    var Dialog = W.ui.Dialog;
                                    var alert = new Dialog(i18n.common.DIALOG_TIP);
                                    alert.render();
                                    alert.setButtonSet(Dialog.ButtonSet.OK);
                                    alert.setContent(i18n.contact.GROUP_ALREADY_EXSIST);
                                    alert.show();
                                    obj.name.update(group.title);
                                }

                                this.showInput = false;
                                this.render(renameColTarget);
                            }, this));
                        }
                    }
                };
                data.push(obj);
                self.requestList.push(obj);
            });
            groupGrid.setData(data);
            if(data.length <= 0) {
                groupGrid.setContent(i18n.contact.GROUP_GRID_TIP_TEXT);
            }
        },
        render : function(opt_parent) {
            GroupManager._super_.render.call(this, opt_parent);
            var self = this;
            var containerEl = $('<div/>').addClass('w-group-manager');
            var headerEl = this.headerEl = $('<div/>').addClass('w-group-manager-header').append('<label>' + i18n.contact.CURRENT_ACCOUNT_LABEL + '</label>');
            var addGroupEl = $('<a/>').addClass('w-contact-group-add').text(i18n.contact.GROUP_ADD_LABEL);
            var bodyEl = this.bodyEl = $('<div/>').addClass('w-group-manager-body');
            var saveBtn = new W.ui.Button(i18n.contact.GROUP_SAVE_LABEL);
            var cancelBtn = new W.ui.Button(i18n.contact.GROUP_CANCEL_LABEL);
            var groupAddor = W.contact.groupAddor;

            this.addBodyContent({
                render : function(opt_parent) {
                    containerEl.appendTo(opt_parent);
                }
            });
            this.addFooterContent(saveBtn);
            this.addFooterContent(cancelBtn);
            saveBtn.addClassName('primary');

            saveBtn.bind('click', function() {
                var request = null;
                while( request = self.requestList.shift()) {
                    if(request.deleteRequest) {
                        request.deleteRequest.send();
                    } else if(request.updateRequest) {
                        request.updateRequest.send();
                    }
                }
                self.hide();
                self.requestList = [];
            });
            cancelBtn.bind('click', function() {
                self.hide();
                self.requestList = [];
            });

            addGroupEl.bind('click', $.proxy(function() {
                groupAddor.setAccount(window.Contact.AccountCollection.getInstance().get(self.curAccountId).toJSON());
                groupAddor.show();
            }, this));

            headerEl.append(addGroupEl);
            containerEl.append(headerEl).append(bodyEl);
            groupGrid = new W.ui.Grid({
                colModel : [{
                    colLabel : i18n.contact.GROUP_NAME_LABEL,
                    index : 'name',
                    name : 'name',
                    width : 200,
                    resizable : true,
                    sortable : true,
                    sorttype : 'text',
                    dataType : 'object'
                }, {
                    colLabel : i18n.contact.GROUP_CD_LABEL,
                    index : 'del',
                    name : 'del',
                    width : 98,
                    resizable : false,
                    sortable : false,
                    dataType : 'object'
                }, {
                    colLabel : '',
                    index : 'rename',
                    name : 'rename',
                    width : 110,
                    resizable : false,
                    sortable : false,
                    dataType : 'object'
                }],

                rowHeight : 28,
                isMultiSelectable : false,
                multiSelectable : false,
                checkboxColWidth : 48,
                isContentMultiSelected : true
            });
            groupGrid.render(bodyEl);
            this.bind('show', function() {
                this.accountMenu.selectByAccountId(this.curAccountId);
            }, this);
            this._group.bind(Group.Events.UPDATE, this.update, this);
            this.buildAccountMenu();
        }
    });

    /*
     * @constructor DeleteRequet
     */
    function DeleteRequet(data, callback) {
        this.send = function() {
            W.ajax({
                url : CONFIG.actions.CONTACT_GROUPS_DELETE,
                data : data,
                success : _.debounce(function(resp) {
                    resp = JSON.parse(resp);
                    console.debug('delete', resp.state_code);
                    if(resp.state_code === 200) {
                        W.contact.group.fetch({
                            silent : false
                        });
                        window.Contact.ContactCollection.getInstance().trigger('update');
                    }
                }, 100)
            });
        }
    };

    /*
     * @constructor UpdateRequet
     */
    function UpdateRequet(data, callback) {
        this.send = function() {
            W.ajax({
                url : CONFIG.actions.CONTACT_GROUPS_UPDATE,
                data : data,
                success : _.debounce(function(response) {
                    response = JSON.parse(response);
                    console.debug('update', response.state_code);
                    if(response.state_code === 200) {
                        W.contact.group.fetch({
                            silent : false
                        });
                        window.Contact.AccountCollection.getInstance().trigger('update');
                    }
                }, 100)
            });
        }
    };

    /**
     * @constructor GroupAddor
     */
    function GroupAddor() {
        W.ui.Window.call(this, i18n.contact.GROUP_ADD_LABEL);
    }


    W.extend(GroupAddor, W.ui.Window);
    W.mix(GroupAddor.prototype, {
        account : null,
        setAccount : function(account) {
            this.account = account;
        },
        save : function() {
            var self = this;
            var val = this.inputEl.val();

            if(!val) {
                this.tipEl.text(i18n.contact.PLEASE_INPUT_GROUP_NAME).show();
                return;
            }
            var hasGroupName = window.Contact.AccountCollection.getInstance().get(this.account.id).hasGroupWithName(val);
            if(!!hasGroupName) {
                this.tipEl.text(i18n.contact.GROUP_ALREADY_EXSIST).show();
                return;
            }

            if(val && !hasGroupName) {
                W.ajax({
                    type : 'POST',
                    url : CONFIG.actions.CONTACT_GROUPS_ADD,
                    data : {
                        account_name : self.account.name,
                        account_type : self.account.type,
                        title : val
                    },
                    success : function(response) {
                        response = JSON.parse(response);
                        if(response.state_code === 200) {
                            W.contact.group.fetch({
                                silent : true
                            });
                            window.Contact.AccountCollection.getInstance().trigger('update');
                            self.trigger('save', response.body);
                        }
                    }
                });
                this.hide();
            }
        },
        render : function(opt_parent) {
            GroupAddor._super_.render.call(this, opt_parent);
            var self = this;
            var labelEl = $('<label/>').text(i18n.contact.GROUP_NAME_LABEL + '：');
            this.inputEl = $('<input/>').prop('type', 'text');
            this.tipEl = $('<span/>').addClass('tip');
            this.addBodyContent({
                render : function(opt_parent) {
                    opt_parent.append(labelEl).append(self.inputEl).append(self.tipEl).addClass('w-group-addor');
                }
            });
            this.addClassName('w-group-addor');

            var saveBtn = new W.ui.Button(i18n.contact.GROUP_SAVE_LABEL);
            var cancelBtn = new W.ui.Button(i18n.contact.GROUP_CANCEL_LABEL);

            saveBtn.bind('click', function() {
                self.save();
            });
            cancelBtn.bind('click', function() {
                self.hide();
            });
            this.bind('hide', function() {
                self.inputEl.val('');
                self.tipEl.hide();
            });
            this.bind('show', function() {
                self.inputEl.focus();
            });

            this.addFooterContent(saveBtn);
            this.addFooterContent(cancelBtn);
            saveBtn.addClassName('primary');
        }
    });
    W.contact.groupAddor = new GroupAddor();


    groupManager = new GroupManager();
    groupManager.render();
    W.contact.groupManager = groupManager;
});
wonder.useModule('contact/group');
