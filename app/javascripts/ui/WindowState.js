/*global define*/
/**
 * @author wangye.zhao@wandoujia.com
 * @doc https://github.com/wandoulabs/engineering-documents/wiki/%5BClient%5D-ui-WindowState.js
 */
(function (window) {
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
        console.log('WindowState - File loaded.');

        var $window = $(window);

        var width = $window.width();
        var height = $window.height();
        var scrollLeft = $window.scrollLeft();
        var scrollTop = $window.scrollTop();

        var WindowState = _.extend({}, Backbone.Events);

        // A global delegate host window state
        $window.on('resize', _.throttle(function () {
            width = $window.width();
            height = $window.height();
            scrollLeft = $window.scrollLeft();
            scrollTop = $window.scrollTop();

            WindowState.trigger('resize', WindowState);
        }, 25));

        Object.defineProperties(WindowState, {
            width : {
                get : function () {
                    return width;
                }
            },
            height : {
                get : function () {
                    return height;
                }
            },
            scrollLeft : {
                get : function () {
                    return scrollLeft;
                }
            },
            scrollTop : {
                get : function () {
                    return scrollTop;
                }
            }
        });

        return WindowState;
    });
}(this));
