/*global define*/
(function (window, undefined) {
    define([], function () {

        var FormatDuration = function (millisecond) {
            var devide = 1000 * 60;
            var minute = parseInt(millisecond / devide, 10);
            var second = ((millisecond % devide) / 1000).toString();
            if (second < 10) {
                second = '0' + second;
            }
            return minute + ':' + second.substring(0, 2);
        };

        return FormatDuration;
    });
}(this));
