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
        'ui/Panel',
        'ui/TemplateFactory',
        'ui/UIHelper'
    ], function (
        Backbone,
        doT,
        $,
        _,
        Device,
        i18n,
        IO,
        CONFIG,
        Panel,
        TemplateFactory,
        UIHelper
    ) {

        console.log('File ExportSelectView - File loaded');

        var ExportSelectViewBody = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('message', 'export-select')),
            className : 'w-message-export-select-body-ctn',
            initialize : function () {
                ExportSelectViewBody.__super__.initialize.call(this, arguments);
            },
            render : function () {
                this.$el.html(this.template({}));
                return this;
            },
            update : function (selectedConversationCount, selectedSmsCount, allSms) {
                this.$('.cover-count').text(' ' + selectedConversationCount + ' ');
                this.$('.sms-count').text(selectedSmsCount + ' ');
                this.$('input[value="2"] + .count').text('(' + allSms + ')');

                if (selectedSmsCount === 0) {
                    this.$('input[name="sms_export"][value="1"]').prop('disabled', true);
                    this.$('input[name="sms_export"][value="2"]').attr({
                        checked : true
                    });
                } else {
                    this.$('input[name="sms_export"][value="1"]').prop('disabled', false).attr({
                        checked : true
                    });
                }
            }
        });

        var exportSelectView;
        var ExportSelectView = Panel.extend({
            initialize : function () {

                ExportSelectView.__super__.initialize.call(this, arguments);

                var exportType;
                Object.defineProperties(this, {
                    exportType : {
                        get : function () {
                            return exportType;
                        },
                        set : function (value) {
                            exportType = value;
                        }
                    }
                });

                this.on(UIHelper.EventsMapping.SHOW, function () {
                    var bodyView = new ExportSelectViewBody();

                    this.$bodyContent = bodyView.render().$el;

                    this.update = function (selectedConversationCount, selectedSmsCount, allSms) {
                        this.typeCount.coversation = parseInt(selectedConversationCount, 10);
                        this.typeCount.all = parseInt(allSms, 10);
                        bodyView.update(selectedConversationCount, selectedSmsCount, allSms);
                    };
                    this.once('remove', function () {
                        bodyView.remove();
                        delete this.update;
                    }, this);

                    this.$el.delegate('label', 'click', this.switchTypeState.bind(this));
                });

                this.listenTo(Device, 'change:isConnected', function (Device, isConnected) {
                    this.setNextBtnDisable(!isConnected);
                });

                this.buttons = [{
                    $button : $('<button>').html(i18n.ui.NEXT).addClass('button-next primary'),
                    eventName : 'button-next'
                }, {
                    $button : $('<button>').html(i18n.ui.CANCEL).addClass('button-cancel'),
                    eventName : 'button-cancel'
                }];
            },
            typeCount : {
                coversation : 0,
                all : 0
            },
            exportTypes: {
                CONVERSATION : 1,
                ALL : 2
            },
            switchTypeState : function () {
                var type = this.$('input[name="sms_export"]:checked').val();
                type = parseInt(type, 10);
                if (type === this.exportTypes.CONVERSATION) {
                    this.setNextBtnDisable(this.typeCount.coversation <= 0);
                } else if (type === this.exportTypes.ALL) {
                    this.setNextBtnDisable(this.typeCount.all <= 0);
                }

                this.exportType = type;
            },
            initState : function () {
                this.exportType = 1;
            },
            setNextBtnDisable : function (disable) {
                this.$('.button-next').prop('disabled', disable);
            },
            clickNextBtn : function () {
                this.trigger('_NEXT_BTN', this.exportType);
            },
            clickCancelBtn : function () {
                this.remove();
                this.trigger('_CANCEL_BTN');
            },
            events : {
                'click .button-next' : 'clickNextBtn',
                'click .button-cancel' : 'clickCancelBtn'
            }
        });

        var factory = {
            getInstance : function () {
                if (!exportSelectView) {
                    exportSelectView = new ExportSelectView({
                        title : i18n.message.EXPORT_MESSAGE,
                        width : 400,
                        disableX: true
                    });
                }
                return exportSelectView;
            }
        };

        return factory;
    });
}(this));
