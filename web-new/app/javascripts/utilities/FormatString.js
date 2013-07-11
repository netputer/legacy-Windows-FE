/*global define*/
/**
 * @author wangye.zhao@wandoujia.com
 */
(function (window) {
    define([], function () {

        var FormatString = function (input) {
            var input = arguments[0];

            if (typeof arguments[1] === "object") {
                var vars = arguments[1];
                return input.replace(/\{(\w+)\}/g, function () {
                    return vars[arguments[1]];
                });
            } else {
                var args = arguments;
                return input.replace(/\{(\d+)\}/g, function () {
                    return args[arguments[1]];
                });
            }
        };
        return FormatString;
    });
}(this));
