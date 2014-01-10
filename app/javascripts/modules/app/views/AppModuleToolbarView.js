/*global define*/
(function (window, document) {
    'use strict';

    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'ui/TemplateFactory',
        'ui/Toolbar',
        'utilities/StringUtil',
        'Internationalization',
        'FunctionSwitch',
        'Configuration',
        'Device',
        'Settings',
        'Log',
        'Account',
        'app/views/AppListView',
        'app/views/AppPanelView',
        'app/views/LocalInstallWindowView',
        'social/views/QuickShareView',
        'app/collections/AppsCollection',
        'app/AppService',
        'task/TaskService'
    ], function (
        Backbone,
        _,
        doT,
        $,
        TemplateFactory,
        Toolbar,
        StringUtil,
        i18n,
        FunctionSwitch,
        CONFIG,
        Device,
        Settings,
        log,
        Account,
        AppListView,
        AppPanelView,
        LocalInstallWindowView,
        QuickShareView,
        AppsCollection,
        AppService,
        TaskService
    ) {
        console.log('AppModuleToolbarView - File loaded.');

        var confirm = window.confirm;

        var appListView;
        var appsCollection;

        var AppModuleToolbarView = Toolbar.extend({
            template : doT.template(TemplateFactory.get('app', 'toolbar')),
            initialize : function () {
                appsCollection = AppsCollection.getInstance();

                this.listenTo(Device, 'change', this.setButtonState)
                    .listenTo(FunctionSwitch, 'change', this.setButtonState)
                    .listenTo(appsCollection, 'refresh', this.setButtonState);
            },
            setButtonState : function () {
                var selected = appListView.selected;

                var currentSet = appListView.list ? appListView.list.currentSet.name : '';

                this.$('.button-uninstall').prop({
                    disabled : !Device.get('isConnected') ||
                                selected.length === 0 ||
                                (appsCollection.isSystemApp(selected).length === 0 ? false : !Device.get('isRoot')) ||
                                currentSet === 'web'
                });

                this.$('.button-update').prop({
                    disabled : selected.length === 0 ||
                                ((window.SnapPea.CurrentModule === 'app' && window.SnapPea.CurrentTab === 'ignore') ?
                                    appsCollection.ableToUpdateIncludeIgnored(selected).length === 0 : appsCollection.ableToUpdate(selected).length === 0) ||
                                currentSet === 'web'
                }).toggle(Boolean(FunctionSwitch.ENABLE_APP_UPGRADE));

                this.$('.button-export').prop({
                    disabled : !Device.get('isConnected') || selected.length === 0 ||
                                currentSet === 'web'
                });

                this.$('.button-move-to-device').prop({
                    disabled : !Device.get('isConnected') ||
                                Device.get('isMounted') ||
                                !Device.get('hasSDCard') ||
                                Device.get('hasEmulatedSD') ||
                                selected.length === 0 ||
                                appsCollection.ableMoveToDevice(selected).length === 0 ||
                                currentSet === 'web'
                });

                this.$('.button-move-to-sd-card').prop({
                    disabled : !Device.get('isConnected') ||
                                Device.get('isMounted') ||
                                !Device.get('hasSDCard') ||
                                Device.get("hasEmulatedSD") ||
                                selected.length === 0 ||
                                appsCollection.ableMoveToSD(selected).length === 0 ||
                                currentSet === 'web'
                });
            },
            render : function () {
                this.$el.html(this.template({}));

                appListView = AppListView.getInstance({
                    $observer : this.$('.check-select-all')
                });

                this.listenTo(appListView, 'select:change', this.setButtonState);

                this.setButtonState();

                return this;
            },
            clickButtonInstall : function () {
                LocalInstallWindowView.getInstance().show();

                log({
                    'event' : 'ui.click.app.button.local.install',
                    'source' : 'toolbar'
                });
            },
            clickButtonUninstall : function () {
                var app;
                if (appListView.selected.length === 1) {
                    app = appsCollection.get(appListView.selected[0]);
                }
                AppService.batchUninstallAsync(appListView.selected).done(function (resp) {
                    var failed = resp.body.failed;
                    if (app !== undefined && !failed.length) {
                        if (FunctionSwitch.ENABLE_SHARE_UNINSTALL) {
                            QuickShareView.getInstance({
                                model : app
                            }).show();
                        }
                    }
                });

                log({
                    'event' : 'ui.click.app.button.uninstall',
                    'source' : 'toolbar'
                });
            },
            clickButtonUpdate : function () {
                var selected = appListView.selected;

                var updateApps = function () {
                    var ids = (window.SnapPea.CurrentModule === 'app' && window.SnapPea.CurrentTab === 'ignore') ? appsCollection.ableToUpdateIncludeIgnored(selected) : appsCollection.ableToUpdate(selected);

                    var updateApp = function (id) {
                        var model = appsCollection.get(id);
                        var updateModel = model.updateInfo.set({
                            source : 'toolbar-update-button'
                        });

                        TaskService.addTask(CONFIG.enums.TASK_TYPE_INSTALL, CONFIG.enums.MODEL_TYPE_APPLICATION, updateModel);

                        model.set({
                            isUpdating : true
                        });

                        model.unignoreUpdateAsync();
                    };

                    _.each(ids, updateApp);

                    log({
                        'event' : 'ui.app.click.button.update',
                        'source' : 'toolbar'
                    });
                };

                confirm(StringUtil.format(i18n.app.UPGRADE_TIP_TEXT, selected.length), updateApps);
            },
            clickButtonExport : function () {
                AppService.batchExportAppsAsync(appListView.selected);

                log({
                    'event' : 'ui.click.app.button.export',
                    'source' : 'toolbar'
                });
            },
            clickButtonMoveToSDCard : function () {
                AppService.batchMoveToSDCardAsync(appListView.selected);

                log({
                    'event' : 'ui.click.app.button.move.to.sd',
                    'source' : 'toolbar'
                });
            },
            clickButtonMoveToDevice : function () {
                AppService.batchMoveToDeviceAsync(appListView.selected);

                log({
                    'event' : 'ui.click.app.button.move.to.device',
                    'source' : 'toolbar'
                });
            },
            events : {
                'click .button-install' : 'clickButtonInstall',
                'click .button-uninstall' : 'clickButtonUninstall',
                'click .button-update' : 'clickButtonUpdate',
                'click .button-export' : 'clickButtonExport',
                'click .button-move-to-sd-card' : 'clickButtonMoveToSDCard',
                'click .button-move-to-device' : 'clickButtonMoveToDevice'
            }
        });

        var appModuleToolbarView;

        var factory = _.extend({
            getInstance : function () {
                if (!appModuleToolbarView) {
                    appModuleToolbarView = new AppModuleToolbarView();
                }
                return appModuleToolbarView;
            }
        });

        return factory;
    });
}(this, this.document));
