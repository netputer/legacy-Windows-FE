/*global define*/
(function (window) {
    'use strict';

    define([
        'underscore',
        'jquery',
        'ui/Menu',
        'ui/behavior/ClickToHideMixin',
        'ui/AlertWindow',
        'utilities/StringUtil',
        'Internationalization',
        'Device',
        'Configuration',
        'Log',
        'FunctionSwitch',
        'app/collections/AppsCollection',
        'app/AppService',
        'task/TaskService'
    ], function (
        _,
        $,
        Menu,
        ClickToHideMixin,
        AlertWindow,
        StringUtil,
        i18n,
        Device,
        CONFIG,
        log,
        FunctionSwitch,
        AppsCollection,
        AppService,
        TaskService
    ) {
        console.log('AppContextMenu - File loaded. ');

        var confirm = window.confirm;

        var appsCollection;

        var updateApp = function (id) {
            var model = appsCollection.get(id);
            var updateModel = model.updateInfo.clone().set({
                source : 'update-button-list-context-menu'
            });

            TaskService.addTask(CONFIG.enums.TASK_TYPE_INSTALL, CONFIG.enums.MODEL_TYPE_APPLICATION, updateModel);

            model.set({
                isUpdating : true
            }).unignoreUpdateAsync();
        };

        var selectHandler = function (data) {
            switch (data.value) {
            case 'update':
                this.updateApp();
                break;
            case 'uninstall':
                this.uninstallApp();
                break;
            case 'export':
                this.exportApp();
                break;
            case 'move-to-sd':
                this.moveToSDCard();
                break;
            case 'move-to-device':
                this.moveToDevice();
                break;
            }
        };

        var AppContextMenu = Menu.extend({
            initialize : function () {
                AppContextMenu.__super__.initialize.apply(this, arguments);
                ClickToHideMixin.mixin(this);

                appsCollection = appsCollection || AppsCollection.getInstance();

                this.addItems();

                this.on('select', selectHandler, this);
            },
            exportApp : function () {
                AppService.batchExportAppsAsync(this.options.selected);

                log({
                    'event' : 'ui.click.app.button.export',
                    'source' : 'context-menu'
                });
            },
            moveToSDCard : function () {
                AppService.batchMoveToSDCardAsync(this.options.selected);

                log({
                    'event' : 'ui.click.app.button.move.to.sd',
                    'source' : 'context-menu'
                });
            },
            moveToDevice : function () {
                AppService.batchMoveToDeviceAsync(this.options.selected);

                log({
                    'event' : 'ui.click.app.button.move.to.device',
                    'source' : 'context-menu'
                });
            },
            uninstallApp : function () {
                AppService.batchUninstallAsync(this.options.selected);

                log({
                    'event' : 'ui.click.app.button.uninstall',
                    'source' : 'context-menu'
                });
            },
            updateApp : function () {
                var selected = this.options.selected;

                var updateApps = function () {
                    var ids = (window.SnapPea.CurrentModule === 'app' && window.SnapPea.CurrentTab === 'ignore') ? appsCollection.ableToUpdateIncludeIgnored(selected) : appsCollection.ableToUpdate(selected);

                    _.each(ids, updateApp);

                    log({
                        'event' : 'ui.app.click.button.update',
                        'source' : 'context-menu'
                    });
                };

                confirm(StringUtil.format(i18n.app.UPGRADE_TIP_TEXT, selected.length), updateApps);
            },
            addItems : function () {
                var selected = this.options.selected;
                var isWebAppTab = window.SnapPea.CurrentModule === 'app' && window.SnapPea.CurrentTab === 'web';
                var items = [{
                    type : 'normal',
                    name : 'update',
                    value : 'update',
                    label : i18n.app.UPDATE,
                    disabled : selected.length === 0 ||
                                appsCollection.ableToUpdate(selected).length === 0 ||
                                isWebAppTab
                }, {
                    type : 'normal',
                    name : 'uninstall',
                    value : 'uninstall',
                    label : i18n.app.UNINSTALL,
                    disabled : !Device.get('isConnected') ||
                                selected.length === 0 ||
                                (appsCollection.isSystemApp(selected).length === 0 ? false : !Device.get('isRoot')) ||
                                isWebAppTab
                }, {
                    type : 'normal',
                    name : 'export',
                    value : 'export',
                    label : i18n.misc.EXPORT,
                    disabled : !Device.get('isConnected') ||
                                isWebAppTab
                }, {
                    type : 'hr'
                }, {
                    type : 'normal',
                    name : 'move-to-sd',
                    value : 'move-to-sd',
                    label : i18n.app.BUTTON_TRANSFER_LABEL,
                    disabled : !Device.get('isConnected') ||
                                Device.get('isMounted') ||
                                !Device.get('hasSDCard') ||
                                Device.get("hasEmulatedSD") ||
                                appsCollection.ableMoveToSD(this.options.selected).length === 0 ||
                                isWebAppTab
                }, {
                    type : 'normal',
                    name : 'move-to-device',
                    value : 'move-to-device',
                    label : i18n.app.BUTTON_MOVE_TO_DEVICE_LABEL,
                    disabled : !Device.get('isConnected') ||
                                Device.get('isMounted') ||
                                !Device.get('hasSDCard') ||
                                Device.get('hasEmulatedSD') ||
                                appsCollection.ableMoveToDevice(this.options.selected).length === 0 ||
                                isWebAppTab
                }];

                if (!FunctionSwitch.ENABLE_APP_UPGRADE) {
                    items.splice(0, 1);
                }

                this.items = items;
            }
        });

        var appContextMenu;

        var factory = _.extend({
            getInstance : function (args) {
                if (!appContextMenu) {
                    appContextMenu = new AppContextMenu(args);
                } else {
                    appContextMenu.options.selected = args.selected;
                    appContextMenu.addItems();
                    appContextMenu.render();
                }
                return appContextMenu;
            }
        });

        return factory;
    });
}(this));
