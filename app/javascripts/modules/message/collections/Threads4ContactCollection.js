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
                if (!threads4ContactCollection) {
                    threads4ContactCollection = new Threads4ContactCollection(args);

                    if (Device.get('isUSB')) {
                        threads4ContactCollection.trigger('update');
                    } else {
                        Device.once('change:isUSB', function (Device, isUSB) {
                            if (isUSB) {
                                threads4ContactCollection.trigger('update');
                            }
                        });
                    }
                }
                return threads4ContactCollection;
            }
        });

        return factory;
    });
}(this));
