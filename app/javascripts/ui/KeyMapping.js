/*global define, console*/
/**
 * @author wangye.zhao@wandoujia.com
 * @doc https://github.com/wandoulabs/engineering-documents/wiki/%5BClient%5D-ui-KeyMapping.js
 */
(function (window) {
    'use strict';

    define([], function () {
        console.log('KeyMapping - File loaded.');

        var KeyMapping = Object.freeze({
            BACKSPACE : 8,
            TAB : 9,
            ENTER : 13,
            ESC : 27,
            LEFT : 37,
            UP : 38,
            RIGHT : 39,
            DOWN : 40,
            END : 35,
            HOME : 36,
            SPACEBAR : 32,
            PAGEUP : 33,
            PAGEDOWN : 34,
            J : 74,
            k : 75
        });

        return KeyMapping;
    });
}(this));
