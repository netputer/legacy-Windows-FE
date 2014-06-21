/*global define*/
(function (window) {
    define([
        'jquery',
        'backbone',
        'underscore',
        'doT',
        'Log',
        'Device',
        'FunctionSwitch',
        'ui/TemplateFactory'
    ], function (
        $,
        Backbone,
        _,
        doT,
        log,
        Device,
        FunctionSwitch,
        TemplateFactory
    ) {
        console.log('ManageSDCardView - File loaded');

        var ManageSDCardView = Backbone.View.extend({
            className : 'w-tools-card sdcard hbox',
            template : doT.template(TemplateFactory.get('tools', 'tools-sd-card')),
            render : function () {
                this.$el.html(this.template({}));
                return this;
            },
            clickButtonClick : function () {
                var $btn = this.$('.button-action').prop('disabled', true);

                setTimeout(function () {
                    $btn.prop('disabled', false);
                }.bind(this), 2000);

                Device.manageSDCardAsync();

                log({
                    'event' : 'ui.click.toolbox_sdcard'
                });

            },
            events : {
                'click .button-action' : 'clickButtonClick'
            }
        });

        var manageSDCardView;
        var factory = {
            getInstance : function (){
                if (!manageSDCardView) {
                    manageSDCardView = new ManageSDCardView();
                }

                return manageSDCardView;
            }
        };

        return factory;

    });
}(this));
