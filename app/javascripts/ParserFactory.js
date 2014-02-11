/*global define*/
(function (window) {
    define([
        'underscore',
        'WorkerPoll',
        'Configuration',
        'text!workers/jsonparser.js'
    ], function (
        _,
        WorkerPoll,
        CONFIG,
        jsonparser
    ) {
        console.log('ParserFactory - File loaded.');

        var POOL_SIZE = 3;
        var ParserFactory = new WorkerPoll(window.URL.createObjectURL(new Blob([jsonparser])), POOL_SIZE);

        return ParserFactory;
    });
}(this));
