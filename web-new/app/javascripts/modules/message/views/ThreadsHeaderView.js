/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'Configuration',
        'Internationalization',
        'Log',
        'IO',
        'ui/TemplateFactory',
        'ui/AlertWindow',
        'Device',
        'message/collections/ThreadsCollection',
        'contact/collections/ContactsCollection'
    ], function (
        Backbone,
        _,
        doT,
        CONFIG,
        i18n,
        log,
        IO,
        TemplateFactory,
        AlertWindow,
        Device,
        ThreadsCollection,
        ContactsCollection
    ) {
        console.log('ThreadsHeaderView - File loaded.');

        var ThreadsHeaderView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('message', 'threads-header')),
            className : 'nameplate-top hbox',
            initialize : function () {
                this.listenTo(Device, 'change:isConnected', function (Device, isConnected) {
                    this.setDisabled(!isConnected);
                });

                this.listenTo(this.model, 'change', this.render);
            },
            setDisabled : function (disabled) {
                this.$('button.button-addToContact, button.button-resend-all')[disabled ? 'hide' : 'show']();
                this.$('span.button-addToContact').prop('disabled', disabled);
            },
            render : function () {
                this.$el.html(this.template(this.model.toJSON()));

                this.setDisabled(!Device.get('isConnected'));
                return this;
            },
            clickButtonAddToContact : function () {
                if (Device.get('isConnected')) {
                    IO.requestAsync({
                        url : CONFIG.actions.PUBLISH_EVENT,
                        data : {
                            channel : CONFIG.events.WEB_NAVIGATE,
                            value : JSON.stringify({
                                id : ContactsCollection.getInstance().generateNewContact().set({
                                    phone : [{
                                        id : '',
                                        type : 2,
                                        number : this.model.get('phoneNumber')
                                    }]
                                }).toJSON(),
                                type : CONFIG.enums.NAVIGATE_TYPE_CONTACT_CREATE
                            })
                        }
                    });

                    log({
                        'event' : 'ui.click.contact.button.add',
                        'source' : 'sms'
                    });
                }
            },
            clickButtonNavigateToContact : function () {
                IO.requestAsync({
                    url : CONFIG.actions.PUBLISH_EVENT,
                    data : {
                        channel : CONFIG.events.WEB_NAVIGATE,
                        value : JSON.stringify({
                            id : this.model.get('contactId'),
                            type : CONFIG.enums.NAVIGATE_TYPE_CONTACT
                        })
                    }
                });
            },
            clickButtonResendAll : function () {
                ThreadsCollection.getInstance().resendAllAsync().fail(function (resp) {
                    if (resp.state_code === 740) {
                        var panel = new AlertWindow({
                            title : i18n.message.BATCH_SEND_TITLE,
                            $bodyContent : i18n.message.BATCH_SEND_TOO_MANY_TIP,
                            buttonSet : 'yes',
                            width : 360
                        });

                        panel.show();
                    }
                });
            },
            events : {
                'click .button-resend-all' : 'clickButtonResendAll',
                'click .button-addToContact': 'clickButtonAddToContact',
                'click .button-navigateToContact': 'clickButtonNavigateToContact'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new ThreadsHeaderView(args);
            }
        });

        return factory;
    });
}(this));
