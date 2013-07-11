/*global define, console*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'jquery',
        'utilities/QueryString',
        'Configuration',
        'IOBackendDevice'
    ], function (
        Backbone,
        _,
        $,
        QueryString,
        CONFIG,
        IO
    ) {
        console.log('ThemeManager - File loaded.');

        var STYLESHEET_PREFIX = 'wdj-theme-file';

        var ThemeManager = _.extend(function () {}, Backbone.Events);

        var themeFolder;

        Object.defineProperties(ThemeManager, {
            themeFolder : {
                set : function (value) {
                    themeFolder = value;
                    $('head').find('link.' + STYLESHEET_PREFIX).remove();

                    if (themeFolder) {
                        var $stylesheet = $('<link>').addClass(STYLESHEET_PREFIX);
                        $stylesheet.attr({
                            rel : 'stylesheet',
                            type : 'text/css',
                            href : 'file:///' + themeFolder + '\\templates\\theme.css'
                        });

                        $('head').append($stylesheet);
                    }
                },
                get : function () {
                    return themeFolder;
                }
            }
        });

        ThemeManager.themeFolder = QueryString.get('theme_folder');

        IO.Backend.Device.onmessage({
            'data.channel' : CONFIG.events.THEME_CHANGED
        }, function (data) {
            ThemeManager.themeFolder = data.value;
        }, true);

        return ThemeManager;
    });
}(this));
