/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'IOBackendDevice',
        'Internationalization',
        'Settings',
        'ui/TemplateFactory',
        'welcome/views/FeedCardView'
    ], function (
        Backbone,
        _,
        doT,
        IO,
        i18n,
        Settings,
        TemplateFactory,
        FeedCardView
    ) {
        var TiebaCardView = FeedCardView.getClass().extend({
            template : doT.template(TemplateFactory.get('welcome', 'tieba')),
            className : FeedCardView.getClass().prototype.className + ' vbox tieba hide',
            render : function () {
                this.$el.html(this.template({}));

                var count = Settings.get('welcome_count_tieba') || 0;

                if (!Settings.get('welcome_feed_tieba') && count < 5) {
                    this.$el.removeClass('hide');
                    this.options.parentView.initLayout();

                    Settings.set('welcome_count_tieba', count + 1, true);
                } else {
                    this.hide();
                }

                return this;
            },
            setSettings : function () {
                Settings.set('welcome_feed_tieba', true, true);
            },
            clickButtonAction : function () {
                setTimeout(function () {
                    this.$el.find('.button-action').attr({
                        disabled : true
                    }).text(i18n.welcome.CARD_WEIBO_ACTION_CLICKED);
                }.bind(this), 500);

                this.openUrl("http://tieba.baidu.com/f?ie=utf-8&kw=%E8%B1%8C%E8%B1%86%E8%8D%9A");
                this.log({
                    action : 'tieba'
                });
                this.setSettings();
            },
            clickButtonIgnore : function () {

                this.log({
                    action : 'ignore'
                });

                this.setSettings();
                this.remove();
            },
            events : {
                'click .button-action' : 'clickButtonAction',
                'click .button-ignore' : 'clickButtonIgnore'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new TiebaCardView(args);
            }
        });

        return factory;
    });
}(this));
