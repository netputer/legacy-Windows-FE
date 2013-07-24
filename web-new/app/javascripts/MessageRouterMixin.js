/*global define*/
(function (window) {
    define([
        'underscore',
        'utilities/FilterFunction',
        'ParserFactory'
    ], function (
        _,
        FilterFunction,
        ParserFactory
    ) {
        console.log('MessageRouterMixin - File loaded.');

        var id = 1;

        var reg = function (route, callback, context) {
            id++;
            this.callbackList.push({
                id : id,
                route : route,
                filter : FilterFunction.generate(route),
                callback : callback,
                context : context || window
            });

            return id;
        };

        var unreg = function (id) {
            var callbackList = this.callbackList;
            var filter = FilterFunction.generate({ id : id });
            var i;
            var length = callbackList.length;
            var item;
            for (i = 0; i < length; i++) {
                if (filter(callbackList[i])) {
                    item = callbackList.splice(i, 1);
                    delete item.id;
                    delete item.router;
                    delete item.callback;
                    delete item.context;
                    break;
                }
            }
        };

        var router = function (message) {
            _.each(this.callbackList, function (item) {
                if (item.filter(message)) {
                    item.callback.call(item.context, JSON.parse(message.data.data));
                    // ParserFactory.addTask(message.data.data, function (evt) {
                    //     item.callback.call(item.context, evt.data);
                    // });
                }
            });
        };

        return {
            mixin : function (that) {
                that.onmessage = reg.bind(that);
                that.offmessage = unreg.bind(that);
                that.on('message', router, that);

                that.callbackList = [];
            }
        };
    });
}(this));
