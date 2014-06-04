/*global define*/
(function (window) {
    define([
        'backbone',
        'doT',
        'jquery',
        'underscore',
        'Log',
        'ui/Panel',
        'ui/TemplateFactory',
        'ui/AlertWindow',
        'ui/SmartList',
        'utilities/StringUtil',
        'IO',
        'Configuration',
        'FunctionSwitch',
        'Internationalization',
        'app/AppService',
        'app/views/AppItemView',
        'app/models/AppModel',
        'task/TaskService'
    ], function (
        Backbone,
        doT,
        $,
        _,
        log,
        Panel,
        TemplateFactory,
        AlertWindow,
        SmartList,
        StringUtil,
        IO,
        CONFIG,
        FunctionSwitch,
        i18n,
        AppService,
        AppItemView,
        AppModel,
        TaskService
    ) {
        console.log('LocalInstallWindowView - File loaded.');

        var alert = window.alert;

        var appList;
        var footerMonitorView;

        var FooterMonitorView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('app', 'local-install-monitor')),
            tagName : 'label',
            className : 'w-app-local-install-footer',
            render : function () {
                this.$el.html(this.template({}));
                return this;
            }
        });

        var alertWindow;

        var BodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('app', 'local-install-body')),
            className : 'w-app-local-install vbox',
            initialize : function () {
                this.collection = new Backbone.Collection();

                alertWindow = alertWindow || new AlertWindow({
                    $bodyContent : i18n.app.ADDING_LOCAL_APK
                });
            },
            render : function () {
                this.$el.html(this.template({}));

                appList = new SmartList({
                    itemView : AppItemView.getClass(),
                    dataSet : [{
                        name : 'default',
                        getter : function () {
                            return [];
                        }
                    }],
                    keepSelect : false,
                    $observer : this.$('.check-select-all'),
                    $header : this.$('header'),
                    itemHeight : 45,
                    listenToCollection : this.collection,
                    emptyTip : i18n.app.APP_SELECT_GRID_TIP,
                    enableDragAndDrop : true
                });

                this.listenTo(appList, 'select:change', function () {
                    if (footerMonitorView !== undefined) {
                        this.$('.w-smart-list-footer').html(StringUtil.format(i18n.misc.SELECTOR_DESCRIPTION_TEXT, appList.selected.length, appList.currentModels.length));
                    }
                });

                this.listenTo(appList, 'drop', function (event) {
                    var files = _.filter(window.client.drag_files, function (file) {
                        return (/\.(wd)?apk$/).test(file);
                    });

                    if (files.length) {
                        AppService.selectAppsDetailAsync(files.join('|')).done(this.parseApps.bind(this));
                    }
                });

                this.$('.w-smart-list-header').after(appList.render().$el);
                appList.emptyTip = i18n.app.APP_SELECT_GRID_TIP;

                AppService.hasAutoBackupAsync().done(function (resp) {
                    if (FunctionSwitch.ENABLE_WDAPK && resp.body.value) {
                        appList.emptyTip += i18n.app.APP_SELECT_GRID_TIP_BACKUP;
                    }
                });

                this.$('.w-smart-list-footer').html(StringUtil.format(i18n.misc.SELECTOR_DESCRIPTION_TEXT, 0, 0));

                return this;
            },
            remove : function () {
                appList.remove();
                BodyView.__super__.remove.call(this);
            },
            parseApps : function (resp) {
                var newApps = [];
                var faildText = [];

                _.each(resp.body.app, function (app) {
                    if (app.package_name) {
                        newApps.push(new AppModel({
                            base_info : app,
                            upgrade_info : {},
                            id : app.package_name + app.version_code
                        }));
                    } else {
                        faildText.push(' - ' + app.name + '<br />');
                    }
                });

                if (faildText.length > 0) {
                    alert(i18n.app.APPS_INSTALL_FAILED + '<br />' + faildText.join(''));
                }

                var newAppIds = [];

                _.each(newApps, function (item) {
                    var app = this.collection.get(item.id);
                    if (app !== undefined) {
                        app.set(item.toJSON());
                    } else {
                        this.collection.add(item);
                    }
                    newAppIds.push(item.id);
                }, this);

                appList.switchSet('default', function () {
                    return this.collection.models;
                }.bind(this));
                appList.addSelect(newAppIds);
            },
            selectApps : function (type) {
                alertWindow.show();

                AppService.selectAppsAsync(type).done(this.parseApps.bind(this)).always(function () {
                    alertWindow.close();
                });
            },
            clickButtonAddFile : function () {
                this.selectApps(0);
            },
            clickButtonAddFolder : function () {
                this.selectApps(1);
            },
            clickButtonImportBackup : function () {
                alertWindow.show();

                AppService.loadAutoBackupAsync().done(this.parseApps.bind(this)).fail(function () {
                    appList.emptyTip = appList.emptyTip.replace(i18n.app.APP_SELECT_GRID_TIP_BACKUP, '');
                }).always(function () {
                    setTimeout(function () {
                        alertWindow.close();
                    }, 0);
                });

                log({
                    'event' : 'ui.click.app.button.auto.improt.backup'
                });
            },
            events : {
                'click .button-add-file' : 'clickButtonAddFile',
                'click .button-add-folder' : 'clickButtonAddFolder',
                'click .button-import-backup' : 'clickButtonImportBackup'
            }
        });

        var bodyView;

        var LocalInstallWindowView = Panel.extend({
            initialize : function () {
                LocalInstallWindowView.__super__.initialize.apply(this, arguments);

                this.buttons = [{
                    $button : $('<button>').addClass('primary').html(i18n.app.INSTALL),
                    eventName : 'button_install'
                }, {
                    $button : $('<button>').html(i18n.ui.CANCEL),
                    eventName : 'button_cancel'
                }];

                this.on('show', function () {
                    bodyView = new BodyView();

                    this.$bodyContent = bodyView.render().$el;

                    footerMonitorView = new FooterMonitorView();

                    this.$('.w-ui-window-footer-monitor').append(footerMonitorView.render().$el);

                    this.once('remove', function () {
                        bodyView.remove();
                        footerMonitorView.remove();
                    }, this);
                }, this);

                this.on('button_install', this.install, this);
            },
            install : function () {
                var deleteWhenFinish = this.$('.check-delete-when-finish')[0].checked;

                _.each(appList.selected, function (id) {
                    var app = bodyView.collection.get(id);
                    var baseInfo = app.get('base_info');
                    var data = _.extend(baseInfo, {
                        iconPath : baseInfo.icon,
                        title : baseInfo.name,
                        should_delete : deleteWhenFinish
                    });

                    TaskService.addTask(CONFIG.enums.TASK_TYPE_LOCAL_INSTALL, CONFIG.enums.MODEL_TYPE_APPLICATION, new Backbone.Model(data));
                });

                this.close();
            }
        });

        var localInstallWindowView;

        var factory = _.extend({
            getInstance : function () {
                if (!localInstallWindowView) {
                    localInstallWindowView = new LocalInstallWindowView({
                        title : i18n.app.BUTTON_ADD_APP_LABEL,
                        height : 480,
                        width : 630
                    });
                }
                return localInstallWindowView;
            }
        });

        return factory;
    });
}(this));
