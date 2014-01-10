/*global define*/
(function (window) {
    define(['underscore'], function (_) {
        console.log('EventsHelper - File loaded.');

        var document = window.document;

        var EventsHelper = _.extend({
            newEvent : function (name, data) {
                var evt = document.createEvent('HTMLEvents');
                evt.initEvent(name, true, true);
                evt.data = data || {};
                return evt;
            },
            trigger : function (evt, ele) {
                if (ele) {
                    ele.dispatchEvent(evt);
                } else {
                    document.dispatchEvent(evt);
                }
            }
        });

        return EventsHelper;
    });
}(this));
