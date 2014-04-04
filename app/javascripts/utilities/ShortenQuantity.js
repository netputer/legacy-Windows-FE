/*global define*/
(function (window) {
    define([
        'Environment',
        'Configuration'
    ], function (
        Environment,
        CONFIG
    ) {

        var ShortenQuantity = function (quantity) {
            var count = quantity.toString();

            var str = '';
            if (navigator.language === CONFIG.enums.LOCALE_ZH_CN) {
                if (count.length > 5) {
                    str += count.slice(0, count.length - 4);
                    str += ' 万';
                } else {
                    str += count.toString() + ' ';
                }
            } else {
                if (count.length > 6) {
                    str += count.slice(0, count.length - 5);
                    str += 'm';
                } else {
                    str += count.toString() + ' ';
                }
            }

            return str;
        };

        return ShortenQuantity;
    });
}(this));
