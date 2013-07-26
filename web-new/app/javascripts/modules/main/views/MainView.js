/*global define*/
(function (window, document) {
    'use strict';

    define([
        'backbone',
        'doT',
        'jquery',
        'underscore',
        'ui/TemplateFactory',
        'ui/AlertWindow',
        'Configuration',
        'IOBackendDevice',
        'Internationalization',
        'Device',
        'Environment',
        'main/views/NavView',
        'task/views/TaskMonitorView',
        'task/views/TaskModuleView',
        'backuprestore/BackupController',
        'main/views/FastUSBNotificationView',
        'main/collections/PIMCollection'
    ], function (
        Backbone,
        doT,
        $,
        _,
        TemplateFactory,
        AlertWindow,
        CONFIG,
        IO,
        i18n,
        Device,
        Environment,
        NavView,
        TaskMonitorView,
        TaskModuleView,
        BackupController,
        FastUSBNotificationView,
        PIMCollection
    ) {
        console.log('Wandoujia 2.0 launched.');

        var alert = window.alert;

        var navigateHandler = function (msg) {
            switch (msg.type) {
            case CONFIG.enums.NAVIGATE_TYPE_MARKET:
                this.getModule('browser').navigate(msg.id);
                break;
            case CONFIG.enums.NAVIGATE_TYPE_GROUP_APP:
                this.getModule('app').navigateGroup(msg);
                break;
            case CONFIG.enums.NAVIGATE_TYPE_APP:
                this.getModule('app').navigate(msg);
                break;
            case CONFIG.enums.NAVIGATE_TYPE_GROUP_CONTACT:
                this.getModule('contact').navigateGroup(msg);
                break;
            case CONFIG.enums.NAVIGATE_TYPE_CONTACT:
                this.getModule('contact').navigate(msg);
                break;
            case CONFIG.enums.NAVIGATE_TYPE_GROUP_SMS:
                this.getModule('message').navigateGroup(msg);
                break;
            case CONFIG.enums.NAVIGATE_TYPE_SMS:
                this.getModule('message').navigate(msg);
                break;
            case CONFIG.enums.NAVIGATE_TYPE_SEND_SMS:
                this.getModule('message').sendMessage(msg.id);
                break;
            case CONFIG.enums.NAVIGATE_TYPE_PAGE:
                this.getModule('browser').navigate(msg.id, false);
                break;
            case CONFIG.enums.NAVIGATE_TYPE_CONTACT_CREATE:
                this.getModule('contact').createNew(msg.id);
                break;
            case CONFIG.enums.NAVIGATE_TYPE_WEBAPP:
                this.getModule('app').showWebAppView();
                break;
            case CONFIG.enums.NAVIGATE_TYPE_PHOTO_CLOUD:
                Backbone.trigger('switchModule', {
                    module : 'photo'
                });

                var handler = IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.CUSTOM_IFRAME_PHOTO_RENDERED
                }, function () {
                    IO.sendCustomEventsAsync(CONFIG.events.CUSTOM_IFRAME_PHOTO_SELECT_TAB, {
                        tab : 'cloud'
                    });
                    IO.Backend.Device.offmessage(handler);
                });
                break;
            case CONFIG.enums.NAVIGATE_TYPE_ILLEGAL_LOGOUT:
                alert(i18n.misc.ILLEGAL_LOGOUT);
                break;
            case CONFIG.enums.NAVIGATE_TYPE_GALLERY:
                this.getModule('browser').navigateToThirdParty(msg.id, msg.keyword);
                break;
            case CONFIG.enums.NAVIGATE_TYPE_IMPORT_MUSIC:
                this.getModule('music').showImport(msg.id);
                break;
            case CONFIG.enums.NAVIGATE_TYPE_IMPORT_IMAGE:
                this.getModule('photo').showImport(msg.id);
                break;
            case CONFIG.enums.NAVIGATE_TYPE_IMPORT_VIDEO:
                this.getModule('video').showImport(msg.id);
                break;
            case CONFIG.enums.NAVIGATE_TYPE_THEME:
                this.getModule('browser').navigateToThirdParty(218, '豌豆荚主题');
                break;
            case CONFIG.enums.NAVIGATE_TYPE_APP_WASH:
                this.getModule('app-wash').navigate();
                break;
            case CONFIG.enums.NAVIGATE_TYPE_BACKUP_CLOUD:
                if (Device.get('isConnected')) {
                    BackupController.start(true);
                } else {
                    alert(i18n.welcome.CONNECT_UR_PHONE);
                }
                break;
            case CONFIG.enums.NAVIGATE_TYPE_TASK_MANAGER:
                TaskMonitorView.getInstance().slideIn();
                break;
            case CONFIG.enums.NAVIGATE_TYPE_PIM_MODULE:
                var target = PIMCollection.getInstance().get(msg.id);
                target.set('selected', true);
                break;
            }
        };

        var MainView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('misc', 'main')),
            initialize : function () {
                var modules = {};
                var currentModule;
                var currentTab;
                Object.defineProperties(this, {
                    modules : {
                        get : function () {
                            return modules;
                        }
                    },
                    currentModule : {
                        set : function (value) {
                            currentModule = value;
                            window.SnapPea.CurrentModule = currentModule;
                        },
                        get : function () {
                            return currentModule;
                        }
                    },
                    currentTab : {
                        set : function (value) {
                            currentTab = value;
                            window.SnapPea.CurrentTab = currentTab;
                        },
                        get : function () {
                            return currentModule;
                        }
                    }
                });

                Backbone.on('switchModule', function (data) {
                    var module = data.module;
                    if (Environment.get('deviceId') !== 'Default' || module === 'doraemon' || module === 'browser' || module === 'gallery') {
                        this.showModule(module, data.tab);
                    } else {
                        this.showModule('welcome');
                    }

                    if (module === 'doraemon') {
                        NavView.getInstance().deselectAll();
                    }
                }, this);

                IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.WEB_NAVIGATE
                }, navigateHandler, this);

                IO.Backend.onmessage({
                    'data.channel' : CONFIG.events.WEB_FORCE_NAVIGATE
                }, navigateHandler, this);

                this.$el = $('body');
            },
            render : function () {
                $('body').append(this.template({}));

                var fragment = document.createDocumentFragment();
                fragment.appendChild(NavView.getInstance().render().$el[0]);
                fragment.appendChild($(doT.template(TemplateFactory.get('misc', 'shadow'))({}))[0]);
                fragment.appendChild(TaskMonitorView.getInstance().render().$el[0]);
                this.$('.sidebar').append(fragment);

                this.$('.module-ctn').append(FastUSBNotificationView.getInstance().render().$el);

                return this;
            },
            regModule : function (name, module) {
                this.modules[name] = module;

                if (module.enablePreload) {
                    module.preload();
                }
            },
            getModule : function (name) {
                return this.modules[name];
            },
            showModule : function (name, tab) {
                this.currentTab = tab;

                if (name === this.currentModule) {
                    return;
                }

                if (this.currentModule) {
                    this.hideModule(this.currentModule);
                }

                var moduleInstance = this.modules[name].getInstance(tab);
                var $moduleCtn = this.$('.module-ctn');
                if (moduleInstance.rendered) {
                    this.hideModule(name);
                    moduleInstance.$el.css({
                        visibility : 'visible',
                        opacity : 1
                    });
                } else {
                    var $last = $moduleCtn.children().last();

                    moduleInstance.$el.css({
                        visibility : 'visible',
                        opacity : 1
                    });

                    if ($last.length === 0) {
                        $moduleCtn.append(moduleInstance.render().$el);
                    } else {
                        $moduleCtn.children().last().before(moduleInstance.render().$el);
                    }
                }

                this.currentModule = name;
            },
            hideModule : function (name) {
                var moduleInstance = this.modules[name].getInstance();
                if (moduleInstance.rendered) {
                    moduleInstance.$el.css({
                        visibility : 'hidden',
                        opacity : 0
                    });
                }
            }
        });

        var mainView;

        var factory = _.extend({
            getInstance : function () {
                if (!mainView) {
                    mainView = new MainView();
                }
                return mainView;
            }
        });

        return factory;
    });
}(this, this.document));
