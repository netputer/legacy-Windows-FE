/*global define, _, console, doT*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'ui/Panel',
        'ui/TemplateFactory',
        'Internationalization',
        'contact/models/ExportContextModel',
        'contact/views/ExportSelectNumberView'
    ], function (
        Backbone,
        _,
        doT,
        $,
        Panel,
        TemplateFactory,
        i18n,
        ExportContextModel,
        ExportSelectNumberView
    ) {
        console.log('ExportTipWindowView - File loaded. ');

        var ExportTipWindowView = Panel.extend({
            initialize : function () {
                ExportTipWindowView.__super__.initialize.apply(this, arguments);
                this.setFileType();

                this.buttons = [{
                    $button : $('<button>').html(i18n.contact.EXPORT_USING_VCARD),
                    eventName : 'button_vcard'
                }, {
                    $button : $('<button>').addClass('primary').html(i18n.ui.CONTINUE),
                    eventName : 'button_next'
                }, {
                    $button : $('<button>').html(i18n.ui.CANCEL),
                    eventName : 'button_cancel'
                }];

                this.on('rendered', this.setFileType);
                this.on('button_vcard', this.clickButtonVCard);
                this.on('button_next', this.clickButtonNext);
            },
            setFileType : function() {
                switch (ExportContextModel.get('fileType')) {
                    case 1:
                        this.$bodyContent = doT.template(TemplateFactory.get('contact', 'export-tip'))({
                            tip : i18n.contact.ALERT_TIP_EXOPRT_OUTLOOK
                        });
                        break;
                    case 2:
                        this.$bodyContent = doT.template(TemplateFactory.get('contact', 'export-tip'))({
                            tip : i18n.contact.ALERT_TIP_EXOPRT_WINDOWS_MAIL
                        });
                        break;
                    case 3:
                        this.$bodyContent = doT.template(TemplateFactory.get('contact', 'export-tip'))({
                            tip : i18n.contact.ALERT_TIP_EXOPRT_NOKIA
                        });
                        break;
                }
            },
            clickButtonVCard : function () {
                ExportContextModel.set({
                    fileType : 0
                });
                this.trigger('_NEXT_STEP');
            },
            clickButtonNext : function () {
                this.trigger('_NEXT_STEP');
            }
        });

        var exportTipWindowView;

        var factory = _.extend({
            getInstance : function () {
                if (!exportTipWindowView) {
                    exportTipWindowView = new ExportTipWindowView({
                        title : i18n.contact.WINDOW_EXPORT_TITLE,
                        disableX : true,
                        height : 260,
                        width : 400
                    });
                }
                return exportTipWindowView;
            }
        });

        return factory;
    });
}(this));
