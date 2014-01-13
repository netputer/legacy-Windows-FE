/*global define*/
(function (window) {
    define([
        'underscore',
        'backbone',
        'doT',
        'ui/TemplateFactory',
        'IO',
        'Configuration',
        'Log'
    ], function (
        _,
        Backbone,
        doT,
        TemplateFactory,
        IO,
        CONFIG,
        log
    ) {
        console.log('ConnectionGuideView - File loaded. ');

        var ConnectionGuideView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('welcome', 'connection-guide')),
            className : 'w-welcome-connection-guide-ctn hbox',
            render : function () {
                this.$el.html(this.template({}));
                return this;
            },
            clickButtonConnect : function () {
                IO.requestAsync(CONFIG.actions.CONNET_PHONE);

                log({
                    'event' : 'ui.click.welcome_button_connect'
                });
            },
            events : {
                'click .button-connect' : 'clickButtonConnect'
            }
        });

        var factory = _.extend({
            getInstance : function () {
                return new ConnectionGuideView();
            }
        });

        return factory;
    });
}(this));
