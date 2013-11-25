/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'jquery',
        'Configuration',
        'IO'
    ], function (
        Backbone,
        _,
        $,
        CONFIG,
        IO
    ) {
        console.log('ContactModel - File loaded.');

        var ContactModel = Backbone.Model.extend({
            defaults : {
                account_name : '',
                account_type : '',
                avatar : CONFIG.enums.CONTACT_DEFAULT_ICON_LARGE,
                avatarSmall : CONFIG.enums.CONTACT_DEFAULT_ICON,
                displayName : '',
                isNew : false,
                group : []
            },
            parse : function (contact) {
                if (contact.group) {
                    contact.group = _.sortBy(contact.group, function (group) {
                        return parseInt(group.group_row_id, 10);
                    });
                }

                if (contact.photo && contact.photo[0] && contact.photo[0].data) {
                    contact.avatar = 'file:///' + contact.photo[0].data;
                    contact.avatarSmall = 'file:///' + contact.photo[0].data;
                }

                if (contact.name) {
                    var name = contact.name;

                    if (name.display_name) {
                        contact.displayName = contact.name.display_name;
                    }

                    name.prefix = (name.prefix !== 'þþþþþþþþ' && name.prefix !== '~') ? name.prefix : '';

                    contact.name = name;
                }

                return contact;
            },
            initialize : function () {
                Object.defineProperties(this, {
                    hasPhoneNumber : {
                        get : function () {
                            return this.get('phone') && this.get('phone').length > 0;
                        }
                    },
                    defaultNumber : {
                        get : function () {
                            var phone = this.get('phone');

                            if (!phone) {
                                return '';
                            }

                            var defaultNumber = _.filter(phone, function (phone) {
                                return phone.is_primary;
                            });

                            return defaultNumber.length === 0 ? phone[0].number : defaultNumber[0].number;
                        }
                    },
                    isReadOnly : {
                        get : function () {
                            return this.get('read_only');
                        }
                    },
                    isStarred : {
                        get : function () {
                            return this.get('starred') === 1;
                        }
                    },
                    birthday : {
                        get : function () {
                            var result = '';

                            if (this.get('event')) {
                                if (this.get('event').length > 0) {
                                    var birthday = _.filter(this.get('event'), function (event) {
                                        return event.type === 3;
                                    })[0];

                                    if (birthday !== undefined) {
                                        result = birthday.start_date;
                                    }
                                }
                            }

                            return result;
                        }
                    },
                    firstLetter : {
                        get : function () {
                            var name = this.get('name');
                            var letter = name && name.prefix ? name.prefix.toUpperCase() : '';
                            letter = letter ? letter.substring(0, 1) : '';
                            return letter;
                        }
                    }
                });
            },
            toggleStarAsync : function () {
                var deferred = $.Deferred();

                var url = this.get('starred') === 1 ?
                            CONFIG.actions.CONTACT_UNSTART : CONFIG.actions.CONTACT_START;

                IO.requestAsync({
                    url : url,
                    data : {
                        contact : this.id
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('ContactModel - Star success. ');
                            this.set(resp.body);
                            deferred.resolve(resp);
                        } else {
                            console.log('ContactModel - Star failed. Error info: ' + resp.state_line);
                            deferred.reject(resp);
                        }
                        this.collection.trigger('refresh', this.collection);
                    }.bind(this)
                });

                return deferred.promise();
            },
            isInGroup : function (accountName, groupId) {
                return this.get('account_name') === accountName &&
                        _.pluck(this.get('group'), 'group_row_id').indexOf(groupId) >= 0;
            }
        });

        return ContactModel;
    });
}(this));
