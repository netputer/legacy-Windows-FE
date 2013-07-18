/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'Internationalization',
        'ui/TemplateFactory',
        'utilities/StringUtil',
        'welcome/views/FeedCardView',
        'main/collections/PIMCollection',
        'app/collections/AppsCollection',
        'task/TaskService'
    ], function (
        Backbone,
        _,
        doT,
        i18n,
        TemplateFactory,
        StringUtil,
        FeedCardView,
        PIMCollection,
        AppsCollection,
        TaskService
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
                this.$el.toggleClass('hide', apps.length === 0);
                if (apps.length !== 0) {
                    this.$el.html(this.template({
                        items : _.map(apps.concat().splice(0, 5), function (app) {
                            return app.toJSON();
                        }),
                        title : i18n.welcome.CARD_UPDATE_TITLE,
                        desc : StringUtil.format(i18n.welcome.CARD_UPDATE_DESC, apps[0].get('base_info').name, apps.length),
                        action : i18n.welcome.CARD_UPDATE_ACTION
                    }));

                    this.$('.count').toggleClass('min', apps.length > 99);
                }

                return this;
            },
            clickButtonDetail : function () {
                // Backbone.trigger('switchModule', {
                //     module : 'app',
                //     tab : 'update'
                // });

                PIMCollection.getInstance().get(14).set('selected', true);
            },
            clickButtonAction : function () {
                var apps = _.map(appsCollection.getUpdatableApps(), function (app) {
                    app.set({
                        isUpdating : true
                    }).unignoreUpdateAsync();

                    var updateModel = app.updateInfo.clone();
                    return {
                        downloadUrl : updateModel.get('downloadUrl'),
                        title : updateModel.get('title'),
                        iconSrc : updateModel.get('iconPath'),
                        versionName : updateModel.get('versionName'),
                        versionCode : updateModel.get('versionCode'),
                        size : updateModel.get('size'),
                        packageName : updateModel.get('packageName')
                    };
                }, this);

                TaskService.batchDownloadAsync(apps, 'one-key-update');
            },
            events : {
                'click .button-action' : 'clickButtonAction',
                'click .button-detail' : 'clickButtonDetail'
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
