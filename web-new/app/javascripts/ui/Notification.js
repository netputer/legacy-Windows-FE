/*global define*/
(function (window) {
    define(['backbone', 'Environment', 'jquery', 'IO', 'Configuration'], function (Backbone, Environment, $, IO, CONFIG) {
        console.log('Notification - File loaded.');

        var requestPermission = function (callback) {
            window.webkitNotifications.requestPermission(callback);
        };

        var Notification = Backbone.View.extend({
            initialize : function () {
                var type = 'simple';
                var icon;
                var title;
                var content;
                var url;
                var ondisplay;
                var onclick;
                var onclose;
                var notificationWindow;
                var duration;

                Object.defineProperties(this, {
                    type : {
                        set : function (value) {
                            type = value;
                        },
                        get : function () {
                            return type;
                        }
                    },
                    icon : {
                        set : function (value) {
                            icon = value;
                        },
                        get : function () {
                            return icon;
                        }
                    },
                    title : {
                        set : function (value) {
                            title = value;
                        },
                        get : function () {
                            return title;
                        }
                    },
                    content : {
                        set : function (value) {
                            content = value;
                        },
                        get : function () {
                            return content;
                        }
                    },
                    url : {
                        set : function (value) {
                            url = value;
                        },
                        get : function () {
                            return url;
                        }
                    },
                    ondisplay : {
                        set : function (value) {
                            if (value instanceof Function) {
                                ondisplay = value;
                            }
                        },
                        get : function () {
                            return ondisplay;
                        }
                    },
                    onclick : {
                        set : function (value) {
                            if (value instanceof Function) {
                                onclick = value;
                            }
                        },
                        get : function () {
                            return onclick;
                        }
                    },
                    onclose : {
                        set : function (value) {
                            if (value instanceof Function) {
                                onclose = value;
                            }
                        },
                        get : function () {
                            return onclose;
                        }
                    },
                    notificationWindow : {
                        set : function (value) {
                            notificationWindow = value;
                        },
                        get : function () {
                            return notificationWindow;
                        }
                    },
                    duration : {
                        set : function (value) {
                            duration = value;
                        },
                        get : function () {
                            return duration;
                        }
                    }
                });

                var options = this.options || {};
                var key;
                for (key in options) {
                    if (options.hasOwnProperty(key)) {
                        this[key] = options[key];
                    }
                }
            },
            show : function () {
                var result;
                if (window.webkitNotifications.checkPermission() === 0) {
                    // Create Desktop Notification instance
                    switch (this.type) {
                    case 'simple':
                        this.notificationWindow = window.webkitNotifications.createNotification(this.icon, this.title, this.content);
                        break;
                    case 'html':
                        this.notificationWindow = window.webkitNotifications.createHTMLNotificationwdj(this.url, this.title, Environment.get('deviceId'));
                        break;
                    }

                    // Bind the events
                    this.notificationWindow.ondisplay = this.ondisplay;
                    this.notificationWindow.onclick = this.onclick;
                    this.notificationWindow.onclose = this.onclose;

                    // Show Notification
                    this.notificationWindow.show();

                    if (this.duration && typeof this.duration === 'number') {
                        setTimeout(this.cancel.bind(this), this.duration);
                    }

                    result = true;
                } else {
                    // Request for permission
                    requestPermission(this.show.bind(this));
                    result = false;
                }
                return result;
            },
            cancel : function () {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.CLOSE_ALL_NOTIFICATION,
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            deferred.resolve(resp);
                        } else {
                            deferred.reject(resp);
                        }
                    }
                });

                return deferred.promise();
                //this.notificationWindow.close();
            }
        });

        return Notification;
    });
}(this));
