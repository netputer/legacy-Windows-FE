/*global console, define*/
(function (window) {
    define([
        'backbone',
        'doT',
        'jquery',
        'underscore',
        'Device',
        'Internationalization',
        'IO',
        'Configuration',
        'WindowController',
        'contact/models/ImportContextModel',
        'ui/Panel',
        'ui/AlertWindow',
        'contact/collections/ContactsCollection',
        'contact/collections/AccountCollection',
        'ui/TemplateFactory',
        'ui/UIHelper',
        'utilities/StringUtil'
    ], function (
        Backbone,
        doT,
        $,
        _,
        Device,
        i18n,
        IO,
        CONFIG,
        WindowController,
        ImportContextModel,
        Panel,
        AlertWindow,
        ContactsCollection,
        AccountCollection,
        TemplateFactory,
        UIHelper,
        StringUtil
    ) {

        console.log('ImportProcessView - File loaded');

        var alert = window.alert;
        var ImportProcessBodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('contact', 'import-progress')),
            className : 'w-contact-import-process-body',
            render : function () {
                this.$el.html(this.template({}));
                return this;
            },
            setDuplicate : function (duplicateNum) {
                var info = (duplicateNum === null) ? '' : StringUtil.format(i18n.contact.DUPLICATE, duplicateNum);
                this.$('.duplicate').text(info);
            }
        });

        var importProcessView;
        var $bodyView;
        var contactsCollection = ContactsCollection.getInstance();
        var accountCollection = AccountCollection.getInstance();
        var ImportProcessView = Panel.extend({

            initialize : function () {
                ImportProcessView.__super__.initialize.apply(this, arguments);

                this.on(UIHelper.EventsMapping.SHOW, function () {

                    $bodyView = new ImportProcessBodyView();
                    this.$bodyContent = $bodyView.render().$el;
                    this.center();

                    this.once('remove', $bodyView.remove, $bodyView);
                }, this);

                this.buttons = [{
                    $button : $('<button>').html(i18n.contact.FINISH).addClass('button-finish primary').hide(),
                    eventName : 'button-finish'
                }, {
                    $button : $('<button>').html(i18n.contact.CANCEL).addClass('button-cancel'),
                    eventName : 'button-cancel'
                }];
            },
            setProgress : function (current, total) {
                var content = current + ' / ' + total;
                this.$('.progress-num').text(content);
                if (current === total) {
                    this.$('.progress-desc').text(i18n.contact.IMPORT_CONTACT_FINISH);
                    this.$('.running').removeClass('running');
                }

                this.$('progress').attr({
                    max : total,
                    value : current
                });
            },
            importContact : function () {
                var accountId = ImportContextModel.get('accountId');
                var account = accountCollection.get(accountId).toJSON();
                var file = ImportContextModel.get('files');

                var sessionId = _.uniqueId('import_contact');
                this.lastSession = sessionId;

                var handler = IO.Backend.Device.onmessage({
                    'data.channel' : sessionId
                }, function (msg) {
                    if (msg.info === 'dup') {
                        var num = parseInt(msg.current, 10);
                        if (num > 0) {
                            $bodyView.setDuplicate(msg.current);
                        }
                    } else {
                        this.setProgress(msg.current, msg.total);
                        if (msg.current === msg.total) {
                            contactsCollection.syncAsync();
                            IO.Backend.Device.offmessage(handler);
                            this.$('.button-finish').show();
                            this.$('.button-cancel').hide();
                        }
                    }
                }, this);

                var callback = function (response) {
                    WindowController.releaseWindowAsync();
                    this.trigger('_IMPORT_CONTACT', response);
                }.bind(this);

                WindowController.blockWindowAsync();
                contactsCollection.importAsync(account.name, account.type, file, sessionId).always(callback);
            },
            clickButtonCancel : function () {

                IO.requestAsync({
                    url : CONFIG.actions.CONTACT_CANCEL,
                    data : {
                        session : this.lastSession
                    }
                }).done(function (resp) {

                    if (resp.state_code === 200) {

                        contactsCollection.syncAsync();
                        alert(i18n.misc.CANCEL_IMPORT_TEXT);
                    }

                }.bind(this)).always(function () {
                    WindowController.releaseWindowAsync();
                });

            },
            clickButtonFinish : function () {
                this.remove();
            },
            events : {
                'click .button-cancel' : 'clickButtonCancel',
                'click .button-finish' : 'clickButtonFinish'
            },
            initState : function () {
                this.$('.button-finish').hide();
                this.$('.button-cancel').show();
            }
        });

        var factory = {
            getInstance : function () {
                if (!importProcessView) {
                    importProcessView = new ImportProcessView({
                        title : i18n.contact.WINDOW_IMPORT_TITLE,
                        disableX : true,
                        width : 450
                    });
                }
                return importProcessView;
            }
        };

        return factory;
    });
}(this));
