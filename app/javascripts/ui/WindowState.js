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
        'backbone',
        'FunctionSwitch'
    ], function (
        $,
        _,
        Backbone,
        FunctionSwitch
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

            if (window.SnapPea && FunctionSwitch.ENABLE_PERFORMANCE_TRACKER) {
                var index = _.uniqueId('window_resize_');
                window.wandoujia.data = window.wandoujia.data || {};
                window.wandoujia.data[index] = {
                    'type' : 'window_resize_' + window.SnapPea.CurrentModule,
                    'width' : width,
                    'height' : height
                };
                window.wandoujia.getFPS('recordFPS', index);
            }
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
