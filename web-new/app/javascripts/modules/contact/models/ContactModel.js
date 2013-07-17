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

                if (this.get('group')) {
                    this.set({
                        group : _.sortBy(this.get('group'), function (group) {
                            return parseInt(group.group_row_id, 10);
                        })
                    });
                }

                if (this.get('photo') && this.get('photo')[0] && this.get('photo')[0].data) {
                    this.set({
                        avatar : 'file:///' + this.get('photo')[0].data,
                        avatarSmall : 'file:///' + this.get('photo')[0].data
                    });
                }

                if (this.get('name')) {
                    var name = this.get('name');

                    if (name.display_name) {
                        this.set({
                            displayName : this.get('name').display_name
                        });
                    }

                    name.prefix = (name.prefix !== 'þþþþþþþþ' && name.prefix !== '~') ? name.prefix : '';

                    this.set({
                        name : name
                    });
                }
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
