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
        'Log',
        'IO',
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
        i18n,
        log,
        IO,
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
            initialize : function () {
                appsCollection = appsCollection || AppsCollection.getInstance();
                tasksCollection = tasksCollection || TasksCollection.getInstance();

                this.listenTo(appsCollection, 'refresh', this.renderButton);
                this.listenTo(tasksCollection, 'refresh', this.renderButton);
                this.listenTo(Device, 'change:isConnected', this.renderButton);
                this.listenTo(this.model, 'change', this.render);
            },
            render : function () {
                this.$el.html(this.template(this.model.toJSON()));
                this.$el.addClass(classMap[this.model.get('type')]);

                this.renderButton();

                var $icons = this.$('.icon');
                _.each(this.model.get('items'), function (item, index) {
                    imageLoader(item.icons.px36, $icons.eq(index));
                });

                log({
                    'event' : 'ui.show.welcome_card',
                    'type' : this.model.get('type')
                });
                return this;
            },
            renderButton : function () {
                var $buttons = this.$('.button-action');
                $buttons.each(function () {
                    var $button = $(this);
                    var targetApp = appsCollection.get($button.data('key'));
                    var targetTask = tasksCollection.find(function (task) {
                        return task.get('detail') === $button.data('key');
                    });

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
                            $button.html(i18n.app.UPDATABLE).prop({
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
                });
            },
            clickButtonAction : function (evt) {
                var $target = $(evt.currentTarget);
                var item = _.find(this.model.get('items'), function (item) {
                    return item.key === $target.data('key');
                });

                var target = appsCollection.get(item.key);
                var model = new Backbone.Model().set({
                    title : item.title,
                    iconPath : item.icons.px36,
                    packageName : item.key,
                    source : 'start-page-list'
                });

                if (target !== undefined && target.isUpdatable) {
                    model.set('downloadUrl', target.updateInfo.get('downloadUrl'));
                } else {
                    model.set('downloadUrl', item.action.url);
                }

                TaskService.addTask(CONFIG.enums.TASK_TYPE_INSTALL, CONFIG.enums.MODEL_TYPE_APPLICATION, model);

                log({
                    'event' : 'ui.click.welcome_card_action',
                    'type' : this.model.get('type'),
                    'index' : this.getIndex(),
                    'action' : 'install',
                    'content' : item.key
                });
            },
            clickButtonNavigate : function (evt) {
                var item = _.find(this.model.get('items'), function (item) {
                    return item.key === $(evt.currentTarget).data('key');
                });

                var basePath = 'http://apps.wandoujia.com/apps/{1}?pos=w/start_page_list';

                BrowserModuleView.navigateToThirdParty(item.extId, '', StringUtil.format(basePath, item.key));

                log({
                    'event' : 'ui.click.welcome_card_navigate',
                    'type' : this.model.get('type'),
                    'index' : this.getIndex(),
                    'content' : item.key
                });
            },
            clickButtonMore : function (evt) {
                BrowserModuleView.navigateToThirdParty(this.model.get('extId'), '', this.model.get('url'));

                log({
                    'event' : 'ui.click.welcome_card_more',
                    'type' : this.model.get('type'),
                    'content' : this.model.get('url')
                });
            },
            events : {
                'click .button-action' : 'clickButtonAction',
                'click .button-navigate' : 'clickButtonNavigate',
                'click .button-more' : 'clickButtonMore'
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
