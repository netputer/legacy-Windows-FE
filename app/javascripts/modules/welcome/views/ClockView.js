/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'Device',
        'Account',
        'Log',
        'ui/TemplateFactory',
        'utilities/FormatDate',
        'Internationalization'
    ], function (
        Backbone,
        _,
        doT,
        Device,
        Account,
        log,
        TemplateFactory,
        formatDate,
        i18n
    ) {
        console.log('ClockView - File loaded. ');

        var ClockView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('welcome', 'clock')),
            className : 'w-welcome-clock vbox',
            initialize : function () {
                setInterval(this.renderContent.bind(this), 1000 * 30);

                this.listenTo(Device, 'change:screenshot', function (Device, screenshot) {
                    this.$el.toggleClass('min', screenshot.rotation === 1 || screenshot.rotation === 3);
                });

                this.listenTo(Account, 'change:isLogin change:userName', _.debounce(this.render, 200));
            },
            renderContent : function () {
                this.$el.find('.time').text(formatDate('HH:mm')).end()
                        .find('.date').text(formatDate(i18n.welcome.CLOCK_DATE_FORMAT)).end()
                        .find('.day').text(formatDate('DD'));
            },
            render : function () {
                var hour = formatDate('HH'),
                    greeting = i18n.welcome.ACCOUNT_GREETING;

                greeting = i18n.welcome.ACCOUNT_MORNING;
                greeting = i18n.welcome.ACCOUNT_NOON;
                greeting = i18n.welcome.ACCOUNT_AFTERNOON;
                greeting = i18n.welcome.ACCOUNT_EVENING;

                if (hour >= 6) {
                    if (hour <= 10) {
                        greeting = i18n.welcome.ACCOUNT_MORNING;
                    } else if (hour <= 13) {
                        greeting = i18n.welcome.ACCOUNT_NOON;
                    } else if (hour <= 18) {
                        greeting = i18n.welcome.ACCOUNT_AFTERNOON;
                    } else {
                        greeting = i18n.welcome.ACCOUNT_EVENING;
                    }
                }

                this.$el.html(this.template({
                    isLogin : Account.get('isLogin'),
                    greeting : greeting,
                    userName : Account.get('userName')
                }));

                this.renderContent();

                return this;
            },
            clickButtonRegister : function () {
                if (!Account.get('isLogin')) {
                    Account.regAsync('', 'welcome-account');
                }

                log({
                    'event' : 'ui.click.welcome_button_register'
                });
            },
            events : {
                'click .button-register' : 'clickButtonRegister'
            }
        });

        var factory = _.extend({
            getInstance : function () {
                return new ClockView();
            }
        });

        return factory;
    });
}(this));
