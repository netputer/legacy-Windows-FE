require.config({
    paths : {
        jquery : '../bower_components/jquery/jquery',
        doT : '../bower_components/doT/doT',
        underscore : '../bower_components/underscore/underscore',
        backbone : '../bower_components/backbone/backbone',
        text : '../bower_components/requirejs-text/text',
        wookmark : '../bower_components/wookmark-jquery/jquery.wookmark',
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
        new_backuprestore : 'modules/new_backuprestore',
        social : 'modules/social',
        sync : 'modules/sync',
        guide : 'modules/welcome/guide',
        tools : 'modules/tools'
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
            exports : 'Backbone'
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
}(this, this.document));
