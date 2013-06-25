/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'welcome/views/WelcomeView',
        'Environment',
        'Settings',
        'utilities/QueryString',
        'welcome/views/ConnectionGuideView',
        'welcome/views/CloseAutoStartView',
        'welcome/views/NewIaQuestionnaireView'
    ], function (
        Backbone,
        _,
        WelcomeView,
        Environment,
        Settings,
        QueryString,
        ConnectionGuideView,
        CloseAutoStartView,
        NewIaQuestionnaireView
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
                if (Environment.get('deviceId') === 'Default') {
                    this.contentView = ConnectionGuideView.getInstance();
                    Environment.once('change:deviceId', function (Environment, deviceId) {
                        this.contentView.remove();
                        this.contentView = WelcomeView.getInstance();
                        this.$el.append(this.contentView.render().$el);
                    }, this);
                } else {
                    this.contentView = WelcomeView.getInstance();
                }

                this.$el.append(this.contentView.render().$el);

                //if (!Settings.get('close_auto_start_view_shown') && QueryString.get('start_source') === 'helper') {
                //    this.$el.append(CloseAutoStartView.getInstance().render().$el);
                //    Settings.set('close_auto_start_view_shown', true);
                //}

                if (!Settings.get('new_ia_questionnaire_chosed')) {
                    this.$el.append(NewIaQuestionnaireView.getInstance().render().$el);
                }

                this.rendered = true;
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

            }
        });

        return factory;
    });
}(this));
