/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'IO',
        'Configuration',
        'Internationalization',
        'ui/TemplateFactory',
        'utilities/StringUtil',
        'welcome/views/FeedCardView',
        'main/collections/PIMCollection',
        'app/collections/AppsCollection',
        'task/TaskService',
        'app/wash/XibaibaiService'
    ], function (
        Backbone,
        _,
        doT,
        IO,
        CONFIG,
        i18n,
        TemplateFactory,
        StringUtil,
        FeedCardView,
        PIMCollection,
        AppsCollection,
        TaskService,
        XibaibaiService
    ) {

        var XibaibaiCardView = FeedCardView.getClass().extend({
            template : doT.template(TemplateFactory.get('welcome', 'card-app-set')),
            className : FeedCardView.getClass().prototype.className + ' app-set xibaibai',
            tagName : 'li',
            render : function () {
                this.$el.addClass('hide');
                XibaibaiService.scanAppsAsync().done(function (appsQueryResultCollection) {
                    if (appsQueryResultCollection.length !== 0) {
                        var appsCollection = AppsCollection.getInstance();

                        this.$el.html(this.template({
                            items : _.map(appsQueryResultCollection.models.concat().splice(0, 5), function (item) {
                                return appsCollection.get(item.get('sourceApk').packageName).toJSON();
                            }),
                            title : i18n.welcome.CARD_XIBAIBAI_TITLE,
                            desc : i18n.welcome.CARD_XIBAIBAI_DESC,
                            action : i18n.welcome.CARD_XIBAIBAI_ACTION
                        }));

                        this.$('.count').toggleClass('min', appsQueryResultCollection.length > 99);

                        this.$el.removeClass('hide');
                        this.options.parentView.initLayout();
                    }
                }.bind(this));

                return this;
            },
            clickButtonAction : function () {
                IO.requestAsync({
                    url : CONFIG.actions.PUBLISH_EVENT,
                    data : {
                        channel : CONFIG.events.WEB_NAVIGATE,
                        value : JSON.stringify({
                            type : CONFIG.enums.NAVIGATE_TYPE_APP_WASH
                        })
                    }
                });
            },
            events : {
                'click .button-action' : 'clickButtonAction'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new XibaibaiCardView(args);
            }
        });

        return factory;
    });
}(this));
