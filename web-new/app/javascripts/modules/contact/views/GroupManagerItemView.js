/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'ui/TemplateFactory',
        'ui/BaseListItem',
        'ui/AlertWindow',
        'ui/UIHelper',
        'Internationalization',
        'contact/collections/AccountCollection',
        'contact/models/GroupManagerContextModel'
    ], function (
        Backbone,
        _,
        doT,
        $,
        TemplateFactory,
        BaseListItem,
        AlertWindow,
        UIHelper,
        i18n,
        AccountCollection,
        GroupManagerContextModel
    ) {

        console.log('GroupManagerItemView - File loaded.');

        var accountCollection;
        var alert = window.alert;

        var GroupManagerItemView = BaseListItem.extend({
            template : doT.template(TemplateFactory.get('contact', 'group-manager-item')),
            tagName : 'li',
            className : 'group-manager-item hbox',
            initialize : function () {
                GroupManagerItemView.__super__.initialize.apply(this, arguments);

                var isDelete = false;
                var newTitle = '';
                Object.defineProperties(this, {
                    isDelete : {
                        get : function () {
                            return isDelete;
                        },
                        set : function (value) {
                            isDelete = value;
                        }
                    },
                    newTitle : {
                        get : function () {
                            return newTitle;
                        },
                        set : function (value) {
                            newTitle = value;
                        }
                    }
                });

                accountCollection = AccountCollection.getInstance();
                var name = this.model.get('account_name');
                var type = this.model.get('account_type');
                this.account = accountCollection.getAccountByNameAndType(name, type);
            },
            remove : function () {
                accountCollection = undefined;
                GroupManagerItemView.__super__.remove.call(this);
            },
            render : function () {
                this.$el.html(this.template(this.model.toJSON()));

                this.title = this.$('.title');
                this.del = this.$('.delete');
                this.rename = this.$('.rename');
                this.renameA = this.$('.rename .button-rename');
                this.input = this.$('.new-name');

                if (this.isDelete) {
                    this.setDelete();
                }

                if (this.newTitle) {
                    this.title.html(this.newTitle);
                }

                return this;
            },
            setDelete : function () {
                var del = GroupManagerContextModel.get('del');
                del.push(this.model.id);
                GroupManagerContextModel.set('del', del);

                var rename = GroupManagerContextModel.get('rename');
                delete rename[this.model.id];
                GroupManagerContextModel.get('rename', rename);

                this.del.html(i18n.contact.GROUP_DELETED_TEXT);
                this.rename.remove();
            },
            clickButtonDelete : function () {
                this.setDelete();
                this.isDelete = true;
            },
            clickButtonRename: function () {
                this.showInput();
            },
            keyupInput : function () {
                var name = this.input.val();
                this.title.html(name);
            },
            showInput : function () {
                this.renameA.hide();
                this.input.show();
            },
            hideInput : function () {
                this.renameA.show();
                this.input.hide();
            },
            blurInput : function () {
                var newTitle = this.input.val().trim();

                if (!newTitle) {
                    this.title.html(this.model.get('title'));
                    this.hideInput();
                    this.newTitle = '';
                    return;
                }

                var groups = accountCollection.getGroupsByAccount(this.account.get('id')).models;
                var hasGroupName = _.find(groups, function (group) {
                    return group.get('title') === newTitle;
                });

                if (!!hasGroupName) {
                    alert(i18n.contact.GROUP_ALREADY_EXSIST);
                    this.title.html(this.model.get('title'));
                    this.newTitle = '';
                    this.hideInput();
                    return;
                }

                this.hideInput();
                var rename = GroupManagerContextModel.get('rename');
                rename[this.model.id] = newTitle;
                GroupManagerContextModel.set('rename', rename);

                this.newTitle = newTitle;

                this.isRenaming = false;
            },
            events : {
                'click .button-delete' : 'clickButtonDelete',
                'click .button-rename' : 'clickButtonRename',
                'keyup .new-name' : 'keyupInput',
                'blur input' : 'blurInput'

            }
        });

        var factory = _.extend({
            getInstance : function () {
                return new GroupManagerItemView();
            },
            getClass : function () {
                return GroupManagerItemView;
            }
        });

        return factory;
    });
}(this));
