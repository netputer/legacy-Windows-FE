/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'Configuration',
        'Device',
        'Log',
        'Internationalization',
        'ui/TemplateFactory',
        'ui/ImageLoader',
        'utilities/StringUtil',
        'welcome/views/FeedCardView',
        'task/TaskService',
        'browser/views/BrowserModuleView',
        'app/collections/AppsCollection',
        'task/collections/TasksCollection'
    ], function (
        Backbone,
        _,
        doT,
        $,
        CONFIG,
        Device,
        log,
        i18n,
        TemplateFactory,
        imageLoader,
        StringUtil,
        FeedCardView,
        TaskService,
        BrowserModuleView,
        AppsCollection,
        TasksCollection
    ) {
        var appsCollection;
        var tasksCollection;

        var SingleCardView = FeedCardView.getClass().extend({
            template : doT.template(TemplateFactory.get('welcome', 'sigle-card')),
            className : FeedCardView.getClass().prototype.className + ' single',
            initialize : function () {
                appsCollection = appsCollection || AppsCollection.getInstance();
                tasksCollection = tasksCollection || TasksCollection.getInstance();

                this.listenTo(appsCollection, 'refresh', this.renderButton);
                this.listenTo(tasksCollection, 'refresh', this.renderButton);
                this.listenTo(Device, 'change:isConnected', this.renderButton);
            },
            render : function () {
                this.$el.html(this.template(this.model.toJSON()));

                imageLoader(this.model.get('icons').px100, this.$('.icon'));

                this.renderButton();

                log({
                    'event' : 'ui.show.welcome_card',
                    'type' : this.model.get('type')
                });

                return this;
            },
            renderButton : function () {
                var targetApp = appsCollection.get(this.model.get('key'));
                var targetTask = tasksCollection.find(function (task) {
                    return task.get('detail') === this.model.get('key');
                }.bind(this));
                var $button = this.$('.button-action');

                if (targetTask !== undefined && (targetTask.get('state') !== CONFIG.enums.TASK_STATE_SUCCESS &&
                        targetTask.get('state') !== CONFIG.enums.TASK_STATE_FAILD)) {
                    $button.html(i18n.app.INSTALLING).prop({
                        disabled : true
                    });
                } else if (targetApp !== undefined) {
                    if (targetApp.get('isUpdating')) {
                        $button.html(i18n.app.UPDATING).prop({
                            disabled : true
                        });
                    } else if (targetApp.isUpdatable) {
                        $button.html(i18n.app.UPDATE).prop({
                            disabled : false
                        });
                    } else {
                        $button.html(i18n.misc.NAV_APP_INSTALLED).prop({
                            disabled : true
                        });
                    }
                } else {
                    $button.html(i18n.app.INSTALL).prop({
                        disabled : false
                    });
                }
            },
            clickButtonAction : function () {
                var target = appsCollection.get(this.model.get('key'));
                var model = new Backbone.Model().set({
                    title : this.model.get('title'),
                    iconPath : this.model.get('icons').px36,
                    packageName : this.model.get('key'),
                    source : 'start-page-single'
                });
                if (target !== undefined && target.isUpdatable) {
                    model.set('downloadUrl', target.updateInfo.get('downloadUrl'));
                } else {
                    model.set('downloadUrl', this.model.get('action').url);
                }

                TaskService.addTask(CONFIG.enums.TASK_TYPE_INSTALL, CONFIG.enums.MODEL_TYPE_APPLICATION, model);

                log({
                    'event' : 'ui.click.welcome_card_action',
                    'type' : this.model.get('type'),
                    'index' : this.getIndex(),
                    'action' : 'install',
                    'content' : this.model.get('key')
                });
            },
            clickButtonNavigate : function () {
                var basePath = 'http://apps.wandoujia.com/apps/{1}?pos=w/start_page_single';
                BrowserModuleView.navigateToThirdParty(this.model.get('extId'), '', StringUtil.format(basePath, this.model.get('key')));

                log({
                    'event' : 'ui.click.welcome_card_navigate',
                    'type' : this.model.get('type'),
                    'index' : this.getIndex(),
                    'content' : this.model.get('key')
                });
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
