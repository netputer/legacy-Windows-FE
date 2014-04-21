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
            template : doT.template(TemplateFactory.get('welcome', 'update-card')),
            className : FeedCardView.getClass().prototype.className + ' vbox update',
            initialize : function () {
                appsCollection = AppsCollection.getInstance();
                this.listenTo(appsCollection, 'refresh', function () {
                    this.render();
                    this.options.parentView.initLayout();
                });
            },
            render : function () {
                var apps = appsCollection.getUpdatableApps();
                var items = apps.concat();
                var lastLength = Settings.get('welcome-card-update-number') || 0;

                var show = apps.length !== 0 && (lastLength !== apps.length || Settings.get('welcome-card-update-ignore'));

                this.$el.toggleClass('hide', !show);

                if (show) {

                    if (apps.length >= 3 ) {
                        items = items.splice(0, 3);
                    } else {
                        items = items.splice(0, 1);
                    }

                    this.$el.html(this.template({
                        action : i18n.welcome.CARD_UPDATE_ACTION,
                        length : apps.length,
                        items : _.map(items, function (app) {
                            return app.toJSON();
                        })
                    }));

                    this.$el.toggleClass('max', apps.length >= 3);

                }

                Settings.set('welcome-card-update-number', apps.length, true);
                return this;
            },
            clickButtonAction : function (evt) {
                Backbone.trigger('switchModule', {
                    module : 'app',
                    tab : 'update'
                });

                this.log({
                    action : 'update'
                }, evt);
            },
            clickButtonIgnore : function (evt) {
                this.log({
                    action : 'ignore'
                }, evt);
                this.remove();

                Settings.set('welcome-card-update-ignore', true, true);
            },
            events : {
                'click .button-action, .apps-list' : 'clickButtonAction',
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
