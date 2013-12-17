/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'Log',
        'IOBackendDevice',
        'Internationalization',
        'Settings',
        'ui/TemplateFactory',
        'welcome/views/FeedCardView'
    ], function (
        Backbone,
        _,
        doT,
        log,
        IO,
        i18n,
        Settings,
        TemplateFactory,
        FeedCardView
    ) {
        var WeiboCardView = FeedCardView.getClass().extend({
            template : doT.template(TemplateFactory.get('welcome', 'weibo')),
            className : FeedCardView.getClass().prototype.className + ' weibo hide',
            render : function () {
                this.$el.html(this.template({}));

                var count = Settings.get('welcome_count_weibo') || 0;

                if (!Settings.get('welcome_feed_weibo') &&
                        count < 5) {
                    this.$el.removeClass('hide');
                    this.options.parentView.initLayout();

                    Settings.set('welcome_count_weibo', count + 1, true);

                    log({
                        'event' : 'ui.show.welcome_card',
                        'type' : this.model.get('type')
                    });
                } else {
                    this.hide();
                }

                return this;
            },
            hide : function () {
                Settings.set('welcome_feed_weibo', true, true);
            },
            clickButtonAction : function () {
                setTimeout(function () {
                    this.$el.addClass('following').find('.button-action').attr({
                        disabled : true
                    }).text(i18n.welcome.CARD_WEIBO_ACTION_CLICKED);
                }.bind(this), 500);

                this.hide();

                log({
                    'event' : 'ui.click.welcome_card_action',
                    'type' : this.model.get('type'),
                    'index' : this.getIndex(),
                    'action' : 'weibo'
                });
            },
            clickButtonIgnore : function () {
                this.hide();
                this.remove();
            },
            events : {
                'click .button-action' : 'clickButtonAction',
                'click .button-ignore' : 'clickButtonIgnore'
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
