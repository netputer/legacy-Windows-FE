/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'ui/TemplateFactory',
        'ui/AlertWindow',
        'ui/BaseListItem',
        'ui/ImageLoader',
        'Configuration',
        'Device',
        'utilities/StringUtil',
        'Log',
        'Internationalization',
        'FunctionSwitch',
        'task/TaskService',
        'app/views/ChangeLogView',
        'task/collections/TasksCollection',
        'app/collections/AppsCollection',
        'app/collections/WebAppsCollection'
    ], function (
        Backbone,
        _,
        doT,
        $,
        TemplateFactory,
        AlertWindow,
        BaseListItem,
        imageLoader,
        CONFIG,
        Device,
        StringUtil,
        log,
        i18n,
        FunctionSwitch,
        TaskService,
        ChangeLogView,
        TasksCollection,
        AppsCollection,
        WebAppsCollection
    ) {
        console.log('AppItemView - File loaded.');

        var confirm = window.confirm;

        var tasksCollection;

        var AppItemView = BaseListItem.extend({
            template : doT.template(TemplateFactory.get('app', 'app-list-item')),
            className : 'w-app-list-item hbox',
            initialize : function () {
                AppItemView.__super__.initialize.apply(this, arguments);

                tasksCollection = tasksCollection || TasksCollection.getInstance();
                this.listenTo(FunctionSwitch, 'change', this.render);
            },
            uninstall : function () {
                if (this.changeLogView) {
                    this.changeLogView.remove();
                    this.changeLogView = undefined;
                }
            },
            remove : function () {
                this.uninstall();
                AppItemView.__super__.remove.call(this);
            },
            render : function () {
                if (this.model.get('updateCategory')) {
                    this.$el.toggleClass('category', true).html(this.template(this.model.toJSON()));
                    return this;
                }

                var $checker = this.$('.item-checker');
                var checked = $checker.length > 0 ? $checker[0].checked : false;

                this.$el.toggleClass('category', false).html(this.template(this.model.toJSON()));

                this.$('.item-checker').prop({
                    checked : checked
                });

                this.renderUpdateColumn();

                this.renderIcon();

                if (this.model.get('running')) {
                    this.$el.append(TemplateFactory.get('ui', 'loading-horizental'));
                }

                return this;
            },
            renderUpdateColumn : function () {
                this.uninstall();

                if (FunctionSwitch.ENABLE_APP_UPGRADE && StringUtil.isURL(this.model.get('upgrade_info').downloadUrl)) {
                    if (!this.model.get('isUpdating')) {
                        this.$('.button-update').toggleClass('illegal', !this.model.isLegalToUpdate);

                        this.changeLogView = ChangeLogView.getInstance({
                            $host : this.$('.button-update'),
                            model : this.model
                        });
                    } else {
                        var task = tasksCollection.getTaskByPackageName(this.model.id);
                        if (task !== undefined) {
                            if (task.get('type') === CONFIG.enums.TASK_TYPE_PUSH) {
                                this.$('progress').addClass('running');
                            } else if (task.get('type') === CONFIG.enums.TASK_TYPE_INSTALL) {
                                this.$('progress').addClass('running').attr({
                                    value : 100
                                });
                            }
                        }
                    }
                }
            },
            renderIcon : function () {
                var iconURL = this.model.get('base_info').icon;
                if (iconURL && !/^file:\/\/\//.test(iconURL)) {
                    imageLoader(iconURL, this.$('.icon'));
                }
            },
            clickButtonUpdate : function (evt) {
                evt.stopPropagation();

                var $currentButton = $(evt.currentTarget);

                if ($currentButton.data('type') === undefined) {
                    var updateModel = this.model.updateInfo.clone().set({
                        source : 'update-button-list'
                    }, {
                        silent : true
                    });

                    var updateApp = function (model) {
                        TaskService.addTask(CONFIG.enums.TASK_TYPE_INSTALL, CONFIG.enums.MODEL_TYPE_APPLICATION, model);

                        this.model.set({
                            isUpdating : true
                        }).unignoreUpdateAsync();
                    };

                    if (!this.model.isLegalToUpdate) {
                        var baseInfo = this.model.get('base_info');

                        var alertText;
                        if (this.model.isSystem && !Device.isRoot) {
                            alertText = StringUtil.format(i18n.app.ALERT_TIP_UPDATE_ILLEGAL_SYSTEM_UNROOT, baseInfo.name);
                        } else if (!!this.model.get('upgrade_info').notRecommendReason) {
                            alertText = StringUtil.format(i18n.app.ALERT_TIP_UPDATE_NOT_RECOMMENDED, this.model.get('upgrade_info').notRecommendReason.description);
                        } else {
                            alertText = StringUtil.format(i18n.app.ALERT_TIP_UPDATE_ILLEGAL, baseInfo.name);
                        }

                        confirm(alertText, function () {
                            updateApp.call(this, updateModel.set({
                                force : true
                            }, {
                                silent : true
                            }));

                            log({
                                'event' : 'ui.click.app.illegal.update'
                            });
                        }, this);
                    } else {
                        updateApp.call(this, updateModel);
                    }

                    log({
                        'event' : 'ui.click.app.button.update',
                        'source' : 'list'
                    });
                } else {
                    var models = AppsCollection.getInstance().getUpdatableAppsByType($currentButton.data('type'));

                    confirm(StringUtil.format(i18n.app.UPGRADE_TIP_TEXT, models.length), function () {
                        Backbone.trigger('app:selectApps', _.pluck(models, 'id'));

                        var updateApps = _.map(models, function (model) {
                            model.set({
                                isUpdating : true
                            }).unignoreUpdateAsync();

                            var currentUpdateModel = model.get('upgrade_info');

                            return {
                                downloadUrl : currentUpdateModel.downloadUrl,
                                title : currentUpdateModel.title,
                                iconSrc : currentUpdateModel.iconPath,
                                versionName : currentUpdateModel.versionName,
                                versionCode : currentUpdateModel.versionCode,
                                size : currentUpdateModel.size,
                                packageName : currentUpdateModel.packageName
                            };
                        }, this);

                        TaskService.batchDownloadAsync(updateApps, 'update-button-recommended');

                        log({
                            'event' : 'ui.click.app.button.recommended_update'
                        });
                    });
                }
            },
            clickButtonIgnore : function (evt) {
                evt.stopPropagation();

                var disposableAlert = new AlertWindow({
                    draggable : true,
                    disposableName : 'app-ignore-update',
                    disposableChecked : true,
                    buttonSet : 'yes_no',
                    $bodyContent : i18n.app.ALERT_TIP_IGNORED_UPDATE_CONFIRM,
                    width : 360
                });

                disposableAlert.once('button_yes', function () {
                    this.model.ignoreUpdateAsync();
                }, this).show();
            },
            clickButtonUnignore : function (evt) {
                evt.stopPropagation();
                this.model.unignoreUpdateAsync();
            },
            clickButtonCancel : function (evt) {
                evt.stopPropagation();
                var task = tasksCollection.getTaskByPackageName(this.model.id);
                if (task !== undefined) {
                    task.deleteTaskAsync();
                }
            },
            clickButtonInstall : function (evt) {
                evt.stopPropagation();

                var model = new Backbone.Model(_.extend(this.model.get('downloadInfo'), {
                    source : 'app-list-web-app'
                }));

                TaskService.addTask(CONFIG.enums.TASK_TYPE_INSTALL, CONFIG.enums.MODEL_TYPE_APPLICATION, model);

                this.model.set({
                    isUpdating : true
                }).unignoreUpdateAsync();

                log({
                    'event' : 'ui.click.app.button.install',
                    'source' : 'list',
                    'tab' : window.SnapPea.CurrentTab
                });
            },
            clickButtonHide : function (evt) {
                evt.stopPropagation();

                var originalApp = this.model;

                this.model.hideWebAppAsync().done(function () {
                    // Show confirm to ask user if we should uninstall the app
                    if (!originalApp.get('isWeb') && Device.get('isConnected')) {
                        confirm(StringUtil.format(i18n.app.UNINSTALL_AFTER_HIDE, this.model.get('base_info').name), function () {
                            originalApp.uninstallAsync();
                        });
                    }

                    var webAppsCollection = WebAppsCollection.getInstance();
                    webAppsCollection.remove(originalApp);
                    webAppsCollection.trigger('refresh', webAppsCollection);
                }.bind(this)).fail(function () {
                    if (originalApp.id === this.model.id) {
                        var $button = this.$('.button-hide');
                        $button.html(i18n.app.WEB_APPS_HIDE_FAILED_TEXT).removeClass('link button-hide').addClass('text-warning failed-text');

                        setTimeout(function () {
                            $button.html(i18n.app.WEB_APPS_HIDE_TEXT).addClass('link button-hide').removeClass('text-warning failed-text');
                        }, 3000);
                    }
                }.bind(this));

                log({
                    'event' : 'ui.click.app_button_hide'
                });
            },
            rightClickItem : function (evt) {
                if ($(evt.currentTarget).hasClass('category')) {
                    evt.stopPropagation();
                }
            },
            events : {
                'contextmenu' : 'rightClickItem',
                'click .button-update' : 'clickButtonUpdate',
                'click .button-ignore' : 'clickButtonIgnore',
                'click .button-unignore' : 'clickButtonUnignore',
                'click .button-cancel' : 'clickButtonCancel',
                'click .button-install' : 'clickButtonInstall',
                'click .button-hide' : 'clickButtonHide'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new AppItemView(args);
            },
            getClass : function () {
                return AppItemView;
            }
        });

        return factory;
    });
}(this));
