/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'Internationalization',
        'Settings',
        'ui/TemplateFactory',
        'utilities/StringUtil',
        'welcome/views/FeedCardView',
        'main/collections/PIMCollection',
        'app/collections/AppsCollection',
        'app/views/OneKeyUpdateWindowView'
    ], function (
        Backbone,
        _,
        doT,
        i18n,
        Settings,
        TemplateFactory,
        StringUtil,
        FeedCardView,
        PIMCollection,
        AppsCollection,
        OneKeyUpdateWindowView
    ) {
        var appsCollection;

        var UpdateCardView = FeedCardView.getClass().extend({
            template : doT.template(TemplateFactory.get('welcome', 'card-app-set')),
            className : FeedCardView.getClass().prototype.className + ' app-set update',
            tagName : 'li',
            initialize : function () {
                appsCollection = AppsCollection.getInstance();
                this.listenTo(appsCollection, 'refresh', function () {
                    this.render();
                    this.options.parentView.initLayout();
                });
            },
            render : function () {
                var apps = appsCollection.getUpdatableApps();
                var lastShownTimestamp = Settings.get('welcome-card-update-show') || 1;
                var show = apps.length !== 0 && (StringUtil.formatDate('YY/MM/DD') !== StringUtil.formatDate('YY/MM/DD', lastShownTimestamp));
                this.$el.toggleClass('hide', !show);
                if (show) {
                    this.$el.html(this.template({
                        items : _.map(apps.concat().splice(0, 5), function (app) {
                            return app.toJSON();
                        }),
                        title : i18n.welcome.CARD_UPDATE_TITLE,
                        desc : StringUtil.format(i18n.welcome.CARD_UPDATE_DESC, apps[0].get('base_info').name, apps.length),
                        action : i18n.welcome.CARD_UPDATE_ACTION,
                        length : apps.length
                    }));

                    this.$('.count').toggleClass('min', apps.length > 99);

                    Settings.set('welcome-card-update-show', new Date().getTime(), true);
                }

                return this;
            },
            clickButtonDetail : function () {
                PIMCollection.getInstance().get(3).set('selected', true);
                Backbone.trigger('switchModule', {
                    module : 'app',
                    tab : 'update'
                });

                PIMCollection.getInstance().get(14).set('selected', true);
            },
            clickButtonAction : function () {
                OneKeyUpdateWindowView.getInstance().show();
                this.remove();
            },
            clickButtonIgnore : function () {
                this.remove();
            },
            events : {
                'click .button-action' : 'clickButtonAction',
                'click .button-detail' : 'clickButtonDetail',
                'click .button-ignore' : 'clickButtonIgnore'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new UpdateCardView(args);
            }
        });

        return factory;
    });
}(this));
