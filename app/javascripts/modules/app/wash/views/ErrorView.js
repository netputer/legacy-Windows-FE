/*global define*/
(function (window) {
    define([
        'backbone',
        'doT',
        'underscore',
        'Device',
        'ui/TemplateFactory',
        'Log'
    ], function (
        Backbone,
        doT,
        _,
        Device,
        TemplateFactory,
        log
    ) {
        console.log('ErrorView - File loaded.');

        var ErrorView = Backbone.View.extend({
            className : 'w-app-wash-error',
            template : doT.template(TemplateFactory.get('wash', 'wash-error')),
            render : function () {
                this.$el.html(this.template({}));
                return this;
            },
            clickButtonRetry : function () {
                this.trigger('next');
                this.remove();

                log({
                    'event' : 'ui.click.wash.button.retry'
                });
            },
            events : {
                'click .button-retry' : 'clickButtonRetry'
            }
        });

        var factory = _.extend({
            getInstance : function () {
                return new ErrorView();
            }
        });

        return factory;
    });
}(this));
