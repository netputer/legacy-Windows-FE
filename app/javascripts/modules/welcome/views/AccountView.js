/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'Account',
        'Log',
        'ui/TemplateFactory',
        'utilities/FormatDate',
        'Internationalization'
    ], function (
        Backbone,
        _,
        doT,
        Account,
        log,
        TemplateFactory,
        formatDate,
        i18n
    ) {
        console.log('AccountView - File loaded. ');

        var AccountView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('welcome', 'account')),
            className : 'w-welcome-account vbox',
            initialize : function () {
                this.listenTo(Account, 'change:isLogin change:userName', _.debounce(this.render, 200));
            },
            render : function () {
                var hour = formatDate('HH');
                var greeting = i18n.welcome.ACCOUNT_GREETING;

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
                    userName : Account.get('userName').length > 8 ? Account.get('userName').substr(0, 7) + '…' : Account.get('userName')
                })).toggleClass('logged-in', Account.get('isLogin'));

                return this;
            },
            clickButtonRegister : function () {
                Account.openRegDialog('', 'welcome-account');

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
                return new AccountView();
            }
        });

        return factory;
    });
}(this));
