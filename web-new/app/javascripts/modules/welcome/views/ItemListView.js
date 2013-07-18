/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'Configuration',
        'Internationalization',
        'ui/TemplateFactory',
        'utilities/StringUtil',
        'welcome/views/FeedCardView',
        'task/TaskService',
        'browser/views/BrowserModuleView'
    ], function (
        Backbone,
        _,
        doT,
        $,
        CONFIG,
        i18n,
        TemplateFactory,
        StringUtil,
        FeedCardView,
        TaskService,
        BrowserModuleView
    ) {
        var classMap = {
            20 : 'exclusive',
            21 : 'special',
            22 : 'games',
            23 : 'videos',
            24 : 'guess',
            25 : 'preorder'
        };

        var ItemListView = FeedCardView.getClass().extend({
            template : doT.template(TemplateFactory.get('welcome', 'item-list-card')),
            className : FeedCardView.getClass().prototype.className + ' item-list',
            render : function () {
                this.$el.html(this.template(this.model.toJSON()));
                this.$el.addClass(classMap[this.model.get('type')]);
                return this;
            },
            clickButtonAction : function (evt) {
                var $target = $(evt.currentTarget);
                var item = _.find(this.model.get('items'), function (item) {
                    return item.key === $target.data('key');
                });

                var model = new Backbone.Model().set({
                    downloadUrl : item.action.url,
                    title : item.title,
                    iconPath : item.icons.px78,
                    packageName : item.key,
                    source : 'start-page-list'
                });

                TaskService.addTask(CONFIG.enums.TASK_TYPE_INSTALL, CONFIG.enums.MODEL_TYPE_APPLICATION, model);
            },
            clickButtonNavigate : function (evt) {
                var item = _.find(this.model.get('items'), function (item) {
                    return item.key === $(evt.currentTarget).data('key');
                });

                var basePath = 'http://apps.wandoujia.com/apps/{1}?pos=w/start_page_list';

                BrowserModuleView.navigateToThirdParty(item.extId, '', StringUtil.format(basePath, item.key));
            },
            events : {
                'click .button-action' : 'clickButtonAction',
                'click .button-navigate' : 'clickButtonNavigate'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new ItemListView(args);
            }
        });

        return factory;
    });
}(this));
