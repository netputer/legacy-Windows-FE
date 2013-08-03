/*global define*/
(function (window, document) {

    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'ui/TemplateFactory',
        'ui/SmartList',
        'ui/MenuButton',
        'ui/WindowState',
        'utilities/StringUtil',
        'Internationalization',
        'Account',
        'Configuration',
        'Environment',
        'Settings',
        'FunctionSwitch',
        'Device',
        'Log',
        'IO',
        'app/collections/AppsCollection',
        'app/collections/WebAppsCollection',
        'app/views/AppItemView',
        'app/views/AppContextMenu',
        'app/views/IgnoredAppsWindowView',
        'app/views/SortMenu',
        'main/collections/PIMCollection',
        'browser/views/BrowserModuleView'
    ], function (
        Backbone,
        _,
        doT,
        $,
        TemplateFactory,
        SmartList,
        MenuButton,
        WindowState,
        StringUtil,
        i18n,
        Account,
        CONFIG,
        Environment,
        Settings,
        FunctionSwitch,
        Device,
        log,
        IO,
        AppsCollection,
        WebAppsCollection,
        AppItemView,
        AppContextMenu,
        IgnoredAppsWindowView,
        SortMenu,
        PIMCollection,
        BrowserModuleView
    ) {
        console.log('AppListView - File loaded.');

        var appsCollection;
        var appList;
        var webAppsCollection;
        var pimCollection;
        var sortMenu;

        var loadingHandler = function () {
            this.loading = appList.listenToCollection.loading || appList.listenToCollection.syncing;
        };

        var AppListView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('app', 'app-list')),
            className : 'w-app-list vbox',
            initialize : function () {
                var sdTipShowed = false;
                var flashTipShowed = false;
                Object.defineProperties(this, {
                    selected : {
                        get : function () {
                            return appList ? appList.selected : [];
                        }
                    },
                    list : {
                        get : function () {
                            return appList;
                        }
                    },
                    sdTipShowed : {
                        get : function () {
                            return sdTipShowed;
                        },
                        set : function (value) {
                            sdTipShowed = Boolean(value);
                        }
                    },
                    flashTipShowed : {
                        get : function () {
                            return flashTipShowed;
                        },
                        set : function (value) {
                            flashTipShowed = Boolean(value);
                        }
                    }
                });

                appsCollection = AppsCollection.getInstance();
                webAppsCollection = WebAppsCollection.getInstance();
                pimCollection = PIMCollection.getInstance();

                this.listenTo(webAppsCollection, 'refresh', function (webAppsCollection) {

                    if (appList && appList.currentSet.name === 'web') {
                        appList.switchSet('web', webAppsCollection.getAll);
                    }
                    this.$('.tab li[data-tab="web"] .count').html(webAppsCollection.length);
                    this.relocatePointer();
                });

                this.listenTo(Device, 'change:isMounted', function (Device, isMounted) {
                    if (isMounted) {
                        if (!this.sdTipShowed && appsCollection.length > 0) {
                            this.$('.sd-mount').slideDown('fast', function () {
                                appList.build();
                                sdTipShowed = true;
                            });
                        }

                        if (this.flashTipShowed) {
                            this.$('.flash').slideUp('fast', function () {
                                appList.build();
                            });
                        }
                    } else {
                        this.$('.sd-mount').slideUp('fast', function () {
                            appList.build();
                        });

                        this.tryToShowFlashTip();
                    }
                    this.toggleEmptyTip();
                });

                _.each(pimCollection.where({
                    parent : 3
                }), function (tab) {
                    this.listenTo(tab, 'change:count', function (tab) {
                        this.$('.tab li[data-tab="' + tab.get('tab') + '"] .count').html(tab.get('count'));
                        this.relocatePointer();
                    });
                }, this);

                this.listenTo(Backbone, 'switchModule', this.switchModule);
                this.listenTo(Account, 'change:isLogin', this.toggleEmptyTip);
                this.listenTo(Device, 'change:isFastADB', function (Device, isFastADB) {
                    if (appList) {
                        this.toggleEmptyTip();
                    }
                });
            },
            switchModule : function (data) {
                var module = data.module;
                var tab = data.tab;

                if (module === 'app') {
                    this.toggleListeners(tab);

                    if (tab === 'web') {
                        appList.enableMutilselect = false;
                        appList.toggleObserver(false);
                        appList.enableContextMenu = false;
                    } else {
                        appList.enableMutilselect = true;
                        appList.toggleObserver(true);
                        appList.enableContextMenu = true;
                    }

                    this.switchListDataSet(tab);

                    this.selectTab(tab);
                    this.$el.toggleClass('web', tab === 'web');
                    this.$el.toggleClass('update', tab === 'update');
                }
            },
            toggleListeners : function (tab) {
                var newCollection;
                var oldCollection;
                if (tab === 'web') {
                    newCollection = webAppsCollection;
                    oldCollection = appsCollection;
                } else {
                    newCollection = appsCollection;
                    oldCollection = webAppsCollection;
                }
                this.listenTo(newCollection, 'refresh', this.buildList);
                this.stopListening(oldCollection, 'refresh', this.buildList);
                appList.listenTo(newCollection, 'syncStart update syncEnd refresh', loadingHandler);
                appList.stopListening(oldCollection, 'syncStart update syncEnd refresh', loadingHandler);
                appList.loading = newCollection.loading || newCollection.syncing;

                appList.listenToCollection = newCollection;
            },
            buildList : function () {
                if (!appList) {
                    appList = new SmartList({
                        itemView : AppItemView.getClass(),
                        dataSet : [{
                            name : 'default',
                            getter : appsCollection.getNormalApps
                        }],
                        enableContextMenu : true,
                        keepSelect : false,
                        $observer : this.options.$observer,
                        itemHeight : 45,
                        listenToCollection : appsCollection,
                        loading : appsCollection.loading || appsCollection.syncing
                    });

                    this.$('.flash').after(appList.render().$el);

                    appList.$el.data({
                        'smart-list-sortby' : 'base_info.name',
                        'smart-list-sort-type' : 'string'
                    });

                    this.listenTo(appList, 'switchSet', this.toggleEmptyTip);
                    this.listenTo(appList, 'contextMenu', this.showContextMenu);
                    this.listenTo(appList, 'select:change', function (selected) {
                        this.trigger('select:change', selected);
                    });

                    this.toggleListeners('normal');
                } else {
                    this.switchListDataSet(appList.currentSet.name);
                }
            },
            switchListDataSet : function (setName) {
                this.$('.ignore-tip').toggle(appsCollection.getIgnoredApps().length !== 0 && setName === 'update');

                if (setName !== 'web') {
                    this.parseSortData(sortMenu.selected);

                    if (appList.$el.data('smart-list-sortby') === 'base_info.last_update_time') {
                        appList.sortModels(false);
                    } else {
                        appList.sortModels(true);
                    }
                } else {
                    appList.$el.data({
                        'smart-list-sortby' : 'update',
                        'smart-list-sort-type' : 'number'
                    });
                    appList.sortModels(true);
                }

                if (setName !== 'search') {
                    this.resetHeader();
                }

                switch (setName) {
                case 'normal':
                case 'default':
                    appList.switchSet('default', appsCollection.getNormalApps);
                    break;
                case 'sys':
                    appList.switchSet('sys', appsCollection.getSystemApps);
                    break;
                case 'update':
                    this.$('.ignore-tip .count').html(StringUtil.format(i18n.app.IGNORED_APPS, appsCollection.getIgnoredApps().length));
                    appList.switchSet('update', appsCollection.getUpdatableApps);
                    break;
                case 'web':
                    appList.switchSet('web', webAppsCollection.getAll);
                    break;
                case 'search':
                    appList.switchSet('search', appsCollection.getByKeyword);
                    break;
                }
            },
            resetHeader : function () {

                this.$('.button-return, .search-tip').hide();
                this.$('menu, .sort, .pointer').show();
            },
            showAppsByKeyword : function () {
                this.switchListDataSet('search');
                var apps = appsCollection.getByKeyword();
                if (apps.length > 0) {
                    appList.scrollTo(apps[0]);
                }

                this.$('menu, .sort, .pointer').hide();

                this.$('.button-return').show();
                var tip = StringUtil.format(i18n.app.SEARCH_TIP_PART, apps.length, appsCollection.keyword);
                this.$('.search-tip').html(tip).css('display', '-webkit-box');
            },
            showContextMenu : function (selected) {
                var appContextMenu = AppContextMenu.getInstance({
                    selected : selected
                });

                appContextMenu.show();
            },
            toggleEmptyTip : function () {
                if (appList.listenToCollection.loading || appList.listenToCollection.syncing || Device.get('isFastADB')) {
                    appList.toggleEmptyTip(false);
                    return;
                }

                if (appList.currentModels.length === 0) {
                    var currentSet = appList.currentSet.name;
                    appList.showWanXiaoDou = false;
                    switch (currentSet) {
                    case 'default':
                        if (Device.get('isMounted')) {
                            appList.emptyTip = $(doT.template(TemplateFactory.get('app', 'sd-mount'))({}));
                        } else {
                            appList.showWanXiaoDou = true;
                            appList.emptyTip = i18n.app.NON_USER_APPS_TEXT;

                            log({
                                'event' : 'ui.show.wanxiaodou',
                                'type' : 'app'
                            });
                        }
                        break;
                    case 'sys':
                        appList.emptyTip = i18n.app.NON_SYSTEM_APPS_TEXT;
                        break;
                    case 'update':
                        if (FunctionSwitch.ENABLE_APP_UPGRADE) {
                            appList.emptyTip = appsCollection.loadingUpdateInfo ? i18n.app.LOADING_UPDATE : i18n.app.NON_UPGRADE_APPS_TEXT;
                        } else {
                            appList.emptyTip = i18n.app.ENABLE_APP_UPGRADE_TIP;
                        }
                        break;
                    case 'web':
                        if (Account.get('isLogin')) {
                            appList.emptyTip = doT.template(TemplateFactory.get('app', 'web-app-empty-tip'))({});
                        } else {
                            appList.emptyTip = i18n.app.EMPTY_TIP_WEB_APP_NOT_LOGIN;
                        }
                        break;
                    }
                    appList.toggleEmptyTip(true);
                } else {
                    appList.toggleEmptyTip(false);

                    if (Device.get('isMounted')) {
                        this.$('.sd-mount').css({
                            display : '-webkit-box'
                        });
                        this.sdTipShowed = true;
                    } else {
                        this.tryToShowFlashTip();
                    }
                }
            },
            parseSortData : function (data) {
                if (data.value === 'base_info.name') {
                    appList.$el.data({
                        'smart-list-sortby' : data.value,
                        'smart-list-sort-type' : 'string'
                    });
                } else {
                    appList.$el.data({
                        'smart-list-sortby' : data.value,
                        'smart-list-sort-type' : 'number'
                    });
                }
            },
            render : function () {
                this.$el.html(this.template((function () {
                    var tabs = pimCollection.filter(function (item) {
                        return item.get('parent') === 3;
                    });
                    var result = {
                        web : webAppsCollection.length
                    };

                    _.each(tabs, function (tab) {
                        result[tab.get('tab')] = tab.get('count');
                    });

                    return result;
                }())));

                this.selectTab('normal');

                this.buildList();

                this.toggleEmptyTip();

                sortMenu = SortMenu.getInstance();

                sortMenu.on('select', function (data) {
                    this.parseSortData(data);
                    if (appList.$el.data('smart-list-sortby') === 'base_info.last_update_time' ||
                            appList.$el.data('smart-list-sortby') === 'base_info.apk_size') {
                        appList.sortModels(false);
                    } else {
                        appList.sortModels(true);
                    }
                    appList.build();
                }, this);

                this.$('.sort').append(sortMenu.render().$el);

                this.listenTo(WindowState, 'resize', this.relocatePointer);

                setTimeout(this.relocatePointer.bind(this), 0);

                if (!FunctionSwitch.ENABLE_MY_APPS) {
                    this.$('.w-list-tab-header li[data-tab="web"]').remove();
                }

                if (Environment.get('locale') !== CONFIG.enums.LOCALE_DEFAULT &&
                        Environment.get('locale') !== CONFIG.enums.LOCALE_ZH_CN) {
                    this.$('.w-list-tab-header li[data-tab="update"]').remove();
                }

                return this;
            },
            highlight : function (app) {
                appList.deselectAll({
                    slient : true
                });
                appList.addSelect(app.id);
                appList.scrollTo(app);
            },
            clickButtonCloseSD : function () {
                this.$('.sd-mount').slideUp('fast', function () {
                    appList.build();
                });
            },
            clickButtonCloseFlash : function () {
                this.$('.flash').slideUp('fast', function () {
                    appList.build();
                });

                log({
                    'event' : 'ui.click.flash.app.tip.close'
                });
            },
            relocatePointer : function () {
                var $targetTab =  this.$('.tab li.selected');
                if ($targetTab.length > 0) {
                    var $pointer = this.$('.pointer');

                    var oldTransition = $pointer.css('-webkit-transition');

                    $pointer.css({
                        '-webkit-transition' : 'none'
                    });

                    this.$('.pointer').css({
                        left : $targetTab[0].offsetLeft,
                        width : $targetTab[0].offsetWidth
                    });

                    setTimeout(function () {
                        $pointer.css({
                            '-webkit-transition' : oldTransition
                        });
                    }, 0);
                }
            },
            selectTab : function (tab) {
                this.$('.tab li.selected').removeClass('selected');
                var $targetTab = this.$('.tab li[data-tab="' + tab + '"]');
                $targetTab.addClass('selected');

                this.$('.pointer').css({
                    left : $targetTab[0].offsetLeft,
                    width : $targetTab[0].offsetWidth
                });

                log({
                    'event' : 'ui.click.app.tab',
                    'tab' : tab
                });

                if (tab === 'web') {
                    log({
                        'event' : 'debug.app.webapp.list.show'
                    });
                }
            },
            tryToShowFlashTip : function () {
                if (!FunctionSwitch.ENABLE_MY_APPS ||
                        !Account.get('isLogin') ||
                        Device.get('isMounted') ||
                        !Device.get('isAutoBackup') ||
                        this.flashTipShowed ||
                        WebAppsCollection.getInstance().models.length === 0) {
                    return;
                }

                if (Device.get('isConnected') && Device.get('isFlashed')) {
                    this.$('.flash').slideDown('fast', function () {
                        appList.build();
                        this.flashTipShowed = true;
                    }.bind(this));

                    log({
                        'event' : 'debug.flash.app.tip.show'
                    });
                }
            },
            clickTab : function (evt) {
                Backbone.trigger('switchModule', {
                    module : 'app',
                    tab : $(evt.currentTarget).data('tab')
                });
            },
            clickButtonFlash : function () {
                Backbone.trigger('switchModule', {
                    module : 'app',
                    tab : 'web'
                });

                this.$('.flash').slideUp('fast', function () {
                    appList.build();
                });

                log({
                    'event' : 'ui.click.flash.app.tip.try'
                });
            },
            clickButtonOpenIgnore : function () {
                IgnoredAppsWindowView.getInstance().show();
            },
            clickButtonLogin :  function () {
                Account.loginAsync('', 'web-app');
            },
            clickButtonFindApp : function () {
                BrowserModuleView.navigateToThirdParty(18, i18n.app.APP_SEARCH);

                log({
                    'event' : 'ui.click.app.webapp.findapp'
                });
            },
            clickButtonOpenUpdate : function () {
                IO.requestAsync(CONFIG.actions.WINDOW_OPEN_PRIVACY_SETTING);
            },
            clickButtonReturn : function () {
                this.resetHeader();
                var tab = this.$('.tab .selected').data('tab');
                this.switchListDataSet(tab);
                this.selectTab(tab);
            },
            clickButtonDownload : function () {
                BrowserModuleView.navigateToThirdParty(223);

                log({
                    'event' : 'ui.click.wanxiaodou_download',
                    'type' : 'app'
                });
            },
            events : {
                'click .button-close-sd' : 'clickButtonCloseSD',
                'click .button-close-flash' : 'clickButtonCloseFlash',
                'click .button-flash' : 'clickButtonFlash',
                'click .tab li' : 'clickTab',
                'click .button-open-ignore' : 'clickButtonOpenIgnore',
                'click .button-login' : 'clickButtonLogin',
                'click .button-find-app' : 'clickButtonFindApp',
                'click .button-open-update' : 'clickButtonOpenUpdate',
                'click .button-return' : 'clickButtonReturn',
                'click .button-download-game' : 'clickButtonDownload'
            }
        });

        var appListView;

        var factory = _.extend({
            getInstance : function (args) {
                if (!appListView) {
                    appListView = new AppListView(args);
                }
                return appListView;
            }
        });

        return factory;
    });
}(this, this.document));

