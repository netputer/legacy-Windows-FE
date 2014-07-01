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
        'ui/WindowState',
        'Configuration',
        'IOBackendDevice',
        'Internationalization',
        'Device',
        'Environment',
        'Settings',
        'WindowController',
        'main/views/NavView',
        'task/views/TaskMonitorView',
        'main/views/FastUSBNotificationView',
        'main/views/PimMaskView',
        'main/collections/PIMCollection',
        'main/views/AgentNotifiPopup',
        'main/views/AutoConnectionNotifiPopup',
        'app/AppService'
    ], function (
        Backbone,
        doT,
        $,
        _,
        TemplateFactory,
        AlertWindow,
        WindowState,
        CONFIG,
        IO,
        i18n,
        Device,
        Environment,
        Settings,
        WindowController,
        NavView,
        TaskMonitorView,
        FastUSBNotificationView,
        PimMaskView,
        PIMCollection,
        AgentNotifiPopup,
        AutoConnectionNotifiPopup,
        AppService
    ) {
        console.log('Wandoujia 2.0 launched.');

        var alert = window.alert;
        var navigator = window.navigator;

        var fastUSBNotificationView;
        var pimMaskView;

        var $needToHide;
        var showModule = _.debounce(function(){
            $needToHide.removeClass('w-module-hide');
            $needToHide = undefined;
        }, 200);

        WindowState.on('resize', function (){
            if (!$needToHide) {
                $needToHide = $('.need-to-hide').addClass('w-module-hide');
            }
            showModule();
        });

        var navigateHandler = function (msg) {
            switch (msg.type) {
            case CONFIG.enums.NAVIGATE_TYPE_MARKET:
                var url;
                if (navigator.language === CONFIG.enums.LOCALE_ZH_CN) {

                    url = 'http://apps.wandoujia.com/';
                    if (msg.id) {
                        url = 'http://apps.wandoujia.com/apps/' + msg.id + '?pos=w/search';
                    }

                    this.getModule('browser').navigate(url);

                } else {

                    url = 'wdj-extension://__MSG_@@extension_id__/index.html#app';
                    if (msg.id) {
                        url = 'wdj-extension://__MSG_@@extension_id__/detail.html?pos=w/search#' + msg.id;
                    }

                    this.getModule('browser').navigateToThirdParty(380, '', url);
                }
                break;
            case CONFIG.enums.NAVIGATE_TYPE_MARKET_SEARCH:
                if (navigator.language === CONFIG.enums.LOCALE_ZH_CN) {
                    this.getModule('browser').navigate('http://apps.wandoujia.com/search?pos=w/search&key=' + msg.keyword);
                } else {
                    this.getModule('browser').navigateToThirdParty(380, '', 'wdj-extension://__MSG_@@extension_id__/search.html#q/' + msg.keyword);
                }
                break;
            case CONFIG.enums.NAVIGATE_TYPE_GROUP_APP:
                this.getModule('app').navigateGroup(msg);
                break;
            case CONFIG.enums.NAVIGATE_TYPE_APP:
                if (msg.action === CONFIG.enums.NAVIGATE_TYPE_UNINSTALL_APP) {
                    AppService.uninstallAppsAsync([msg.id]);
                } else {
                    this.getModule('app').navigate(msg);
                }
                break;
            case CONFIG.enums.NAVIGATE_TYPE_GROUP_CONTACT:
                this.getModule('contact').navigateGroup(msg);
                break;
            case CONFIG.enums.NAVIGATE_TYPE_CONTACT:
                if (msg.action === CONFIG.enums.NAVIGATE_TYPE_SEND_SMS) {
                    this.getModule('message').sendMessageByContactId(msg.id);
                } else {
                    var data = msg.id.split('|');
                    this.getModule('contact').navigateAsync({
                        id : data[0]
                    }).done(function () {
                        if (msg.action === CONFIG.enums.NAVIGATE_TYPE_CALL) {
                            var dialEle = $('.button-dial[data-phone-number="' + data[1] + '"]')[0];
                            if (dialEle) {
                                dialEle.click();
                            }
                        }
                    });
                }
                break;
            case CONFIG.enums.NAVIGATE_TYPE_GROUP_SMS:
                this.getModule('message').navigateGroup(msg);
                break;
            case CONFIG.enums.NAVIGATE_TYPE_SMS:
                msg.id = msg.id.split('|')[0];
                this.getModule('message').navigate(msg);
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
                this.getModule('browser').navigateToThirdParty(218, i18n.misc.WANDOUJIA_THEME);
                break;
            case CONFIG.enums.NAVIGATE_TYPE_APP_WASH:
                this.getModule('app-wash').navigate();
                break;
            case CONFIG.enums.NAVIGATE_TYPE_BACKUP_CLOUD:
                if (Device.get('isConnected')) {
                    Backbone.trigger('switchModule', {
                        module : 'backup-restore'
                    });
                } else {
                    alert(i18n.welcome.CONNECT_UR_PHONE);
                }
                break;
            case CONFIG.enums.NAVIGATE_TYPE_TASK_MANAGER:
                TaskMonitorView.getInstance().toggleListView(true);
                break;
            case CONFIG.enums.NAVIGATE_TYPE_PIM_MODULE:
                var target = PIMCollection.getInstance().get(msg.id);
                Backbone.trigger('switchModule', {
                    module : target.get('module'),
                    tab : target.get('tab')
                });
                break;
            case CONFIG.enums.NAVIGATE_TYPE_VIDEO:
                this.getModule('browser').navigateToThirdParty(258, '', 'wdj-extension://__MSG_@@extension_id__/index.html#detail/' + msg.id);
                break;
            case CONFIG.enums.NAVIGATE_TYPE_VIDEO_SEARCH:
                this.getModule('browser').navigateToThirdParty(258, '', 'wdj-extension://__MSG_@@extension_id__/search.html#q/' + msg.keyword);
                break;
            case CONFIG.enums.NAVIGATE_TYPE_DORAEMON:
                var index = msg.id.indexOf('-');
                if (index <= 0) {
                    return;
                }
                var extensionId = parseInt(msg.id.substr(0, index), 10);
                var extentsionUrl = msg.id.substr(index + 1);
                this.getModule('browser').navigateToThirdParty(extensionId, '', extentsionUrl);
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
                    var tab = data.tab;

                    this.showModule(module, data.tab);

                    if (module === 'doraemon') {
                        NavView.getInstance().deselectAll();
                    }

                    IO.sendCustomEventsAsync(CONFIG.events.WEB_SWITCH_MODULE, {
                        module : module,
                        tab : tab
                    });
                }, this);

                IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.WEB_NAVIGATE
                }, navigateHandler, this);

                IO.Backend.onmessage({
                    'data.channel' : CONFIG.events.WEB_FORCE_NAVIGATE
                }, navigateHandler, this);

                this.$el = $('body');

                this.listenTo(Backbone, 'taskManager.showModule', function (name) {
                    this.showModule(name);
                });
            },
            render : function () {
                $('body').append(this.template({}));

                var fragment = document.createDocumentFragment();
                fragment.appendChild(NavView.getInstance().render().$el[0]);
                fragment.appendChild($(doT.template(TemplateFactory.get('misc', 'shadow'))({}))[0]);
                fragment.appendChild(TaskMonitorView.getInstance().render().$el[0]);
                this.$('.sidebar').append(fragment);

                fastUSBNotificationView = FastUSBNotificationView.getInstance();
                this.$('.module-ctn').append(fastUSBNotificationView.render().$el);

                pimMaskView = PimMaskView.getInstance();
                this.$('.module-ctn').append(pimMaskView.render().$el.hide());

                this.listenTo(Device, 'change:isWifi change:isConnected change:isFastADB', _.debounce(function () {
                    var isShow = this.toggleMask();
                }.bind(this), 500));

                var delegate = IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.REVERSE_PROXY_START
                }, function () {
                    var popupPanel = new AgentNotifiPopup({
                        $host : $('.w-misc-agent-host')
                    });

                    popupPanel.show();
                    IO.Backend.Device.offmessage(delegate);
                });

                this.regConnectionTip();

                return this;
            },
            regConnectionTip : function () {
                var connectDisplayCount = Settings.get('auto-connection-notifi-popup') || 0;
                var disconnectDisplayConut = Settings.get('disconnection-notifi-popup') || 0;
                var currentWifiState = Device.get('isWifi');
                var isConnected = Device.get('isConnected');
                var listenHandler;
                var autoConnectionNotifiPopup;

                var showTip = function (type) {

                    if (autoConnectionNotifiPopup) {
                        autoConnectionNotifiPopup.destory();
                    }

                    autoConnectionNotifiPopup = new AutoConnectionNotifiPopup({
                        $host : $('.w-misc-agent-host'),
                        alignToHost : true,
                        type : type
                    });
                    autoConnectionNotifiPopup.show();

                    if (type === 'connection') {
                        Settings.set('auto-connection-notifi-popup', ++connectDisplayCount);
                    } else {
                        Settings.set('disconnection-notifi-popup', ++disconnectDisplayConut);
                    }
                };

                if (connectDisplayCount < 3 && currentWifiState && isConnected) {
                    showTip('connection');
                }

                listenHandler = this.listenTo(Device, 'change:isWifi change:isUSB', _.debounce(function (Device) {

                    isConnected = Device.get('isConnected');
                    var isWifi = Device.get('isWifi');

                    if (isWifi && connectDisplayCount < 3) {
                        showTip('connection');
                    } else if (!isWifi && currentWifiState && !isConnected && disconnectDisplayConut < 3){
                        showTip('disconnection');
                    }
                    currentWifiState = isWifi;

                    if (connectDisplayCount === 3 && disconnectDisplayConut === 3) {
                        this.stopListening(Device, 'change:isWifi', listenHandler);
                    }
                }.bind(this), 500));

                this.listenTo(Device, 'change:isUSB', function (Device, isUSB) {
                    if (!isUSB) {
                        return;
                    }

                    if (autoConnectionNotifiPopup) {
                        autoConnectionNotifiPopup.destory();
                    }
                });
            },
            regModule : function (name, module) {
                this.modules[name] = module;

                if (module.enablePreload && Device.get('isUSB')) {
                    module.preload();
                }
            },
            getModule : function (name) {
                return this.modules[name];
            },
            toggleMask : function () {
                var isConnected = Device.get('isConnected') || Device.get('isFastADB');
                var isWifi = Device.get('isWifi');
                var connectionState = Device.get('connectionState');

                if (!this.currentModule.match(/task|browser|gallery|welcome|doraemon/) && (!isConnected || isWifi)) {
                    pimMaskView.show();

                    if (connectionState !== CONFIG.enums.CONNECTION_STATE_CONNECTED && connectionState !== CONFIG.enums.CONNECTION_STATE_PLUG_OUT) {
                        WindowController.ShowWidzard(this.currentModule);
                    }

                } else {
                    pimMaskView.hide();
                }
            },
            showModule : function (name, tab) {

                this.currentTab = tab;

                if (name === this.currentModule) {
                    return;
                }

                if (this.currentModule && this.currentModule !== 'task') {
                    this.hideModule(this.currentModule);
                }

                this.currentModule = name;
                if (name === 'task') {
                    return;
                }

                this.toggleMask();
                var moduleInstance = this.modules[name].getInstance(tab);
                var $moduleCtn = this.$('.module-ctn');
                if (moduleInstance.rendered) {
                    moduleInstance.$el.css({
                        'visibility' : 'visible',
                        'opacity' : '1'
                    }).removeClass('need-to-hide');
                } else {
                    moduleInstance.$el.css({
                        'visibility' : 'visible',
                        'opacity' : '1'
                    }).removeClass('need-to-hide');

                    if (name === 'task') {
                        $moduleCtn.append(moduleInstance.render().$el);
                    } else {
                        fastUSBNotificationView.$el.before(moduleInstance.render().$el);
                    }
                }

                moduleInstance.$('.w-ui-smartlist').addClass('visible');
                if (name === 'welcome') {
                    moduleInstance.$('.feed-ctn').addClass('visible');
                }

                Backbone.trigger('showModule', name);
            },
            hideModule : function (name) {
                var moduleInstance = this.modules[name].getInstance();
                if (moduleInstance.rendered) {
                    moduleInstance.$el.css({
                        'visibility' : 'hidden',
                        'opacity' : '0'
                    }).addClass('need-to-hide');
                }

                moduleInstance.$('.w-ui-smartlist').removeClass('visible');
                if (name === 'welcome') {
                    moduleInstance.$('.feed-ctn').removeClass('visible');
                }

                Backbone.trigger('hideModule', name);
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
