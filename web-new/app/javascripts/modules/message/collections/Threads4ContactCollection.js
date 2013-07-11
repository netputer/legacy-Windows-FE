/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'message/collections/ThreadsCollection'
    ], function (
        Backbone,
        _,
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
                    threads4ContactCollection.trigger('update');
                }
                return threads4ContactCollection;
            }
        });

        return factory;
    });
}(this));
