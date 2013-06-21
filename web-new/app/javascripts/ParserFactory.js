/*global define*/
(function (window, undefined) {
    define(['underscore', 'WorkerPoll'], function (_, WorkerPoll) {
        console.log('ParserFactory - File loaded.');

        var POOL_SIZE = 10;
        var WORKER_PATH = require.s.contexts._.config.baseUrl + '/workers/jsonparser.js';

        // var ParserFactory = new WorkerPoll(WORKER_PATH, POOL_SIZE);

        // return ParserFactory;
    });
}(this));
