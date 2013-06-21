/*global define, console*/
(function (window, undefined) {
    define(['underscore'], function (_) {
        console.log('FlashDetector - File loaded. ');

        var navigator = window.navigator;

        var FlashDetector = _.extend({
            getVersion : function () {
                var version = 0;
                if (navigator.plugins && navigator.plugins.length > 0) {
                    var swf = navigator.plugins["Shockwave Flash"];
                    if (swf) {
                        version = 1;
                        var des = swf.description.split(' ');
                        var i;
                        for (i = des.length; i--; undefined) {
                            if (!_.isNaN(parseInt(des[i], 10))) {
                                version = parseInt(des[i], 10);
                            }
                        }
                    }
                }
                return version;
            }
        });

        return FlashDetector;
    });
}(this));