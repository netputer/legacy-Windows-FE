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
        FeedCardView,
        TaskService,
        AppsCollection,
        TasksCollection
    ) {
        var appsCollection = AppsCollection.getInstance();
        var tasksCollection = TasksCollection.getInstance();

        var BannerCardView = FeedCardView.getClass().extend({
            template : doT.template(TemplateFactory.get('welcome', 'banner-card')),
            className : FeedCardView.getClass().prototype.className + ' vbox banner',
            initialize : function () {

                var defaultAction = this.model.get('defaultAction');
                var action = this.model.get('action');
                var type = action.type;
                var data;
                var $button;
                var $title;

                switch (type) {
                case 'INSTALL':
                    this.listenTo(appsCollection, 'refresh', this.renderButton)
                        .listenTo(tasksCollection, 'refresh', this.renderButton)
                        .listenTo(Device, 'change:isConnected', this.renderButton);

                    data = action.app;
                    break;
                case 'OPEN_URL':
                    data = action;
                    break;
                }

                Object.defineProperties(this, {
                    type : {
                        get : function (pe) {
                            return type;
                        }
                    },
                    data : {
                        get : function () {
                            return data;
                        }
                    },
                    defaultAction : {
                        get : function () {
                            return defaultAction;
                        }
                    },
                    $button : {
                        get : function () {
                            if (!$button) {
                                $button =  this.$('.button-action');
                            }
                            return $button;
                        }
                    },
                    $title : {
                        get : function () {
                            if (!$title) {
                                $title = this.$('.title');
                            }
                            return $title;
                        },
                        set : function (value) {
                            $title = value;
                        }
                    }
                });
            },
            render : function () {

                this.$el.html(this.template(_.extend(this.data, {
                    title:this.model.get('title')
                })));

                imageLoader(this.model.get('imageUrl'), this.$('.icon'), true);
                this.renderButton();

                return this;
            },
            renderButton : function() {
                switch (this.type) {
                case 'INSTALL':
                    this.renderAppButton();
                    break;
                case 'OPEN_URL':
                    this.renderOpenUrlButton();
                    break;
                }

                this.$button.addClass(this.type.toLowerCase());
            },
            renderOpenUrlButton : function () {
                this.$button.html(i18n.misc.VIEW);
            },
            toggleEle : function (disabled) {
                this.$button.prop({
                    'disabled' : disabled
                });
            },
            renderAppButton : function () {

                var targetApp = appsCollection.get(this.data.packageName);
                var targetTask = tasksCollection.find(function (task) {
                    return task.get('detail') === this.data.packageName;
                }.bind(this));

                if (targetTask !== undefined && (targetTask.get('state') !== CONFIG.enums.TASK_STATE_SUCCESS &&
                        targetTask.get('state') !== CONFIG.enums.TASK_STATE_FAILD)) {
                    this.$button.html(i18n.app.INSTALLING);
                    this.toggleEle(true);
                } else if (targetApp !== undefined) {
                    if (targetApp.get('isUpdating')) {
                        this.$button.html(i18n.app.UPDATING);
                        this.toggleEle(true);
                    } else if (targetApp.isUpdatable) {
                        this.$button.html(i18n.app.UPDATE);
                        this.toggleEle(false);
                    } else {
                        this.$button.html(i18n.misc.NAV_APP_INSTALLED);
                        this.toggleEle(true);
                    }
                } else {
                    this.$button.html(i18n.app.INSTALL);
                    this.toggleEle(false);
                }
            },
            clickButtonInstall : function () {

                this.install();
                this.log({
                    action : 'install',
                    element : 'button'
                });
            },
            install : function () {
                var target = appsCollection.get(this.data.packageName);
                var model = new Backbone.Model().set({
                    title : this.data.title,
                    iconPath : this.data.icons.px36,
                    packageName : this.data.packageName,
                    source : 'start-page-single'
                });
                if (target !== undefined && target.isUpdatable) {
                    model.set('downloadUrl', target.updateInfo.get('downloadUrl'));
                } else {
                    model.set('downloadUrl', this.data.apks[0].downloadUrl.url);
                }

                TaskService.addTask(CONFIG.enums.TASK_TYPE_INSTALL, CONFIG.enums.MODEL_TYPE_APPLICATION, model);
            },
            clickButtonOpenUrl : function () {

                this.openUrl(this.defaultAction.url);
                this.log({
                    action : 'open_url',
                    element : 'button'
                });
            },
            DoAction : function () {
                var doraemonId;

                switch (this.type) {
                case 'INSTALL':

                    if (this.data.appType === 'GAME') {
                        doraemonId = '223';
                    } else {
                        doraemonId = '18';
                    }

                    if (this.defaultAction.type === 'OPEN_URL') {
                        this.openDoraemon(doraemonId + '-' + this.defaultAction.url);
                    }
                    break;
                case 'OPEN_URL':
                    this.openUrl(this.defaultAction.url);
                    break;
                }
            },
            clickIcon : function () {
                this.DoAction();
                this.log({
                    action : this.type.toLowerCase(),
                    element : 'icon'
                });
            },
            clickButtonNavigate : function () {
                this.DoAction();
                this.log({
                    action : this.type.toLowerCase(),
                    element : 'title'
                });
            },
            events : {
                'click .install' : 'clickButtonInstall',
                'click .open_url' : 'clickButtonOpenUrl',
                'click .button-navigate' : 'clickButtonNavigate',
                'click .icon' : 'clickIcon'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new BannerCardView(args);
            }
        });

        return factory;
    });
}(this));
