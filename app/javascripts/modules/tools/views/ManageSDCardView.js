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
            initialize : function () {
                var $button;
                Object.defineProperties(this, {
                    $button : {
                        get : function () {
                            return $button;
                        },
                        set : function (value) {
                            $button = value;
                        }
                    }
                });
            },
            render : function () {
                this.$el.html(this.template({}));

                setTimeout(function (){
                    this.$button = this.$('.button-action');
                }.bind(this), 0);

                return this;
            },
            clickButtonClick : function () {
                this.$button.prop('disabled', true);

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
