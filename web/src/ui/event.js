/**
 * @fileoverview
 * @author jingfeng@wandoujia.com
 */

wonder.addModule('ui/event', function(W) {
    W.namespace('wonder.ui');

    function Event(type, opt_target) {
        // QUESTION: is this just a JSON? why a class is needed?

        /**
         * @type {String}
         */
        this.type = type;

        /**
         * target of the event.
         * @type {Object}
         */
        this.target = opt_target;

        /**
         * Object that had the listener attached.
         * @type {Object|undefined}
         */
        this.currentTarget = this.target;
    }


    W.ui.Event = Event;
});
wonder.useModule('ui/event');
