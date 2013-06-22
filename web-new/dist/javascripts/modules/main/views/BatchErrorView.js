/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'jquery',
        'doT',
        'ui/AlertWindow',
        'Device',
        'Internationalization',
        'ui/TemplateFactory'
    ], function (
        Backbone,
        _,
        $,
        doT,
        AlertWindow,
        Device,
        i18n,
        TemplateFactory
    ) {
        console.log('BatchErrorView - File loaded. ');

        var BodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('misc', 'batch-error-window')),
            className : 'w-misc-error-window-body',
            render : function () {
                this.$el.html(this.template(this.options));
                return this;
            }
        });

        var BatchErrorView = AlertWindow.extend({
            initialize : function () {
                BatchErrorView.__super__.initialize.apply(this, arguments);

                this.buttons = [{
                    $button : $('<button>').html(i18n.ui.RETRY).addClass('primary').prop({
                        disabled : this.options.needConnection ? !Device.get('isConnected') : false
                    }),
                    eventName : 'button_retry'
                }, {
                    $button : $('<button>').html(i18n.ui.CANCEL),
                    eventName : 'button_cancel'
                }];

                this.once('show', function () {
                    var bodyView = new BodyView(this.options);

                    this.$bodyContent = bodyView.render().$el;
                    this.once('remove', function () {
                        bodyView.remove();
                        this.off();
                    }, this);
                }, this);

                if (this.options.needConnection) {
                    this.listenTo(Device, 'change:isConnected', function (Device, isConnected) {
                        this.buttons[0].$button.prop({
                            disabled : !isConnected
                        });
                    });
                }
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new BatchErrorView(args);
            }
        });

        return factory;
    });
}(this));
