/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'IO',
        'Configuration',
        'Internationalization',
        'Settings',
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
        Settings,
        TemplateFactory,
        StringUtil,
        FeedCardView,
        PIMCollection,
        AppsCollection,
        TaskService,
        XibaibaiService
    ) {

        var XibaibaiCardView = FeedCardView.getClass().extend({
            template : doT.template(TemplateFactory.get('welcome', 'xibaibai-card')),
            className : FeedCardView.getClass().prototype.className + ' vbox xibaibai hide',
            tagName : 'li',
            render : function () {
                XibaibaiService.scanAppsAsync().done(function (appsQueryResultCollection) {
                    if (appsQueryResultCollection.length !== 0) {
                        var appsCollection = AppsCollection.getInstance();

                        this.$el.html(this.template({
                            items : _.map(appsQueryResultCollection.models.concat().splice(0, 2), function (item) {
                                return appsCollection.get(item.get('sourceApk').packageName).toJSON();
                            }),
                            title : i18n.welcome.CARD_XIBAIBAI_TITLE,
                            desc : i18n.welcome.CARD_XIBAIBAI_DESC,
                            action : i18n.welcome.CARD_XIBAIBAI_ACTION,
                            length : appsQueryResultCollection.length
                        }));

                        this.$('.count').toggleClass('min', appsQueryResultCollection.length > 99);

                        this.$el.removeClass('hide');
                        this.options.parentView.initLayout();

                        Settings.set('welcome-card-xibaibai-show', new Date().getTime(), true);
                    }
                }.bind(this));

                return this;
            },
            clickButtonAction : function (evt) {
                IO.requestAsync({
                    url : CONFIG.actions.PUBLISH_EVENT,
                    data : {
                        channel : CONFIG.events.WEB_NAVIGATE,
                        value : JSON.stringify({
                            type : CONFIG.enums.NAVIGATE_TYPE_APP_WASH
                        })
                    }
                });

                this.log({
                    action : 'xibaibai'
                }, evt);
            },
            clickButtonIgnore : function (evt) {
                this.log({
                    action : 'ignore'
                }, evt);
                this.remove();
            },
            events : {
                'click .button-action, .icon, .title' : 'clickButtonAction',
                'click .button-ignore' : 'clickButtonIgnore',
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
