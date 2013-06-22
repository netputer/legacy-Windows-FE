/*global define*/
(function (window, undefined) {
    define([
        'backbone',
        'Configuration',
        'Internationalization'
    ], function (
        Backbone,
        CONFIG,
        i18n
    ) {
        console.log('ConversationModel - File loaded.');

        var ConversationModel = Backbone.Model.extend({
            defaults : {
                contactIcon : CONFIG.enums.CONTACT_DEFAULT_ICON
            },
            initialize : function () {
                Object.defineProperties(this, {
                    hasUnread : {
                        get : function () {
                            return this.get('unread_number') > 0;
                        }
                    },
                    hasFailed : {
                        get : function () {
                            return this.get('failed_sms') > 0;
                        }
                    }
                });

                this.set({
                    id : this.id || this.get('conversation_id')
                });

                this.changeAddressHandler();
            },
            changeAddressHandler : function () {
                var address = this.get('address')[0];
                var contactIcon = CONFIG.enums.CONTACT_DEFAULT_ICON;
                var contactName = address.contact_id === '-1' ? address.phone_number : address.contact_name || i18n.contact.UNNAMED_CONTACT;

                if (this.get('address').length === 1) {
                    contactIcon = address.contact_icon ? 'file:///' + address.contact_icon : CONFIG.enums.CONTACT_DEFAULT_ICON;
                } else {
                    contactIcon = CONFIG.enums.CONTACT_DEFAULT_BATCH_ICON;
                }

                this.set({
                    contactName : contactName,
                    contactIcon : contactIcon
                });
            }
        });

        return ConversationModel;
    });
}(this));
