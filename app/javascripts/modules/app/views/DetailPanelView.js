/*global define*/
(function (window) {
    'use strict';

    define([
        'backbone',
        'doT',
        'jquery',
        'underscore',
        'Log',
        'Device',
        'Configuration',
        'IOBackendDevice',
        'ui/TemplateFactory',
        'ui/AlertWindow',
        'ui/ImageLoader',
        'Internationalization',
        'FunctionSwitch',
        'utilities/StringUtil',
        'task/TaskService',
        'app/collections/AppsCollection',
        'app/collections/WebAppsCollection',
        'app/views/CommentaryView',
        'app/views/RecommendView',
        'app/AppService',
        'browser/views/BrowserModuleView',
        'task/collections/TasksCollection'
    ], function (
        Backbone,
        doT,
        $,
        _,
        log,
        Device,
        CONFIG,
        IO,
        TemplateFactory,
        AlertWindow,
        imageLoader,
        i18n,
        FunctionSwitch,
        StringUtil,
        TaskService,
        AppsCollection,
        WebAppsCollection,
        CommentaryView,
        RecommendView,
        AppService,
        BrowserModuleView,
        TasksCollection
    ) {
        console.log('DetailPanelView - File loaded.');

        var alert = window.alert;
        var confirm = window.confirm;
        var setTimeout = window.setTimeout;

        var appsCollection;
        var webAppsCollection;

        var DetailPanelView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('app', 'detail-panel')),
            className : 'w-app-detail-panel',
            initialize : function () {
                var updatingHandler = function (model, isUpdating) {
                    var $updateButton = model.get('isWeb') ? this.$('.app-info .button-install') : this.$('.app-info .button-update');
                    if (isUpdating) {
                        $updateButton.html(model.get('isWeb') ? i18n.app.INSTALLING : i18n.app.UPDATING)
                            .prop({
                                disabled : true
                            });
                    } else {
                        $updateButton.html(model.get('isWeb') ? i18n.app.INSTALL : i18n.app.UPDATE)
                            .prop({
                                disabled : false
                            });
                    }
                };

                Object.defineProperties(this, {
                    updatingHandler : {
                        get : function () {
                            return updatingHandler;
                        }
                    }
                });

                appsCollection = AppsCollection.getInstance();
                webAppsCollection = WebAppsCollection.getInstance();

                this.listenTo(appsCollection, 'refresh', function (appsCollection) {
                    var newApp = appsCollection.get(this.model.id);
                    if (newApp) {
                        this.model.set('base_info', newApp.get('base_info'));
                    }
                }).listenTo(Device, 'change', this.setButtonState)
                    .listenTo(FunctionSwitch, 'change', this.setButtonState);

                IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.TASK_STATUS_CHANGE
                }, function (data) {
                    if (data.message === 'INSTALL_SUCCESS') {
                        var package_name = TasksCollection.getInstance().get(data.id).get('detail');
                        if (this.model.get('base_info').package_name === package_name) {
                            this.$('.button-update').hide();
                        }
                    }
                }, this);
            },
            setButtonState : function () {
                this.$('.button-update, .latest-version, .button-navigate-to-version').toggle(FunctionSwitch.ENABLE_APP_UPGRADE);

                this.$('.button-uninstall').prop('disabled', !Device.get('isConnected'));

                this.$('.button-move-to-device').toggle(
                    !(!Device.get('isConnected') ||
                    Device.get('isMounted') ||
                    !Device.get('hasSDCard') ||
                    Device.get('hasEmulatedSD') ||
                    appsCollection.ableMoveToDevice([this.model.id]).length === 0)
                );

                this.$('.button-move-to-sd-card').toggle(
                    !(!Device.get('isConnected') ||
                    Device.get('isMounted') ||
                    !Device.get('hasSDCard') ||
                    Device.get("hasEmulatedSD") ||
                    appsCollection.ableMoveToSD([this.model.id]).length === 0)
                );

                var $updateButton = this.model.get('isWeb') ? this.$('.app-info .button-install') : this.$('.app-info .button-update');
                if (this.model.get('isWeb')) {
                    $updateButton.toggle(!Device.get('isInternet'));
                } else {
                    $updateButton.toggle(this.model.isUpdatable && FunctionSwitch.ENABLE_APP_UPGRADE);
                }
            },
            render : function () {
                var $parent = this.$el.parent();

                if ($parent[0]) {
                    this.$el.detach();
                }

                this.$el.html(this.template(this.model.toJSON()));

                if (!this.model.isSystem && FunctionSwitch.ENABLE_APP_COMMENT &&
                        this.model.get('detail_page_info') && !this.model.get('isWeb')) {
                    if (this.commentaryView) {
                        this.commentaryView.remove();
                    }
                    this.commentaryView = CommentaryView.getInstance({
                        model : this.model
                    });

                    this.$el.append(this.commentaryView.render().$el);
                }

                if (this.model.get('isUpdating')) {
                    var $updateButton = this.model.get('isWeb') ? this.$('.app-info .button-install') : this.$('.app-info .button-update');
                    $updateButton.html(this.model.get('isWeb') ? i18n.app.INSTALLING : i18n.app.UPDATING).prop({
                        disabled : true
                    });
                } else {
                    this.$('.button-update').toggleClass('illegal', !this.model.isLegalToUpdate);
                }

                if (FunctionSwitch.ENABLE_APP_RECOMMEND) {
                    if (this.recommendView) {
                        this.recommendView.remove();
                    }

                    this.recommendView = RecommendView.getInstance({
                        model : this.model
                    });

                    this.$el.append(this.recommendView.render().$el);
                }

                setTimeout(this.setButtonState.bind(this));

                this.renderIcon();

                if ($parent[0]) {
                    $parent.append(this.$el);
                }

                return this;
            },
            renderIcon : function () {
                var iconURL = this.model.get('base_info').icon48 || this.model.get('base_info').icon;
                if (iconURL && !/^file:\/\/\//.test(iconURL)) {
                    imageLoader(iconURL, this.$('.app-info .icon'), true);
                }
            },
            update : function (id) {
                if (!(this.model && id === this.model.id)) {
                    if (this.model) {
                        this.model.off('change:isUpdating', this.updatingHandler)
                            .off('change:base_info', this.render)
                            .off('change:isWeb', this.render, this);
                    }

                    this.model = appsCollection.get(id) || webAppsCollection.get(id);

                    if (this.model.get('isWeb')) {
                        var currentId = this.model.id;
                        this.model.queryAppInfoAsync().done(function () {
                            if (currentId === this.model.id) {
                                this.render();
                            }
                        }.bind(this));
                    } else {
                        this.render();
                    }

                    this.model.on('change:isUpdating', this.updatingHandler, this)
                        .on('change:base_info', this.render, this)
                        .on('change:isWeb', this.render, this);
                }
            },
            clickButtonTogglePermisson : function () {
                var $target = this.$('.permission-list.unimportant');
                var $button = this.$('.button-toggle-permission .link');
                var $arrow = this.$('.arrow');
                if ($target.hasClass('expend')) {
                    $target.removeClass('expend').slideUp('fast');
                    $button.text(i18n.app.MORE);
                    $arrow.css({
                        '-webkit-transform' : 'rotate(90deg)'
                    });
                } else {
                    $target.addClass('expend').slideDown('fast');
                    $button.text(i18n.misc.COLLAPSE);
                    $arrow.css({
                        '-webkit-transform' : 'rotate(-90deg)'
                    });
                }
            },
            clickButtonUpdate : function () {
                var updateModel = this.model.updateInfo.clone().set({
                    source : 'update-button-detail-panel'
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
                    if (!this.model.isSystem) {
                        alertText = $(StringUtil.format(i18n.app.ALERT_TIP_UPDATE_ILLEGAL, baseInfo.name));
                    } else {
                        if (Device.isRoot) {
                            alertText = $(StringUtil.format(i18n.app.ALERT_TIP_UPDATE_ILLEGAL, baseInfo.name));
                        } else {
                            alertText = $(StringUtil.format(i18n.app.ALERT_TIP_UPDATE_ILLEGAL_SYSTEM_UNROOT, baseInfo.name));
                        }
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
                    'source' : 'detail'
                });
            },
            clickButtonUninstall : function () {
                var model = this.model;
                var baseInfo = model.get('base_info');

                if (baseInfo.is_critical_app) {
                    alert(StringUtil.format(i18n.app.ALERT_TIP_CRITICAL_APP, baseInfo.name));
                } else {
                    var disposableAlert = new AlertWindow({
                        draggable : true,
                        disposableName : 'app-uninstall-app-in-detail-panel',
                        buttonSet : 'yes_no',
                        $bodyContent : model.isSystem ? i18n.app.CONFIRM_UNINSTALL_SYSTEM_APP : i18n.app.CONFIRM_UNINSTALL
                    });

                    disposableAlert.once('button_yes', function () {
                        model.uninstallAsync().done(function (resp) {
                            if ((Device.get('isWifi') || Device.get('isInternet')) && !model.isSystem) {
                                alert(i18n.app.ALERT_TIP_UNINSTALL_WIFI_CONFIRM);
                            }

                            var failed = resp.body.failed;
                            if (failed && failed.length > 0) {
                                if (failed[0].item === this.model.id) {
                                    alert(model.isSystem ? i18n.app.UNINSTALL_FAILED + i18n.app.UNINSTALL_FAILED_SYSTEM_APP : i18n.app.UNINSTALL_FAILED);
                                }
                            } else {
                                if (resp.body.success[0].item === this.model.id) {
                                    this.trigger('hide');
                                }
                            }
                        }.bind(this)).fail(function () {
                            alert(model.isSystem ? i18n.app.UNINSTALL_FAILED + i18n.app.UNINSTALL_FAILED_SYSTEM_APP : i18n.app.UNINSTALL_FAILED);
                        }.bind(this));

                        this.$('.button-uninstall').prop({
                            disabled : true
                        });
                    }, this);

                    disposableAlert.show();
                }

                log({
                    'event' : 'ui.click.app.button.uninstall',
                    'source' : 'detail'
                });
            },
            clickButtonNavigateToDetail : function () {
                BrowserModuleView.navigate(this.model.get('detail_page_info'));
            },
            clickButtonMoveToSDCard : function () {
                AppService.batchMoveToSDCardAsync([this.model.id]);
            },
            clickButtonMoveToDevice : function () {
                AppService.batchMoveToDeviceAsync([this.model.id]);
            },
            clickButtonNavigateToCategory : function (evt) {
                var basePath = 'http://apps.wandoujia.com/tag/{1}?pos=client/detail-panel';
                BrowserModuleView.navigate(StringUtil.format(basePath, $(evt.currentTarget).data('cate')));
            },
            clickButtonNavigateToVersion : function () {
                var basePath = 'http://apps.wandoujia.com/apps/{1}/versions?pos=client/detail-panel';
                BrowserModuleView.navigate(StringUtil.format(basePath, this.model.get('base_info').package_name));
            },
            clickButtonInstall : function () {
                var model = new Backbone.Model(_.extend(this.model.get('downloadInfo'), {
                    source : 'detail-panel-web-app'
                }));

                TaskService.addTask(CONFIG.enums.TASK_TYPE_INSTALL, CONFIG.enums.MODEL_TYPE_APPLICATION, model);

                this.model.set({
                    isUpdating : true
                });

                this.model.unignoreUpdateAsync();

                log({
                    'event' : 'ui.click.app.button.install',
                    'source' : 'detail-panel'
                });
            },
            events : {
                'click .button-toggle-permission' : 'clickButtonTogglePermisson',
                'click .button-update' : 'clickButtonUpdate',
                'click .button-uninstall' : 'clickButtonUninstall',
                'click .button-install' : 'clickButtonInstall',
                'click .button-navigate-to-detail' : 'clickButtonNavigateToDetail',
                'click .button-move-to-sd-card' : 'clickButtonMoveToSDCard',
                'click .button-move-to-device' : 'clickButtonMoveToDevice',
                'click .button-navigate-to-category' : 'clickButtonNavigateToCategory',
                'click .button-navigate-to-version' : 'clickButtonNavigateToVersion'
            }
        });

        var detailPanelView;

        var factory = _.extend({
            getInstance : function () {
                if (!detailPanelView) {
                    detailPanelView = new DetailPanelView();
                }
                return detailPanelView;
            }
        });

        return factory;
    });
}(this));
