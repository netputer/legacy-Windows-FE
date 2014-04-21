/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'jquery',
        'doT',
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
            className : FeedCardView.getClass().prototype.className + ' vbox changelog hide',
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
            clickButtonAction : function (evt) {
                $('<a>').attr({
                    href : this.resp.blog,
                    target : '_default'
                })[0].click();

                this.log({
                    action : 'changelog',
                }, evt);
            },
            clickButtonIgnore : function (evt) {
                this.log({
                    action : 'ignore',
                }, evt);

                this.remove();
            },
            events : {
                'click .button-action, .icon' : 'clickButtonAction',
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
