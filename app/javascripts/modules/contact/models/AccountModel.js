/*global define*/
(function (window) {
    define([
        'underscore',
        'backbone',
        'Internationalization'
    ], function (
        _,
        Backbone,
        i18n
    ) {
        console.log('AccountModel - File loaded.');

        var ACCOUNT_SOURCE_MAPPING = {
            ACCT_SRC_PHONE : 1,
            ACCT_SRC_SIM : 2,
            ACCT_SRC_NETWORK : 3,
            ACCT_SRC_OTHER : 4
        };

        var ACCOUNT_TYPE_MAPPING = {
            1 : i18n.contact.ACCOUNT_TYPE_PHONE,
            2 : i18n.contact.ACCOUNT_TYPE_SIM,
            3 : i18n.contact.ACCOUNT_TYPE_GOOGLE
        };

        var AccountModel = Backbone.Model.extend({
            defaults : {
                group : []
            },
            initialize : function () {
                var account = this.get('account');
                this.set(account);
                this.unset('account');

                var displayName;
                var source = this.get('source');
                switch (source) {
                case 3:
                    displayName = ACCOUNT_TYPE_MAPPING[source] + this.get('name');
                    break;
                case 4:
                    displayName = this.get('name');
                    break;
                default:
                    displayName = ACCOUNT_TYPE_MAPPING[source];
                }

                this.set({
                    displayName : displayName
                });

                Object.defineProperties(this, {
                    isSimAccount : {
                        get : function () {
                            return this.get('source') === ACCOUNT_SOURCE_MAPPING.ACCT_SRC_SIM;
                        }
                    }
                });
            },
            containGroup : function (groupId) {
                var groupIds = _.pluck(this.get('group'), 'id');
                return groupIds.indexOf(groupId) >= 0;
            },
            hasGroupWithName : function (name) {
                var group = _.find(this.get('group'), function (group) {
                    return group.title === name;
                });
                return !!group;
            }
        });

        return AccountModel;
    });
}(this));
