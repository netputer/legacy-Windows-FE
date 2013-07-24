/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'ui/Panel',
        'ui/UIHelper',
        'ui/TemplateFactory',
        'ui/SmartList',
        'Internationalization',
        'contact/views/AccountSelectorView',
        'contact/views/AddGroupWindowView',
        'contact/collections/AccountCollection',
        'contact/views/GroupManagerItemView',
        'contact/models/GroupManagerContextModel'
    ], function (
        Backbone,
        _,
        doT,
        $,
        Panel,
        UIHelper,
        TemplateFactory,
        SmartList,
        i18n,
        AccountSelectorView,
        AddGroupWindowView,
        AccountCollection,
        GroupManagerItemView,
        GroupManagerContextModel
    ) {

        console.log('GroupManager - File loaded.');

        var accountCollection;
        var GroupListView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('contact', 'group-manager-list')),
            className : "w-group-manager-body vbox",
            initialize : function () {
                GroupListView.__super__.initialize.apply(this, arguments);

                var accountId = null;
                Object.defineProperties(this, {
                    accountId : {
                        set : function (value) {
                            accountId = value;
                        },
                        get : function () {
                            return accountId;
                        }
                    }
                });
            },
            render : function () {

                this.$el.html(this.template({}));

                this.groupList = new SmartList({
                    itemView : GroupManagerItemView.getClass(),
                    dataSet : [{
                        name : 'default',
                        getter : function () {
                            return accountCollection.getGroupsByAccount(this.accountId).models;
                        }.bind(this)
                    }],
                    enableContextMenu : false,
                    keepSelect : false,
                    itemHeight : 28,
                    listenToCollection : accountCollection,
                    loading : accountCollection.loading || accountCollection.syncing
                });

                this.groupList.listenTo(accountCollection, 'refresh', function () {
                    this.groupList.switchSet('default', function () {
                        return accountCollection.getGroupsByAccount(this.accountId).models;
                    }.bind(this));
                }.bind(this));

                this.$('.w-smart-list-header').after(this.groupList.render().$el);
                return this;
            },
            refresh : function () {
                this.groupList.switchSet('default', function () {
                    return accountCollection.getGroupsByAccount(this.accountId).models;
                }.bind(this));
            },
            remove : function () {

                this.groupList.remove();
                GroupListView.__super__.remove.apply(this, arguments);
            }
        });

        var GroupManagerBody = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('contact', 'group-manager-body')),
            className : 'w-contact-group-mangaer-body-ctn vbox',
            initialize : function () {

                GroupManagerBody.__super__.initialize.apply(this, arguments);

                this.accountSelectorView = AccountSelectorView.getInstance({
                    disableAllLabel : true,
                    displayReadOnly : false
                });

                this.listView = new GroupListView();
                this.listView.accountId = this.accountSelectorView.accountId;

                this.addGroupWindowView = AddGroupWindowView.getInstance();
                this.accountSelectorView.on('selectAccount', function (account) {
                    this.listView.accountId = account.get('id');
                    this.listView.refresh();
                }.bind(this));
            },
            render : function () {
                this.$el.html(this.template({}));
                this.$('.w-group-manager-header label').append(this.accountSelectorView.render().$el);
                this.$el.append(this.listView.render().$el);
                return this;
            },
            clickGroupAdd : function () {
                var account = accountCollection.getAccountById(this.accountSelectorView.accountId);
                this.addGroupWindowView.show(account);
            },
            remove : function () {
                this.accountSelectorView.remove();
                this.addGroupWindowView.remove();
                this.listView.remove();

                GroupManagerBody.__super__.remove.apply(this, arguments);
            },
            events: {
                'click .w-contact-group-add' : 'clickGroupAdd'
            }
        });

        var GroupManagerView = Panel.extend({
            initialize : function () {
                GroupManagerView.__super__.initialize.apply(this, arguments);

                var curAccountId;
                Object.defineProperties(this, {
                    curAccountId : {
                        set : function (id) {
                            curAccountId = id;
                        },
                        get : function () {
                            return curAccountId;
                        }
                    }
                });

                this.on(UIHelper.EventsMapping.SHOW, function () {

                    accountCollection = AccountCollection.getInstance();

                    this.bodyView = new GroupManagerBody();
                    this.$bodyContent = this.bodyView.render().$el;
                    this.center();

                    this.once('remove', function () {
                        this.bodyView.remove();
                        accountCollection = undefined;
                    });

                    this.once('button_cancel', function () {
                        GroupManagerContextModel.set('del', []);
                        GroupManagerContextModel.set('rename', {});
                    });
                });

                this.buttons = [{
                    $button : $('<button>').html(i18n.contact.SAVE).addClass('primary button_save')
                }, {
                    $button : $('<button>').html(i18n.ui.CANCEL).addClass('button_cancel'),
                    eventName : 'button_cancel'
                }];
            },
            setCurAccountId : function (accountId) {
                this.curAccountId  = accountId;
            },
            clickButtonSave : function () {

                var del = GroupManagerContextModel.get('del');
                accountCollection.deleteGroupAsync(del);

                accountCollection.once('refresh', function () {
                    var rename = GroupManagerContextModel.get('rename');
                    accountCollection.updateGroupAsync(rename);

                    this.trigger('button_cancel');
                }.bind(this));

                this.hide();
            },
            render : function () {
                _.extend(this.events, GroupManagerView.__super__.events);
                return GroupManagerView.__super__.render.call(this);
            },
            events : {
                'click .button_save' : 'clickButtonSave'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new GroupManagerView({
                    title   : i18n.contact.GROUP_MANAGER_TITLE,
                    height  : '340px',
                    width   : '450px'
                });
            }
        });

        return factory;
    });
}(this));
