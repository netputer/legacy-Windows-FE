/*global define*/
(function (window) {
    define([
        'underscore',
        'backbone',
        'Configuration',
        'IO',
        'ui/AlertWindow',
        'ui/Panel'
    ], function (
        _,
        Backbone,
        CONFIG,
        IO,
        AlertWindow,
        Panel
    ) {
        console.log('IframeMessageListener - File loaded. ');

        var alert = window.alert;
        var confirm = window.confirm;

        var IframeMessageListener = _.extend({}, Backbone.Events);

        IO.Backend.onmessage({
            'data.channel' : CONFIG.events.CUSTOM_IFRAME_ALERT
        }, function (data) {
            alert(data.data);
        });


        IO.Backend.onmessage({
            'data.channel' : CONFIG.events.CUSTOM_IFRAME_CONFIRM
        }, function (data) {
            confirm(data.data, function () {
                IO.sendCustomEventsAsync(data.listenerId, {
                    action : 'yes'
                });
            }, function () {
                IO.sendCustomEventsAsync(data.listenerId, {
                    action : 'no'
                });
            });
        });

        IO.Backend.onmessage({
            'data.channel' : CONFIG.events.CUSTOM_IFRAME_DISPOSABLE
        }, function (data) {
            data = data.data;
            var panel = new Panel(data);
            panel.show();
        });

        return IframeMessageListener;
    });
}(this));
