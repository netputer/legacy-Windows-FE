/*global define*/
(function (window) {
    define([
        'backbone',
        'jquery',
        'underscore',
        'IOBackendDevice',
        'Configuration',
        'Internationalization',
        'ui/AlertWindow',
        'Device',
        'Account',
        'Log',
        'main/collections/PIMCollection',
        'app/collections/AppsCollection',
        'app/collections/WebAppsCollection',
        'app/views/AppListView',
        'contact/collections/ContactsCollection',
        'message/collections/ConversationsCollection',
        'music/collections/MusicsCollection',
        'photo/collections/PhonePhotoCollection',
        'photo/collections/LibraryPhotoCollection',
        'photo/collections/CloudPhotoCollection',
        'video/collections/VideosCollection'
    ], function (
        Backbone,
        $,
        _,
        IO,
        CONFIG,
        i18n,
        AlertWindow,
        Device,
        Account,
        log,
        PIMCollection,
        AppsCollection,
        WebAppsCollection,
        AppListView,
        ContactsCollection,
        ConversationsCollection,
        MusicsCollection,
        PhonePhotoCollection,
        LibraryPhotoCollection,
        CloudPhotoCollection,
        VideosCollection
    ) {
        var alert = window.alert;
        var history = window.history;

        var backStack = [];
        var forwarStack = [];

        var updateNativeToolbarState = function () {
            var SnapPea = window.SnapPea;

            if (!SnapPea) {
                return;
            }

            var currentModule = SnapPea.CurrentModule;
            if (currentModule === 'browser') {
                var $iframe = $('#' + CONFIG.enums.IFRAME_PREFIX + SnapPea.CurrentTab + ' iframe');
                var frameId = $iframe[0].id;
                var branch = $iframe.attr('branch');
                var backCount = history.backCount(frameId, branch);
                var forwardCount = history.forwardCount(frameId, branch);

                window.externalCall('', 'navigation', JSON.stringify({
                    canGoBack : backStack.length > 1 || backCount > 0,
                    canGoForward : forwarStack.length > 0 || forwardCount > 0,
                    canReload : true
                }));
            } else {
                var canReload = false;

                switch (SnapPea.CurrentModule) {
                case 'welcome':
                case 'app-wash':
                case 'optimize':
                    canReload = false;
                    break;
                case 'app':
                    if (SnapPea.CurrentTab === 'web') {
                        canReload = false;
                    } else {
                        canReload = Device.get('isConnected');
                    }
                    break;
                default:
                    canReload = Device.get('isConnected');
                }

                window.externalCall('', 'navigation', JSON.stringify({
                    canGoBack : backStack.length > 1,
                    canGoForward : forwarStack.length > 0,
                    canReload : canReload
                }));
            }
        };

        Device.on('change:isConnected', updateNativeToolbarState);

        IO.Backend.Device.onmessage({
            'data.channel' : CONFIG.events.NAVIGATE_BACK
        }, function (data) {
            var SnapPea = window.SnapPea;
            if (SnapPea.CurrentModule === 'browser') {
                var $iframe = $('#' + CONFIG.enums.IFRAME_PREFIX + SnapPea.CurrentTab + ' iframe');
                var frameId = $iframe[0].id;
                var branch = $iframe.attr('branch');
                var backCount = history.backCount(frameId, branch);
                if (backCount > 0) {
                    forwarStack.length = 0;
                    history.back2(frameId, branch);
                } else {
                    forwarStack.push(backStack.pop());
                    Backbone.trigger('switchModule', _.extend(backStack.pop(), {
                        ignore : true
                    }));
                }
            } else {
                forwarStack.push(backStack.pop());
                Backbone.trigger('switchModule', _.extend(backStack.pop(), {
                    ignore : true
                }));
            }
        });

        IO.Backend.Device.onmessage({
            'data.channel' : CONFIG.events.NAVIGATE_FORWARD
        }, function (data) {
            var SnapPea = window.SnapPea;
            if (SnapPea.CurrentModule === 'browser') {
                var $iframe = $('#' + CONFIG.enums.IFRAME_PREFIX + SnapPea.CurrentTab + ' iframe');
                var frameId = $iframe[0].id;
                var branch = $iframe.attr('branch');
                var forwardCount = history.forwardCount(frameId, branch);
                if (forwardCount > 0) {
                    history.forward2(frameId, branch);
                } else {
                    Backbone.trigger('switchModule', _.extend(forwarStack.pop(), {
                        ignore : true
                    }));
                }
            } else {
                Backbone.trigger('switchModule', _.extend(forwarStack.pop(), {
                    ignore : true
                }));
            }
        });

        IO.Backend.Device.onmessage({
            'data.channel' : CONFIG.events.NAVIGATE_REFRESH
        }, function (data) {
            var SnapPea = window.SnapPea;
            switch (SnapPea.CurrentModule) {
            case 'browser':
                var iframe = $('#' + CONFIG.enums.IFRAME_PREFIX + SnapPea.CurrentTab + ' iframe')[0];
                iframe.reload(iframe.contentDocument.location.href);
                break;
            case 'app':
                var appListView = AppListView.getInstance();
                if (appListView.list.currentSet.name === 'web') {
                    if (!Account.get('isLogin')) {
                        Account.loginAsync('', 'app-list-refresh');
                        var loginHandler = function (Account, isLogin) {
                            if (isLogin) {
                                WebAppsCollection.getInstance().syncAsync().fail(function () {
                                    alert(i18n.misc.REFRESH_ERROR);
                                });
                                Account.off('change:isLogin', loginHandler);
                            }
                        };
                        Account.on('change:isLogin', loginHandler, this);
                        return;
                    }
                }
                var targetCollection = appListView.list.currentSet.name === 'web' ? WebAppsCollection.getInstance() : AppsCollection.getInstance();
                targetCollection.syncAsync().fail(function () {
                    alert(i18n.misc.REFRESH_ERROR);
                });
                break;
            case 'contact':
                ContactsCollection.getInstance().syncAsync().fail(function () {
                    alert(i18n.misc.REFRESH_ERROR);
                });
                break;
            case 'message':
                ConversationsCollection.getInstance().syncAsync().fail(function () {
                    alert(i18n.misc.REFRESH_ERROR);
                });
                break;
            case 'music':
                MusicsCollection.getInstance().syncAsync().fail(function () {
                    alert(i18n.misc.REFRESH_ERROR);
                });
                break;
            case 'photo':
                PhonePhotoCollection.getInstance().syncAsync().fail(function () {
                    alert(i18n.misc.REFRESH_ERROR);
                });
                LibraryPhotoCollection.getInstance().syncAsync().fail(function () {
                    alert(i18n.misc.REFRESH_ERROR);
                });
                CloudPhotoCollection.getInstance().syncAsync().fail(function () {
                    alert(i18n.misc.REFRESH_ERROR);
                });
                break;
            case 'video':
                VideosCollection.getInstance().syncAsync().fail(function () {
                    alert(i18n.misc.REFRESH_ERROR);
                });
                break;
            }

            log({
                'event' : 'ui.click.native_toolbar_refresh',
                'module' : SnapPea.currentModule
            });
        });

        IO.Backend.Device.onmessage({
            'data.channel' : CONFIG.events.HISTORY_CHANGED
        }, updateNativeToolbarState, this);

        Backbone.on('switchModule', function (data) {
            setTimeout(function () {
                if (!data.ignore) {
                    forwarStack.length = 0;
                }
                delete data.silent;
                delete data.ignore;
                if (!_.isEqual(backStack[backStack.length - 1], data)) {
                    backStack.push(data);
                }

                updateNativeToolbarState();
            });
        });

        window.externalCall('', 'navigation', JSON.stringify({
            canGoBack : true,
            canGoForward : true,
            canReload : true
        }));
    });
}(this));
