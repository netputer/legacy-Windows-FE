/*global define, console*/
(function (window) {
    define([
        'backbone',
        'doT',
        'jquery',
        'underscore',
        'Device',
        'Internationalization',
        'ui/Panel',
        'ui/UIHelper',
        'ui/TemplateFactory',
        'contact/models/ExportContextModel',
        'contact/views/ExportTipWindowView',
        'contact/views/ExportSelectNumberView'
    ], function (
        Backbone,
        doT,
        $,
        _,
        Device,
        i18n,
        Panel,
        UIHelper,
        TemplateFactory,
        ExportContextModel,
        ExportTipWindowView,
        ExportSelectNumberView
    ) {
        console.log('ExportSelectTypeView - File loaded. ');

        var ExportSelectTypeBodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('contact', 'export-select-type')),
            className : 'w-contact-export-body',
            render : function () {
                this.$el.html(this.template({}));
                return this;
            },
            setFileType : function (evt) {
                var $checked_radio = this.$('input[name="contact-export-type"]:checked');
                ExportContextModel.set({
                    fileType : parseInt($checked_radio.attr('value'), 10)
                });
            }
        });

        var bodyView;

        var ExportSelectTypeView = Panel.extend({
            initialize : function () {
                ExportSelectTypeView.__super__.initialize.apply(this, arguments);

                this.on(UIHelper.EventsMapping.SHOW, function () {
                    bodyView = new ExportSelectTypeBodyView();
                    this.$bodyContent = bodyView.render().$el;
                    this.setButtonState();
                    this.center();
                }, this);

                Device.on('change:isConnected', this.setButtonState, this);

                this.buttons = [{
                    $button : $('<button>').html(i18n.ui.NEXT).addClass('button-next primary'),
                    eventName : 'button_next'
                }, {
                    $button : $('<button>').html(i18n.ui.CANCEL),
                    eventName : 'button_cancel'
                }];
            },
            setButtonState : function () {
                this.$('input[value="1"], input[value="2"], input[value="3"]').prop({
                    disabled : !Device.get('isConnected')
                });
            },
            clickButtonNext : function () {
                bodyView.setFileType();
                this.trigger('_NEXT_STEP');
            },
            events : {
                'click .button-next' : 'clickButtonNext'
            }
        });

        var exportSelectTypeView;

        var factory = _.extend({
            getInstance : function () {
                if (!exportSelectTypeView) {
                    exportSelectTypeView = new ExportSelectTypeView({
                        title : i18n.contact.WINDOW_EXPORT_TITLE,
                        disableX : true,
                        height : 260,
                        width : 400
                    });
                }
                return exportSelectTypeView;
            }
        });

        return factory;
    });
}(this));
