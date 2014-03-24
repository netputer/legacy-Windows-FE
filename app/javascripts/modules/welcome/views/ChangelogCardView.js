/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'jquery',
        'doT',
        'Log',
        'IOBackendDevice',
        'Configuration',
        'Environment',
        'Settings',
        'Internationalization',
        'utilities/FormatString',
        'ui/TemplateFactory',
        'welcome/views/FeedCardView'
    ], function (
        Backbone,
        _,
        $,
        doT,
        log,
        IO,
        CONFIG,
        Environment,
        Settings,
        i18n,
        formatString,
        TemplateFactory,
        FeedCardView
    ) {
        var ChangelogCardView = FeedCardView.getClass().extend({
            template : doT.template(TemplateFactory.get('welcome', 'changelog')),
            className : FeedCardView.getClass().prototype.className + ' changelog hide',
            initialize : function () {
                var resp = {};
                Object.defineProperties(this, {
                    resp : {
                        set : function (value) {
                            resp = value;
                        },
                        get : function () {
                            return resp;
                        }
                    }
                });
            },
            render : function () {
                this.$el.html(this.template({}));

                IO.requestAsync({
                    url : CONFIG.actions.WELCOME_CHANGELOG,
                    data : {
                        version : Environment.get('backendVersion')
                    },
                    success : function (resp) {
                        try {
                            resp = JSON.parse(resp);
                        } catch (e) {
                            resp = {};
                        }

                        this.resp = resp;

                        if (resp.subtitle && resp.icon) {
                            this.$el.removeClass('hide');

                            this.$el.html(this.template({
                                title : resp.title,
                                subtitle : resp.subtitle,
                                icon : resp.icon,
                                blog : resp.blog
                            }));

                            Settings.set('latestVersion', Environment.get('backendVersion'));

                            this.options.parentView.initLayout();
                        }
                    }.bind(this)
                });
                return this;
            },
            clickButtonAction : function () {
                $('<a>').attr({
                    href : this.resp.blog,
                    target : '_default'
                })[0].click();

                log({
                    'event' : 'ui.click.welcome_card_action',
                    'type' : this.model.get('type'),
                    'index' : this.getIndex(),
                    'action' : 'changelog'
                });
            },
            clickButtonIgnore : function () {
                this.remove();
            },
            events : {
                'click .button-action' : 'clickButtonAction',
                'click .button-ignore' : 'clickButtonIgnore'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new ChangelogCardView(args);
            }
        });

        return factory;
    });
}(this));
