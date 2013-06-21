/*global define, console*/
(function (window, undefined) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'ui/Panel',
        'ui/TemplateFactory',
        'ui/UIHelper',
        'utilities/StringUtil',
        'Internationalization',
        'contact/collections/AccountCollection',
        'contact/collections/ContactsCollection',
        'contact/models/ExportContextModel',
        'contact/views/ExportProgressView',
        'contact/views/AccountSelectorView',
        'contact/views/GroupSelectorView'
    ], function (
        Backbone,
        _,
        doT,
        $,
        Panel,
        TemplateFactory,
        UIHelper,
        StringUtil,
        i18n,
        AccountCollection,
        ContactsCollection,
        ExportContextModel,
        ExportProgressView,
        AccountSelectorView,
        GroupSelectorView
    ) {
        console.log('ExportSelectNumberView - File loaded. ');

        var accountSelectorView;
        var groupSelectorView;

        var exportSelectNumberView;

        var contactsCollection;

        var ExportSelectNumberBodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('contact', 'export-select-number')),
            className : 'w-contact-export-body',
            initialize : function () {
                contactsCollection = ContactsCollection.getInstance();

                accountSelectorView = AccountSelectorView.getInstance({
                    disableAllLabel : true,
                    displayReadOnly : false
                });

                groupSelectorView = GroupSelectorView.getInstance({
                    enableAllLabel : true,
                    enableManagement : false
                });

                accountSelectorView.on('select', function (data) {
                    groupSelectorView.update(data.value);

                    ExportContextModel.set({
                        selectAccount : AccountCollection.getInstance().get(data.value).get('name')
                    });
                });

                groupSelectorView.on('select', function (data) {
                    ExportContextModel.set({
                        selectGroup : data.value
                    });

                    exportSelectNumberView.setButtonStatus();
                });
            },
            render : function () {
                this.$el.html(this.template({
                    selectNumber : ExportContextModel.get('selectNumber'),
                    allNumber : ExportContextModel.get('allNumber'),
                    hasPhoneNumber : ExportContextModel.get('hasPhoneNumber')
                }));

                this.$('.account').append(accountSelectorView.render().$el)
                    .append(groupSelectorView.render().$el);
                accountSelectorView.$el.prop({
                    disabled : true
                });
                groupSelectorView.$el.prop({
                    disabled : true
                });
                groupSelectorView.update(accountSelectorView.accountId);

                ExportContextModel.set({
                    selectAccount : AccountCollection.getInstance().get(accountSelectorView.accountId).get('name'),
                    selectGroup : groupSelectorView.groupId
                });
                return this;
            },
            setDataType : function (evt) {
                var $checkedRadio = this.$('input[name="contact-export"]:checked');
                ExportContextModel.set({
                    dataType : parseInt($checkedRadio.attr('value'), 10)
                });
                if ($checkedRadio.val() === '4') {
                    ExportContextModel.set({
                        selectGroup : groupSelectorView.groupId
                    });
                }
            },
            changeRadio : function (evt) {
                accountSelectorView.$el.prop({
                    disabled : $(evt.currentTarget).val() !== '4'
                });
                groupSelectorView.$el.prop({
                    disabled : $(evt.currentTarget).val() !== '4'
                });
                this.trigger('radioChange');
            },
            events : {
                'change input[name="contact-export"]' : 'changeRadio'
            }
        });

        var bodyView;

        var ExportSelectNumberView = Panel.extend({
            initialize : function () {
                ExportSelectNumberView.__super__.initialize.apply(this, arguments);

                this.on(UIHelper.EventsMapping.SHOW, function () {
                    bodyView = new ExportSelectNumberBodyView();
                    bodyView.on('radioChange', this.setButtonStatus.bind(this));
                    bodyView.setDataType();
                    this.$bodyContent = bodyView.render().$el;

                    this.setButtonStatus();
                    this.center();
                }, this);

                this.buttons = [{
                    $button : $('<button>').html(i18n.ui.NEXT).addClass('primary button-next'),
                    eventName : 'button_next'
                }, {
                    $button : $('<button>').html(i18n.ui.CANCEL),
                    eventName : 'button_cancel'
                }];
            },
            clickButtonNext : function () {
                bodyView.setDataType();
                this.trigger('_NEXT_STEP');
            },
            setButtonStatus : function (btn) {
                bodyView.setDataType();
                var numbers = [
                    0,
                    ExportContextModel.get('selectNumber'),
                    ExportContextModel.get('allNumber'),
                    ExportContextModel.get('hasPhoneNumber'),
                    ExportContextModel.get('selectGroup') !== 'all' ?
                            contactsCollection.getContactsByGroupIdAndAccountName(ExportContextModel.get('selectGroup'), ExportContextModel.get('selectAccount')).length :
                            contactsCollection.getContactsByAccountName(ExportContextModel.get('selectAccount')).length
                ];
                this.$('.button-next').prop({
                    disabled : (numbers[ExportContextModel.get('dataType')] <= 0)
                });
            },
            events : {
                'click .button-next' : 'clickButtonNext'
            }
        });

        var factory = _.extend({
            getInstance : function () {
                if (!exportSelectNumberView) {
                    exportSelectNumberView = new ExportSelectNumberView({
                        title : i18n.contact.WINDOW_EXPORT_TITLE,
                        disableX : true,
                        height : 260,
                        width : 400
                    });
                }
                return exportSelectNumberView;
            }
        });

        return factory;
    });
}(this));