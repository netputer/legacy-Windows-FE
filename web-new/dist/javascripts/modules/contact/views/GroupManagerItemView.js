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
        i18n,
        AccountCollection,
        GroupManagerContextModel
    ) {

        console.log('GroupManagerItemView - File loaded.');

        var alert = window.alert;
        var accountCollection = AccountCollection.getInstance();

        var GroupManagerItemView = BaseListItem.extend({
            template : doT.template(TemplateFactory.get('contact', 'group-manager-item')),
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
            },
            render : function () {

                var data = this.model.toJSON();
                var name = this.model.get('account_name');
                var type = this.model.get('account_type');
                this.account = accountCollection.getAccountByNameAndType(name, type);

                if (this.account.get('id') && this.account.get('read_only')) {
                    data['read_only'] = 1;
                    this.$el.find('.delete').html(i18n.contact.READ_ONLY_ACCOUNT_GROUP_TEXT);
                }

                this.$el.html(this.template(data));

                this.title = this.$el.find('.title');
                this.del = this.$el.find('.delete');
                this.rename = this.$el.find('.rename');
                this.renameA = this.$el.find('.rename > a');
                this.input = this.$el.find('.new-name');

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
            clickDelete : function () {
                this.setDelete();
                this.isDelete = true;
            },
            clickRename: function () {
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
                'click .delete > a' : 'clickDelete',
                'click .rename > a'	: 'clickRename',
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
