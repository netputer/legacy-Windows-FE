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
        var WeiboCardView = FeedCardView.getClass().extend({
            template : doT.template(TemplateFactory.get('welcome', 'weibo')),
            className : FeedCardView.getClass().prototype.className + ' vbox weibo hide',
            render : function () {
                this.$el.html(this.template({}));

                var count = Settings.get('welcome_count_weibo') || 0;

                if (!Settings.get('welcome_feed_weibo') && count < 5) {
                    this.$el.removeClass('hide');
                    this.options.parentView.initLayout();

                    Settings.set('welcome_count_weibo', count + 1, true);
                } else {
                    this.hide();
                }

                return this;
            },
            setSettings : function () {
                Settings.set('welcome_feed_weibo', true, true);
            },
            doAction : function () {
                setTimeout(function () {
                    this.$el.addClass('following').find('.button-action').attr({
                        disabled : true
                    }).text(i18n.welcome.CARD_WEIBO_ACTION_CLICKED);
                }.bind(this), 500);

                this.openUrl('http://weibo.com/wandoulabs');

                this.setSettings();
            },
            clickButtonAction : function () {

                this.doAction();
                this.log({
                    action : 'weibo',
                    element : 'button'
                });
            },
            clickButtonIgnore : function () {

                this.setSettings();

                this.log({
                    action : 'ignore'
                });

                this.remove();
            },
            clickIcon : function () {

                this.doAction();
                this.log({
                    action : 'weibo',
                    element : 'icon'
                });
            },
            events : {
                'click .button-action' : 'clickButtonAction',
                'click .button-ignore' : 'clickButtonIgnore',
                'click .icon' : 'clickIcon'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new WeiboCardView(args);
            }
        });

        return factory;
    });
}(this));
