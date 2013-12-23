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
                this.$el.html(this.template({
                    isLogin : Account.get('isLogin'),
                    userName : Account.get('userName')
                }));

                return this;
            },
            clickButtonLogin : function () {
                if (!Account.get('isLogin')) {
                    Account.loginAsync('', 'welcome-account');
                }

                log({
                    'event' : 'ui.click.welcome_button_login'
                });
            },
            events : {
                'click .button-login' : 'clickButtonLogin'
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
