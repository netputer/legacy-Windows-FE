/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'Device',
        'ui/TemplateFactory',
        'Log',
        'Settings',
        'Environment',
        'app/wash/views/FeedbackWindowView'
    ], function (
        Backbone,
        _,
        doT,
        Device,
        TemplateFactory,
        log,
        Settings,
        Environment,
        FeedbackWindowView
    ) {
        console.log('IntroView - File loaded.');

        var IntroView = Backbone.View.extend({
            className : 'w-app-wash-intro',
            template : doT.template(TemplateFactory.get('wash', 'wash-intro')),
            initialize : function () {
                this.listenTo(Device, 'change', this.toggleState);
            },
            toggleState : function (Device) {
                this.$('.button-start').prop({
                    disabled : !Device.get('isConnected') ||
                                    !Device.get('isUSB')
                });

                if (!Device.get('isConnected') || !Device.get('isUSB')) {
                    this.$('.connect-tip').show();
                } else {
                    this.$('.connect-tip').hide();
                }
            },
            render : function () {
                this.$el.html(this.template({}));

                this.toggleState(Device);

                return this;
            },
            clickButtonStart : function () {
                this.trigger('next');

                Settings.set('has-used-wash', true, Environment.get('deviceId'));
                Settings.set('last-used-wash-time', new Date().getTime(), Environment.get('deviceId'));

                this.remove();

                log({
                    'event' : 'ui.click.wash.button_start'
                });
            },
            clickButtonFeedback : function () {
                FeedbackWindowView.getInstance().show();

                log({
                    'event' : 'ui.click.wash.button_feedback_intro_view'
                });
            },
            events : {
                'click .button-feedback' : 'clickButtonFeedback',
                'click .button-start' : 'clickButtonStart'
            }
        });

        var factory = _.extend({
            getInstance : function () {
                return new IntroView();
            }
        });

        return factory;
    });
}(this));
