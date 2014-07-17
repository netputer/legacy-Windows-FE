/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'Device',
        'message/collections/ThreadsCollection'
    ], function (
        Backbone,
        _,
        Device,
        ThreadsCollection
    ) {
        console.log('threads4ContactCollection - File loaded.');

        var Threads4ContactCollection = ThreadsCollection.getClass().extend({
            initialize : function () {
                Threads4ContactCollection.__super__.initialize.apply(this, arguments);
                Object.defineProperties(this, {
                    is4Contact : {
                        get : function () {
                            return true;
                        }
                    }
                });
            }
        });

        var threads4ContactCollection;

        var factory = _.extend({
            getInstance : function (args) {

                var listenHandler;
                var events = 'change:isConnected change:isSameWifi';

                if (!threads4ContactCollection) {
                    threads4ContactCollection = new Threads4ContactCollection(args);

                    if (window.SnapPea.isPimEnabled) {
                        threads4ContactCollection.trigger('update');
                    } else {
                        listenHandler = function (Device) {

                            if (window.SnapPea.isPimEnabled) {
                                this.trigger('update');
                                this.stopListening(this, events, listenHandler);
                            }
                        };

                        threads4ContactCollection.listenTo(Device, events, listenHandler);
                    }
                }
                return threads4ContactCollection;
            }
        });

        return factory;
    });
}(this));
