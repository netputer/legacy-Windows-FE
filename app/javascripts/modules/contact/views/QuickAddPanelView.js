/*global define*/
(function (window) {
    define([
        'backbone',
        'doT',
        'jquery',
        'underscore',
        'ui/TemplateFactory',
        'Internationalization',
        'Device',
        'Log',
        'contact/collections/AccountCollection',
        'contact/collections/ContactsCollection',
        'contact/views/AccountSelectorView'
    ], function (
        Backbone,
        doT,
        $,
        _,
        TemplateFactory,
        i18n,
        Device,
        log,
        AccountCollection,
        ContactsCollection,
        AccountSelectorView
    ) {
        console.log('QuickAddPanelView - File loaded. ');

        var accountSelectorView;

        var QuickAddPanelView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('contact', 'quick-add')),
            className : 'w-contact-quick-add-panel',
            initialize : function () {
                var running = false;
                Object.defineProperties(this, {
                    running : {
                        set : function (value) {
                            running = value;
                            this.$('input, button').prop({
                                disabled : running
                            });
                            this.$('.running').toggle(running);
                        },
                        get : function () {
                            return running;
                        }
                    }
                });

                Device.on('change:isConnected', function (Device, isConnected) {
                    this.$('button').prop({
                        disabled : !isConnected
                    });
                }, this);
            },
            validateForm : function () {
                var $inputs = this.$('input');

                var $input;
                if (!$inputs[0].value.trim() && !$inputs[1].value.trim() && !$inputs[2].value.trim()) {
                    $($inputs[0]).focus();
                    return false;
                }

                var i;
                for (i = 0; i < $inputs.length; i++) {
                    $input = $($inputs[i]);
                    if (!$input[0].validity.valid) {
                        $input.focus();
                        return false;
                    }
                }

                return true;
            },
            render : function () {
                this.$el.html(this.template({}));

                this.$('button').prop({
                    disabled : !Device.get('isConnected')
                });

                accountSelectorView = AccountSelectorView.getInstance({
                    disableAllLabel : true,
                    displayReadOnly : false
                });

                this.$('.account-ctn').append(accountSelectorView.render().$el);

                accountSelectorView.$el.attr({
                    id : 'w-contact-quick-add-account'
                });

                this.$('#w-contact-quick-add-email')[0].addEventListener('invalid', function (e) {
                    e.preventDefault();
                }, true);
                return this;
            },
            generateData : function () {
                var account = AccountCollection.getInstance().get(accountSelectorView.accountId);
                var data = {
                    name : {
                        value : this.$('.input-name').val().trim()
                    },
                    account_name : account.get('name'),
                    account_type : account.get('type')
                };
                var phone = this.$('.input-phone').val().trim();
                var email = this.$('.input-email').val().trim();

                if (phone) {
                    data.phone = [{
                        value : phone,
                        type : 2
                    }];
                }

                if (email) {
                    data.email = [{
                        value : email,
                        type : 1
                    }];
                }

                return data;
            },
            showHint : function (content) {
                var $hint = this.$('.hint').html(content);
                setTimeout(function () {
                    $hint.html('');
                }, 2000);
            },
            clickButtonSave : function (evt) {
                if (this.validateForm()) {
                    this.running = true;

                    ContactsCollection.getInstance().addNewContactAsync(this.generateData()).done(function () {
                        this.$('.new-contact')[0].reset();
                        this.showHint(i18n.contact.SAVE_SUCCESS);
                    }.bind(this)).fail(function () {
                        this.showHint(i18n.contact.SAVE_FAILED);
                    }.bind(this)).always(function () {
                        this.running = false;
                    }.bind(this));
                }

                log({
                    'event' : 'ui.click.contact.save.button.quick.add',
                    'nameIsNull' : this.$('.input-name').val().trim() ? true : false,
                    'telIsNull' : this.$('.input-phone').val().trim() ? true : false,
                    'emailIsNull' : this.$('.input-email').val().trim() ? true : false
                });
            },
            events : {
                'click .button-save' : 'clickButtonSave'
            }
        });

        var quickAddPanelView;

        var factory = _.extend({
            getInstance : function () {
                if (!quickAddPanelView) {
                    quickAddPanelView = new QuickAddPanelView();
                }
                return quickAddPanelView;
            }
        });

        return factory;
    });
}(this));
