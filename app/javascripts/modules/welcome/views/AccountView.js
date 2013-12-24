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
            className : 'w-welcome-account hbox',
            initialize : function () {
                this.listenTo(Account, 'change:isLogin change:userName', _.debounce(this.render, 200));
            },
            render : function () {
                var hour = formatDate('HH'),
                    greeting = '您好';

                if (hour >= 6) {
                    if (hour <= 10) {
                        greeting = '早上好';
                    } else if (hour <= 13) {
                        greeting = '中午好';
                    } else if (hour <= 18) {
                        greeting = '下午好';
                    } else {
                        greeting = '晚上好';
                    }
                }

                this.$el.html(this.template({
                    isLogin : Account.get('isLogin'),
                    greeting : greeting,
                    userName : Account.get('userName')
                }));

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
                return new AccountView();
            }
        });

        return factory;
    });
}(this));
