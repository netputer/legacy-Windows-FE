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
        'photo/collections/PhotoCollection',
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
        PhotoCollection,
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

                var backCount = 0;
                var forwardCount = 0;

                if ($iframe.length > 0) {
                    var frameId = $iframe[0].id;
                    var branch = $iframe.attr('branch');

                    backCount = history.backCount(frameId, branch);
                    orwardCount = history.forwardCount(frameId, branch);
                }

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
                case 'backup-restore':
                    canReload = false;
                    break;
                case 'app':

                    if (!window.SnapPea.isPimEnabled) {
                        canReload = false;
                    } else if (SnapPea.CurrentTab === 'web') {
                        canReload = Account.get('isLogin');
                    } else {
                        canReload = Device.get('isConnected');
                    }
                    break;
                default:
                    canReload = window.SnapPea.isPimEnabled;
                }

                window.externalCall('', 'navigation', JSON.stringify({
                    canGoBack : backStack.length > 1,
                    canGoForward : forwarStack.length > 0,
                    canReload : canReload
                }));
            }
        };

        Device.on('change:isConnected change:isSameWifi', _.debounce(updateNativeToolbarState, 200));

        IO.Backend.Device.onmessage({
            'data.channel' : CONFIG.events.NAVIGATE_BACK
        }, function (data) {
            var SnapPea = window.SnapPea;

            var doBack = function () {
                forwarStack.push(backStack.pop());
                var target = backStack.pop();

                log({
                    'event' : 'ui.click.native_toolbar_back',
                    'current' : SnapPea.CurrentModule,
                    'target' : target.module
                });

                Backbone.trigger('switchModule', _.extend(target, {
                    ignore : true
                }));
            };

            var $iframe = $('#' + CONFIG.enums.IFRAME_PREFIX + SnapPea.CurrentTab + ' iframe');
            if (SnapPea.CurrentModule === 'browser' && $iframe.length > 0) {

                var frameId = $iframe[0].id;
                var branch = $iframe.attr('branch');
                var backCount = history.backCount(frameId, branch);
                if (backCount > 0) {
                    forwarStack.length = 0;
                    history.back2(frameId, branch);
                } else {
                    doBack.call(this);
                }
            } else {
                doBack.call(this);
            }
        });

        IO.Backend.Device.onmessage({
            'data.channel' : CONFIG.events.NAVIGATE_FORWARD
        }, function (data) {
            var SnapPea = window.SnapPea;

            var doForward = function () {
                var target = forwarStack.pop();

                log({
                    'event' : 'ui.click.native_toolbar_forward',
                    'current' : SnapPea.CurrentModule,
                    'target' : target.module
                });

                Backbone.trigger('switchModule', _.extend(target, {
                    ignore : true
                }));
            };

            var $iframe = $('#' + CONFIG.enums.IFRAME_PREFIX + SnapPea.CurrentTab + ' iframe');
            if (SnapPea.CurrentModule === 'browser' && $iframe.length > 0) {
                var frameId = $iframe[0].id;
                var branch = $iframe.attr('branch');
                var forwardCount = history.forwardCount(frameId, branch);
                if (forwardCount > 0) {
                    history.forward2(frameId, branch);
                } else {
                    doForward.call(this);
                }
            } else {
                doForward.call(this);
            }
        });

        IO.Backend.Device.onmessage({
            'data.channel' : CONFIG.events.NAVIGATE_REFRESH
        }, function (data) {
            var SnapPea = window.SnapPea;
            var targetCollections = [];
            switch (SnapPea.CurrentModule) {
            case 'browser':
                var iframe = $('#' + CONFIG.enums.IFRAME_PREFIX + SnapPea.CurrentTab + ' iframe')[0];
                iframe.reload(iframe.contentDocument.location.href);
                break;
            case 'app':
                var appListView = AppListView.getInstance();
                if (appListView.list.currentSet.name === 'web') {
                    if (!Account.get('isLogin')) {
                        Account.openLoginDialog('', 'app-list-refresh');
                        return;
                    }
                }
                var targetCollection = appListView.list.currentSet.name === 'web' ? WebAppsCollection.getInstance() : AppsCollection.getInstance();
                targetCollections.push(targetCollection);
                break;
            case 'contact':
                targetCollections.push(ContactsCollection.getInstance());
                break;
            case 'message':
                targetCollections.push(ConversationsCollection.getInstance());
                break;
            case 'music':
                targetCollections.push(MusicsCollection.getInstance());
                break;
            case 'photo':
                targetCollections.push(PhotoCollection.getInstance());
                if (Account.get('isLogin')) {
                    targetCollections.push(CloudPhotoCollection.getInstance());
                }
                break;
            case 'video':
                targetCollections.push(VideosCollection.getInstance());
                break;
            }

            _.each(targetCollections, function (targetCollection) {

                if (!targetCollection.syncing) {
                    targetCollection.syncAsync().fail(function (resp) {
                        if (resp.state_code !== 702) {
                            alert(i18n.misc.REFRESH_ERROR);
                        }
                    });
                }
            });

            log({
                'event' : 'ui.click.native_toolbar_refresh',
                'module' : SnapPea.CurrentModule
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

                if (data.tab !== 'misc') {
                    delete data.silent;
                }
                delete data.ignore;

                if (data.tab) {
                    data.tab += '';
                }

                if (!_.isEqual(backStack[backStack.length - 1], data)) {
                    backStack.push(data);
                }

                updateNativeToolbarState();
            });

            var target = PIMCollection.getInstance().find(function (module) {
                return module.get('module') === data.module && module.get('root');
            });

            IO.requestAsync({
                url : CONFIG.actions.MODULE_CHANGE,
                data : {
                    module : target !== undefined ? target.id : -1
                }
            });
        });

        window.externalCall('', 'navigation', JSON.stringify({
            canGoBack : true,
            canGoForward : true,
            canReload : true
        }));

        Backbone.on('cleanForwardStack', function () {
            forwarStack.length = 0;
            updateNativeToolbarState();
        });
    });
}(this));
