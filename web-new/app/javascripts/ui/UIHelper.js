/*global define*/
/**
 * @author wangye.zhao@wandoujia.com
 * @doc https://github.com/wandoulabs/engineering-documents/wiki/%5BClient%5D-ui-UI-Helper.js
 */
(function (window) {
    'use strict';

    define([
        'ui/EventsMapping',
        'ui/KeyMapping',
        'ui/MouseState',
        'ui/WindowState'
    ], function (
        EventsMapping,
        KeyMapping,
        MouseState,
        WindowState
    ) {
        console.log('UIHelper - File loaded.');

        var UIHelper = {};

        Object.defineProperties(UIHelper, {
            EventsMapping : {
                value : EventsMapping
            },
            KeyMapping : {
                value : KeyMapping
            },
            MouseState : {
                value : MouseState
            },
            WindowState : {
                value : WindowState
            }
        });

        window.UIHelper = UIHelper;

        return UIHelper;
    });
}(this));
