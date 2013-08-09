/*global require*/
require.config({
    paths : {
        jquery : '../bower_components/jquery/jquery',
        doT : '../bower_components/doT/doT',
        underscore : '../bower_components/underscore/underscore',
        backbone : '../bower_components/backbone/backbone',
        text : '../bower_components/requirejs-text/text',
        i18n : '../bower_components/requirejs-i18n/i18n',
        optimize : 'modules/optimize',
        main : 'modules/main',
        nav : 'modules/nav',
        doraemon : 'modules/doraemon',
        task : 'modules/taskmanager',
        message : 'modules/message',
        browser : 'modules/browser',
        app : 'modules/app',
        welcome : 'modules/welcome',
        music : 'modules/music',
        contact : 'modules/contact',
        photo : 'modules/photo',
        video : 'modules/video',
        backuprestore : 'modules/backuprestore',
        social : 'modules/social',
        sync : 'modules/sync',
        guide : 'modules/welcome/guide'
    },
    shim: {
        doT : {
            exports : 'doT'
        },
        jquery : {
            exports : '$'
        },
        underscore : {
            exports : '_'
        },
        backbone : {
            deps: ['underscore', 'jquery'],
            exports: 'Backbone'
        }
    }
});

(function (window, document) {
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

    // Disable `console` object under release mode
    if (QueryString.get('debug') !== 'true') {
        var originalConsole = window.console;

        var emptFunc = function () {
            return;
        };

        window.console = {
            debug : emptFunc,
            log : emptFunc,
            time : emptFunc,
            timeEnd : emptFunc,
            dir : emptFunc,
            error : emptFunc
        };

        window.whosYourDaddy = function () {
            window.console = originalConsole;
        };
    }

    var ua = window.navigator.userAgent;
    if (ua.indexOf('Windows NT 5.1') >= 0 ||
            ua.indexOf('Windows NT 5.2') >= 0) {
        var styleNode = document.createElement('style');
        styleNode.type = 'text/css';
        styleNode.innerText = [
            '<style type="text/css">',
            'body,',
            'button,',
            'input,',
            'textarea {',
            '    font: 12px/1.5em Arial, Helvetica, SimSun, sans-serif;',
            '}',
            '</style>'
        ].join('');

        document.getElementsByName('head')[0].appendChild(styleNode);
    }
}(this, this.document));

require([
    'guide/views/GuideView'
]);
