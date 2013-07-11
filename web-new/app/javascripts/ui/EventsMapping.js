/*global define*/
/**
 * @author wangye.zhao@wandoujia.com
 * @doc https://github.com/wandoulabs/engineering-documents/wiki/%5BClient%5D-ui-EventsMapping.js
 */
(function (window) {
    'use strict';

    define([], function () {
        console.log('EventsMapping - File loaded.');

        var EventsMapping = Object.freeze({
            SHOW : 'show',
            HIDE : 'hide',
            REMOVE : 'remove',
            RENDERED : 'rendered',
            BUILD : 'build',

            DRAGSTART : 'dragStart',
            DRAGGING : 'dragging',
            DRAGEND : 'dragEnd',

            BUTTON_YES : 'button_yes',
            BUTTON_NO : 'button_no',
            BUTTON_CANCEL : 'button_cancel',
            BUTTON_RETRY : 'button_retry'
        });

        return EventsMapping;
    });
}(this));
