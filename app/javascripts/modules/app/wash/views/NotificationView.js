/*global define*/
(function (window) {
    define([
        'backbone',
        'doT',
        'underscore',
        'ui/TemplateFactory',
        'IO',
        'Configuration',
        'Log'
    ], function (
        Backbone,
        doT,
        _,
        TemplateFactory,
        IO,
        CONFIG,
        log
    ) {
        console.log('NotificationView - File loaded. ');

        var NotificationView = Backbone.View.extend({
            className : 'w-app-wash-notification hbox',
            template : doT.template(TemplateFactory.get('wash', 'wash-notification')),
            render : function () {
                this.$el.html(this.template({}));
                return this;
            },
            clickButtonWash : function () {
                IO.requestAsync({
                    url : CONFIG.actions.PUBLISH_EVENT,
                    data : {
                        channel : CONFIG.events.WEB_NAVIGATE,
                        value : JSON.stringify({
                            type : CONFIG.enums.NAVIGATE_TYPE_APP_WASH
                        })
                    }
                });

                log({
                    'event' : 'ui.click.wash.button_notification_start'
                });
            },
            events : {
                'click .button-wash' : 'clickButtonWash'
            }
        });

        var factory = _.extend({
            getInstance : function () {
                return new NotificationView();
            }
        });

        return factory;
    });
}(this));
