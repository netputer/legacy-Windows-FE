/*global define*/
(function (window) {
    define([
        'underscore',
        'backbone',
        'doT',
        'ui/TemplateFactory',
        'Configuration',
        'IO',
        'Internationalization',
        'Log'
    ], function (
        _,
        Backbone,
        doT,
        TemplateFactory,
        CONFIG,
        IO,
        i18n,
        log
    ) {
        console.log('CloseAutoStartView - File loaded. ');

        var CloseAutoStartView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('misc', 'close-auto-start')),
            className : 'w-misc-device-close-auto-start hbox',
            render : function () {
                this.$el.html(this.template({}));

                log({
                    'event' : 'debug.welcome.disabled_auto_start_panel_show'
                });
                return this;
            },
            clickButtonSetup : function () {
                IO.requestAsync(CONFIG.actions.WINDOW_OPEN_SETTING);

                log({
                    'event' : 'ui.click.welcome_disabled_auto_start_panel_setting'
                });
            },
            clickButtonClose : function () {
                this.$el.slideUp('fast', function () {
                    this.remove();
                }.bind(this));

                log({
                    'event' : 'ui.click.welcome_disabled_auto_start_panel_close'
                });
            },
            events : {
                'click .button-setup' : 'clickButtonSetup',
                'click .button-close' : 'clickButtonClose'
            }
        });

        var factory = _.extend({
            getInstance : function () {
                return new CloseAutoStartView();
            }
        });

        return factory;
    });
}(this));
