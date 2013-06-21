require.config({
    baseUrl : 'javascripts/',
    paths : {
        jquery : '../bower_components/jquery/jquery',
        doT : '../bower_components/dot/doT',
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
        sync : 'modules/sync'
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

if (window.OneRingRequest === undefined) {
    window.OneRingRequest = function () {};
    window.OneRingStreaming = function () {};
}

require([
    'underscore',
    'jquery',
    'doT',
    'ui/TemplateFactory',
    'utilities/QueryString',
    'utilities/BrowserSniffer'
], function (
    _,
    $,
    doT,
    TemplateFactory,
    QueryString,
    BrowserSniffer
) {
    // Disable `console` object under release mode
    if (BrowserSniffer.is('wandoujia') && QueryString.get('debug') !== 'true') {
        var originalConsole = window.console;

        var emptFunc = function () {};

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

    // Hack for XP can't render Microsoft Yahei clearly
    if (BrowserSniffer.sysIs('WindowsXP')) {
        $('head').append(doT.template(TemplateFactory.get('misc', 'font-style-xp'))({}));
    }
});

require([
    'Internationalization',
    'contact/Contact',
    'message/Message',
    'music/Music',
    'sync/SyncService',
    'backuprestore/BackupRestore',
    'SnapPea'
], function (
    i18n,
    Contact,
    Message,
    Music,
    SyncService,
    BackupRestore,
    SnapPea
) {
    require(['../../../web/build/wonder-latest-dev']);
});
