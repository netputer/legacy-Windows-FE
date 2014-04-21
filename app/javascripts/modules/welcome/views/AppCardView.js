/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'Configuration',
        'Device',
        'Internationalization',
        'ui/TemplateFactory',
        'ui/ImageLoader',
        'utilities/StringUtil',
        'utilities/ReadableSize',
        'welcome/views/FeedCardView',
        'task/TaskService',
        'app/collections/AppsCollection',
        'task/collections/TasksCollection'
    ], function (
        Backbone,
        _,
        doT,
        $,
        CONFIG,
        Device,
        i18n,
        TemplateFactory,
        imageLoader,
        StringUtil,
        ReadableSize,
        FeedCardView,
        TaskService,
        AppsCollection,
        TasksCollection
    ) {
        var appsCollection;
        var tasksCollection;

        var basePath = 'http://apps.wandoujia.com/apps/{1}?pos=w/start_page_single';

        var AppCardView = FeedCardView.getClass().extend({
            template : doT.template(TemplateFactory.get('welcome', 'app-card')),
            className : FeedCardView.getClass().prototype.className + ' app',
            initialize : function () {

                appsCollection = appsCollection || AppsCollection.getInstance();
                tasksCollection = tasksCollection || TasksCollection.getInstance();

                this.listenTo(appsCollection, 'refresh', this.renderButton)
                .listenTo(tasksCollection, 'refresh', this.renderButton)
                    .listenTo(Device, 'change:isConnected', this.renderButton);
            },
            render : function () {

                var isAd = this.model.get('ad');
                this.model.set('readAbleSize', ReadableSize(this.model.get('apks')[0].bytes));
                this.$el.html(this.template(this.model.toJSON()))
                    .toggleClass('ad', isAd);

                imageLoader(this.model.get('icons').px100, this.$('.icon'), true);

                this.renderButton();

                if (isAd) {
                    var image = new window.Image();
                    image.src = this.model.get('imprUrl');
                }

                return this;
            },
            renderButton : function () {
                var targetApp = appsCollection.get(this.model.get('packageName'));
                var targetTask = tasksCollection.find(function (task) {
                    return task.get('detail') === this.model.get('packageName');
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
            clickButtonAction : function (evt) {

                var target = appsCollection.get(this.model.get('packageName'));
                var model = new Backbone.Model({
                    title : this.model.get('title'),
                    iconPath : this.model.get('icons').px36,
                    packageName : this.model.get('packageName'),
                    source : 'start-page-single'
                });

                if (target !== undefined && target.isUpdatable) {
                    model.set('downloadUrl', target.updateInfo.get('downloadUrl'));
                } else {
                    model.set('downloadUrl', this.model.get('apks')[0].downloadUrl.url);
                }

                TaskService.addTask(CONFIG.enums.TASK_TYPE_INSTALL, CONFIG.enums.MODEL_TYPE_APPLICATION, model);

                this.log({
                    action : 'install',
                    content : this.model.get('packageName')
                }, evt);
            },
            clickButtonNavigate : function (evt) {
                this.openDoraemon('18-' + StringUtil.format(basePath, this.model.get('packageName')));

                this.log({
                    action : 'doraemon',
                    content : this.model.get('packageName')
                }, evt);
            },
            events : {
                'click .button-action' : 'clickButtonAction',
                'click .button-navigate, .icon' : 'clickButtonNavigate'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new AppCardView(args);
            }
        });

        return factory;
    });
}(this));
