/*global define*/
/**
 * @author wangye.zhao@wandoujia.com
 * @doc https://github.com/wandoulabs/engineering-documents/wiki/%5BClient%5D-ui-MouseState.js
 */
(function (window, document) {
    'use strict';

    define([
        'jquery',
        'underscore',
        'backbone'
    ], function (
        $,
        _,
        Backbone
    ) {
        console.log('MouseState - File loaded.');

        var x;
        var y;
        var currentElement;
        var MouseState = _.extend({}, Backbone.Events);

        // A global delegate host mouse position and current element
        $(document).on('mousemove', _.throttle(function (evt) {
            x = evt.clientX;
            y = evt.clientY;
            currentElement = evt.originalEvent.srcElement;

            MouseState.trigger('mousemove', MouseState);
        }, 25));

        // A global delegate of mousewheel
        $(document).on('mousewheel', _.throttle(function (evt) {
            MouseState.trigger('mousewheel', currentElement);
        }, 25));

        Object.defineProperties(MouseState, {
            x : {
                get : function () {
                    return x;
                }
            },
            y : {
                get : function () {
                    return y;
                }
            },
            currentElement : {
                get : function () {
                    return currentElement;
                }
            }
        });

        return MouseState;
    });
}(this, this.document));
