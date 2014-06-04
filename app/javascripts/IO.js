/*global define*/
(function (window) {
    define([
        'jquery',
        'underscore',
        'backbone',
        'Configuration',
        'BackendSocket',
        'MessageRouterMixin',
        'utilities/JSONParser'
    ], function (
        $,
        _,
        Backbone,
        CONFIG,
        BackendSocket,
        MessageRouterMixin,
        JSONParser
    ) {
        console.log('IO - File loaded.');

        var IO = _.extend({}, Backbone.Events);

        MessageRouterMixin.mixin(IO);

        IO.Backend = _.extend({}, Backbone.Events);

        MessageRouterMixin.mixin(IO.Backend);

        IO.initBackendSocket = function () {

            IO.Backend.socket = new BackendSocket('wdjs://window/events');

            IO.Backend.socket.onmessage = function (message) {
                IO.Backend.trigger('message', message);
            };
        };

        IO.Backend.requestAsync = function (url, options) {
            var deferred = $.Deferred();

            if (typeof url !== 'string') {
                options = url;
                url = options.url;
            }

            var originalURL = url;

            options = options || {};
            options.type = options.type || 'get';
            options.data = options.data || {};

            var done = function (resp) {
                JSONParser.parse(resp, function (data) {
                    console.log('IO - Callback message for \'' + originalURL + '\'', data);

                    if (typeof options.success === 'function') {
                        options.success.call(window, data);
                    }

                    deferred.resolve(data);
                });
            };

            switch (options.type.toLowerCase()) {
            case 'get':
                var datas = [];
                var d;
                for (d in options.data) {
                    if (options.data.hasOwnProperty(d)) {
                        datas.push(d + '=' + window.encodeURIComponent(options.data[d]));
                    }
                }

                if (datas.length > 0) {
                    url = url + '?' + datas.join('&');
                }

                window.OneRingRequest(options.type, url, null, done);
                break;
            case 'post':
                window.OneRingRequest(options.type, url, window.encodeURIComponent(JSON.stringify(options.data)), done);
                break;
            }
            console.log('IO - AJAX call: ' + originalURL, options);

            return deferred.promise();
        };

        IO.sendCustomEventsAsync = function (channel, data) {
            var deferred = $.Deferred();

            IO.requestAsync({
                url : CONFIG.actions.PUBLISH_EVENT,
                data : {
                    channel : channel,
                    value : JSON.stringify(data || {})
                },
                success : function (resp) {
                    if (resp.state_code === 200) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                }
            });

            return deferred.promise();
        };

        IO.Cloud = _.extend({}, Backbone.Events);

        MessageRouterMixin.mixin(IO.Cloud);

        IO.Cloud.requestAsync = $.ajax;

        /* these are short-cuts for Backend and Cloud */
        /* ajax will choose based on the protocol in URL */
        IO.requestAsync = function (url) {
            var testingUrl = typeof url === 'string' ? url : url.url;

            return (/^wdj:/.test(testingUrl)) ?
                    IO.Backend.requestAsync.apply(IO.Backend, arguments) :
                    IO.Cloud.requestAsync.apply(IO.Cloud, arguments);
        };

        /* global `onmessage` event will merge streams into one and append source property */
        IO.Backend.on('message', function (event) {
            IO.trigger('message', _.extend(event, { source : 'backend' }));
        });
        IO.Cloud.on('message', function (event) {
            IO.trigger('message', _.extend(event, { source : 'cloud' }));
        });

        // Override the sync API of Backbone.js
        if (Backbone && Backbone.sync) {
            var methodMap = {
                'create': 'POST',
                'update': 'PUT',
                'patch':  'PATCH',
                'delete': 'DELETE',
                'read':   'GET'
            };

            Backbone.sync = function (method, model, options) {
                var url = model.url;
                var params = {
                    url : model.url,
                    type : methodMap[method],
                    // contentType : model.contentType || 'application/json',
                    data : model.data || {},
                    // dataType : model.dataType || 'json',
                    processData : true,
                    success : options.success,
                    error : options.error,
                    xhrFields: model.xhrFields || {}
                };

                IO.requestAsync(url, params);
            };
        }

        window.IO = IO;

        return IO;
    });
}(this));
