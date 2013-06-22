/*global define*/
(function (window, undefined) {
    'use strict';

    define([], function () {

        // Detect Browser
        var Browsers = {
            wandoujia : false
        };

        if (typeof window.OneRingRequest === 'function' &&
                typeof window.OneRingStreaming === 'function') {
            Browsers.wandoujia = true;
        }

        var System = {
            WindowsXP : false
        };

        // Detect OS
        var ua = window.navigator.userAgent;
        if (ua.indexOf('Windows NT 5.1') >= 0 ||
                ua.indexOf('Windows NT 5.2') >= 0) {
            System.WindowsXP = true;
        }

        var BrowserSniffer = {};

        BrowserSniffer.is = function (name) {
            return Browsers[name];
        };

        BrowserSniffer.sysIs = function (name) {
            return System[name];
        };

        return BrowserSniffer;
    });
}(this));
