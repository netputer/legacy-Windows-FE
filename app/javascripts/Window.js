(function () {
    var properties = {};
    var propertyNotifications = {};
    var listeners = {};

    var eventFilters = {
        restore : function () {
            properties.maximized = false;
            properties.minimized = false;
        },
        maximize : function () {
            properties.maximized = true;
            properties.minimized = false;
        },
        minimize : function () {
            properties.maximized = false;
            properties.minimized = true;
        }
    };

    var sendMessage = function (name, args) {
        args = args ? JSON.stringify(args) : '';
        window.externalCall('', name, args);
    };

    var appWindow = {
        move : function (left, top) {
            if (typeof left !== 'number' || typeof top !== 'number') {
                return;
            }

            return sendMessage('window.move', {'left': left, 'top': top});
        },
        resize: function (width, height) {
            if (typeof width !== 'number' || typeof height !== 'number') {
                return;
            }

            return sendMessage('window.resize', {'width': width, 'height': height});
        },
        show : function (focused) {
            return sendMessage('window.show', {'focused': !!focused});
        },
        addListener : function (name, callback) {
            //close, maximize, minimize, restore
            var array = listeners[name];
            if (typeof array === 'undefined') {
                array = listeners[name] = [];
            }
            array.push(callback);
        },
        removeListener : function (name, callback) {
            var array = listeners[name];
            array = [];

            if (typeof array === 'undefined') {
              return false;
            }
            var index = array.indexOf(callback);
            if (index >= 0) {
              array = array.slice(index, index);
            }
        },
        callback : function (name, args) {
            if ('event' === name) {
                var array = listeners[args[0]];
                var handler = eventFilters[args[0]];

                if (handler) {
                    handler(args[0], args[1]);
                }

                if (array) {
                    var i = 0;
                    for (i; i < array.length; i++) {
                        array[i](args[1]);
                    }
                }

            } else if ('setProperty' === name) {
                setProperty(args[0], args[1]);
            }
        }
    };

    ['clearAttention', 'close', 'drawAttention', 'focus', 'hide','maximize', 'minimize', 'restore'].forEach(function (name) {
        appWindow[name] = function () {
            return sendMessage('window.' + name);
        };
    });

    var setProperty = function (name, value) {
        properties[name] = value;
        var notificationHandler = propertyNotifications[name];

        if (notificationHandler) {
            notificationHandler(name, value);
        }

        sendMessage('setProperty', { 'name': name, 'value': value });
    };
    ['maxWidth', 'minWidth', 'maxHeight', 'minHeight', 'resizable', 'alwaysOnTop'].forEach(function (name) {
        Object.defineProperty(appWindow, name, {
            get : function () {
                return properties[name];
            },
            set : function (value) {
                setProperty(name, value);
            }
        });
    });

    ['isMinimized', 'isMaximized'].forEach(function (name) {
        Object.defineProperty(appWindow, name, {
            get : function () {
                return properties[name];
            }
        });
    });

    window.SnapPea = window.SnapPea || {};
    window.SnapPea.AppWindow = appWindow;

    var canDrag = function(node) {
        return 'drag' === window.getComputedStyle(node).getPropertyValue('-webkit-app-region');
    };
    var init = function () {
        var isOnDraggableRegion = false;

        document.addEventListener('mouseup', function (e) {
            isOnDraggableRegion = false;
        });

        document.addEventListener('mousedown', function (e) {
            isOnDraggableRegion = canDrag(e.target);
        });

        document.addEventListener('mousemove', function (e) {
            if (isOnDraggableRegion && e.button === 0 && e.which === 1) {
                sendMessage('window.beginDrag');
            }
        }, false);
    };

    window.addEventListener('load', init, false);
}());
