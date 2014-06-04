/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'jquery',
        'doT',
        'IO',
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
                ChangelogCardView.__super__.initialize.apply(this, arguments);

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
                                blog : resp.blog
                            }));

                            if (resp.icon) {
                                var $img = $(new window.Image());
                                $img.one('load', function (){
                                    this.$('.icon-ctn').css({
                                        'background' : 'url(\'' + resp.icon + '\') no-repeat 0 0',
                                    });
                                }.bind(this)).attr('src', resp.icon);
                            }

                            Settings.set('latestVersion', Environment.get('backendVersion'));

                            this.options.parentView.initLayout();
                        }
                    }.bind(this)
                });
                return this;
            },
            clickButtonAction : function (evt) {
                this.openUrl(this.resp.blog);
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
                'click .button-action, .icon, .title' : 'clickButtonAction',
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
