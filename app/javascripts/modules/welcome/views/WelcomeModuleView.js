/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'welcome/views/WelcomeView',
        'Environment',
        'Settings',
        'Device',
        'Log',
        'utilities/QueryString'
    ], function (
        Backbone,
        _,
        WelcomeView,
        Environment,
        Settings,
        Device,
        log,
        QueryString
    ) {
        console.log('WelcomeModuleView - File loaded.');

        var WelcomeModuleView = Backbone.View.extend({
            className : 'w-welcome-module-main module-main',
            initialize : function () {
                var rendered = true;
                Object.defineProperties(this, {
                    set : function (value) {
                        rendered = value;
                    },
                    get : function () {
                        return rendered;
                    }
                });
            },
            render : function () {
                this.contentView = WelcomeView.getInstance();
                this.$el.append(this.contentView.render().$el);

                this.rendered = true;

                log({
                    'event' : 'ui.show.welcome_module',
                    'isConnected' : Device.get('isConnected'),
                    'isUSB' : Device.get('isUSB'),
                    'isWifi' : Device.get('isWifi')
                });
                return this;
            },
            remove : function () {
                if (this.contentView) {
                    this.contentView.remove();
                }
                WelcomeModuleView.__super__.remove.call(this);
            }
        });

        var welcomeModuleView;

        var factory = _.extend({
            getInstance : function () {
                if (!welcomeModuleView) {
                    welcomeModuleView = new WelcomeModuleView();
                }
                return welcomeModuleView;
            },
            preload : function () {
                return;
            }
        });

        return factory;
    });
}(this));
