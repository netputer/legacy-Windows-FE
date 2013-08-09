require(['IO'], function(IO) {
    module('IO');
    
    var testData = 'hello world';
    var timeoutTolerance = 100;

    test('io existence', 10, function() {
        ok(IO, 'IO exist');
        ok(IO.requestAsync, 'IO.requestAsync exists');
        ok(IO.bind, 'IO.bind exists');
        ok(IO.Backend, 'IO.Backend exists');
        ok(IO.Backend.requestAsync, 'IO.Backend.requestAsync exists');
        ok(IO.Backend.bind, 'IO.Backend.bind exists');
        ok(IO.Backend.socket, 'IO.Backend.socket exists');
        ok(IO.Cloud, 'IO.Cloud exists');
        ok(IO.Cloud.requestAsync, 'IO.Cloud.requestAsync exists');
        ok(IO.Cloud.bind, 'IO.Cloud.bind exists');
    });

    asyncTest('io backend ajax test', 3, function() {
        var donePromise = IO.Backend.requestAsync('wdj://test/echo', {
            data: testData
        });
        donePromise.done(function(data) {
            ok(true, 'backend ajax returns');
            equal(data, testData, 'backend ajax data correct');
        });

        var failPromise = IO.Backend.requestAsync('wdj://test/error');
        failPromise.fail(function() {
            ok(true, 'backend ajax error handled')
        });

        var combinedPromise = $.when(donePromise, failPromise);
        combinedPromise.then(function() {
            start();
        });

        setTimeout(function() {
            start();
            ok(false, 'async test timeout');
        }, timeoutTolerance);
    });

    asyncTest('io backend message event test', 2, function() {
        IO.Backend.requestAsync('wdj://test/streaming/echo', {
            data: testData
        });

        IO.Backend.bind('message', function(event) {
            start();
            ok(true, 'backend message event triggered');
            equal(event.data, testData, 'backend message event data correct');
        });

        setTimeout(function() {
            start();
            ok(false, 'async test timeout');
        }, timeoutTolerance);
    });

    asyncTest('io cloud ajax test', 3, function() {
        var donePromise = IO.Cloud.requestAsync('http://test.wandoujia.com/echo', {
            data: testData
        });
        donePromise.done(function(data) {
            ok(true, 'cloud ajax returns');
            equal(data, testData, 'cloud ajax data correct');
        });

        var failPromise = IO.Cloud.requestAsync('http://test.wandoujia.com/error');
        failPromise.fail(function() {
            ok(true, 'cloud ajax error is handled')
        });

        var combinedPromise = $.when(donePromise, failPromise);
        combinedPromise.then(function() {
            start();
        });

        setTimeout(function() {
            start();
            ok(false, 'async test timeout');
        }, timeoutTolerance);
    });

    asyncTest('io cloud message event test', 2, function() {
        IO.Cloud.requestAsync('http://test.wandoujia.com/streaming/echo', {
            data: testData
        });

        IO.Cloud.bind('message', function(event) {
            start();
            ok(true, 'backend message event triggered');
            equal(event.data, testData, 'backend message event data correct');
        });

        setTimeout(function() {
            start();
            ok(false, 'async test timeout');
        }, timeoutTolerance);
    });
});