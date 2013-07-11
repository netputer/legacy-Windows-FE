/*global define*/
(function (window) {
    define([], function () {

        var ReadableSize = function (bytes) {
            bytes = parseInt(bytes, 10);
            var units = ['B', 'KB', 'MB', 'GB', 'TB'];
            bytes = Math.max(bytes, 0);
            var pow = Math.floor((bytes ? Math.log(bytes) : 0) / Math.log(1024));
            pow = Math.min(pow, units.length - 1);
            bytes = bytes * 100 / Math.pow(1024, pow);
            var unit = units[pow];

            var result;
            if (unit === 'B' || unit === 'KB') {
                result = Math.round(Math.round(bytes) / 100) + ' ' + units[pow];
            } else {
                result = Math.round(bytes) / 100 + ' ' + units[pow];
            }

            return result;
        };

        return ReadableSize;
    });
}(this));
