/*global define*/
(function (window) {
    'use strict';

    define([], function () {
        var QUERYSTRING_PATTERN_PREFIX = '[\\?\\&\\#]';
        var QUERYSTRING_PATTERN_SUFFIX = '=([^&]*)';

        var QueryString = {};

        QueryString.get = function (key, string) {
            string = string || window.location.search;
            var matches = string.match(new RegExp(QUERYSTRING_PATTERN_PREFIX + key + QUERYSTRING_PATTERN_SUFFIX, 'i'));
            var encodedValue = matches && matches[1];
            var value = encodedValue && decodeURIComponent(encodedValue);
            return value;
        };

        return QueryString;
    });
}(this));
