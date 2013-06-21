/*global define*/
(function (window, undefined) {
    define([
        'backbone',
        'underscore',
        'jquery',
        'IOBackendDevice',
        'Configuration',
        'Device',
        'contact/models/AccountModel'
    ], function (
        Backbone,
        _,
        $,
        IO,
        CONFIG,
        Device,
        AccountModel
    ) {
        console.log('AccountCollection - File loaded.');

        var GroupModel = Backbone.Model.extend({});

        var GroupsCollection = Backbone.Collection.extend({
            model : GroupModel
        });

        var AccountCollection = Backbone.Collection.extend({
            url : CONFIG.actions.CONTACT_GROUPS_SHOW,
            model : AccountModel,
            parse : function (resp) {
                if (this.syncing && resp.state_code !== 202) {
                    console.log('AccountCollection - Collection synced.');
                    this.syncing = false;
                    this.trigger('syncEnd');
                }
                if (resp.state_code === 202 && Device.get('isConnected')) {
                    console.log('AccountCollection - Collection is syncing.');
                    this.syncing = true;
                    this.trigger('syncStart');
                }

                return resp.body.group;
            },
            initialize : function () {
                var loading = false;
                var syncing = false;
                Object.defineProperties(this, {
                    loading : {
                        set : function (value) {
                            loading = value;
                        },
                        get : function () {
                            return loading;
                        }
                    },
                    syncing : {
                        set : function (value) {
                            syncing = value;
                        },
                        get : function () {
                            return syncing;
                        }
                    }
                });

                this.on('update', function () {
                    if (!loading) {
                        loading = true;
                        this.fetch({
                            success : function (collection) {
                                console.log('AccountCollection - Collection fetched.');
                                loading = false;
                                collection.trigger('refresh', collection);
                            }
                        });
                    }
                }, this);
            },
            getAccountsWritable : function () {
                return this.filter(function (account) {
                    return !account.get('read_only');
                });
            },
            addNewGroupAsync : function (targetAccount, groupName) {
                var deferred = $.Deferred();

                IO.requestAsync({
                    type : 'post',
                    url : CONFIG.actions.CONTACT_GROUPS_ADD,
                    data : {
                        account_name : targetAccount.get('name'),
                        account_type : targetAccount.get('type'),
                        title : groupName
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('AccountCollection - Add new group success. ');

                            this.once('refresh', deferred.resolve, this);

                            this.trigger('update');
                        } else {
                            console.error('AccountCollection - Add new group failed. Error info: ' + resp.state_line);

                            deferred.reject(resp);
                        }
                    }.bind(this)
                });

                return deferred.promise();
            },
            getGroupsByAccount : function (id) {
                return new GroupsCollection(this.get(id).get('group'));
            },
            getGroupById : function (id) {
                return _.compact(this.map(function (account) {
                    var groupsCollection = new GroupsCollection(account.get('group'));
                    return groupsCollection.get(id);
                }))[0];
            },
            getAccountByGroupId : function (id) {
                return this.find(function (account) {
                    var groupsCollection = new GroupsCollection(account.get('group'));
                    return groupsCollection.get(id) !== undefined;
                });
            },
            getAccountByNameAndType : function (name, type) {
                return this.find(function (account) {
                    return account.get('name') === name &&
                            account.get('type') === type;
                });
            }
        });

        var accountCollection;

        var factory = _.extend(function () {}, {
            getInstance : function () {
                if (!accountCollection) {
                    accountCollection = new AccountCollection();
                    accountCollection.trigger('update');
                }
                return accountCollection;
            }
        });

        return factory;
    });
}(this));
