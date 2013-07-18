/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'Configuration',
        'Internationalization',
        'ui/TemplateFactory',
        'ui/ImageLoader',
        'welcome/views/FeedCardView',
        'task/TaskService',
        'browser/views/BrowserModuleView'
    ], function (
        Backbone,
        _,
        doT,
        CONFIG,
        i18n,
        TemplateFactory,
        imageLoader,
        FeedCardView,
        TaskService,
        BrowserModuleView
    ) {
        var SingleCardView = FeedCardView.getClass().extend({
            template : doT.template(TemplateFactory.get('welcome', 'sigle-card')),
            className : FeedCardView.getClass().prototype.className + ' single',
            render : function () {
                this.$el.html(this.template(this.model.toJSON()));

                imageLoader(this.model.get('icons').px256, this.$('.icon'));

                return this;
            },
            clickButtonAction : function () {
                var model = new Backbone.Model().set({
                    downloadUrl : this.model.get('action').url,
                    title : this.model.get('title'),
                    iconPath : this.model.get('icons').px78,
                    packageName : this.model.get('key'),
                    source : 'start-page-single'
                });

                TaskService.addTask(CONFIG.enums.TASK_TYPE_INSTALL, CONFIG.enums.MODEL_TYPE_APPLICATION, model);
            },
            clickButtonNavigate : function () {
                BrowserModuleView.navigateToThirdParty(this.model.get('extId'), '', this.model.get('imprUrl'));
            },
            events : {
                'click .button-action' : 'clickButtonAction',
                'click .button-navigate' : 'clickButtonNavigate'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new SingleCardView(args);
            }
        });

        return factory;
    });
}(this));
