/*global define*/
(function (window) {
    define([
        'backbone',
        'jquery',
        'underscore',
        'IOBackendDevice',
        'Configuration',
        'main/collections/PIMCollection'
    ], function (
        Backbone,
        $,
        _,
        IO,
        CONFIG,
        PIMCollection
    ) {
        var history = window.history;

        var pimCollection = PIMCollection.getInstance();

        var backStack = [];
        var forwarStack = [];

        var updateNativeToolbarState = function () {
            var SnapPea = window.SnapPea;
            if (SnapPea.CurrentModule === 'browser') {
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
                window.externalCall('', 'navigation', JSON.stringify({
                    canGoBack : backStack.length > 1,
                    canGoForward : forwarStack.length > 0,
                    canReload : true
                }));
            }
        };

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
            if (SnapPea.CurrentModule === 'browser') {
                var iframe = $('#' + CONFIG.enums.IFRAME_PREFIX + SnapPea.CurrentTab + ' iframe')[0];
                iframe.reload(iframe.contentDocument.location.href);
            }
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
