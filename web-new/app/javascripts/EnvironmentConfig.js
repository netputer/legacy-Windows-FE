/*global define*/
(function (window) {
    'use strict';

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
}(this));
