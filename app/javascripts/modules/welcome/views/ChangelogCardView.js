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
            latestVersion : Settings.get('latestVersion'),
            render : function () {
                var show = this.latestVersion !== Environment.get('backendVersion');
                if (show) {
                    this.$el.html(this.template({}));

                    $.ajax({
                        url : CONFIG.actions.WELCOME_CHANGELOG,
                        data : {
                            version : Environment.get('backendVersion').split('.')[1]
                        },
                        success : function (resp) {
                            resp = JSON.parse(resp);
                            this.$el.removeClass('hide');

                            this.$el.html(this.template({
                                title : resp.title,
                                subtitle : resp.subtitle,
                                icon : resp.icon
                            }));

                            Settings.set('latestVersion', Environment.get('backendVersion'), true);

                            this.options.parentView.initLayout();

                            log({
                                'event' : 'ui.show.welcome_card',
                                'type' : this.model.get('type')
                            });
                        }.bind(this)
                    });
                }
                return this;
            },
            clickButtonAction : function () {
                var url = 'http://www.wandoujia.com/history/?format=html&from=client&new={1}&old={2}';

                $('<a>').attr({
                    href : formatString(url, Environment.get('backendVersion'), this.latestVersion),
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
