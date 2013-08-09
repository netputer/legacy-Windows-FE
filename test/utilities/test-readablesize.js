require(['utilities/ReadableSize'], function(ReadableSize) {
    module('ReadableSize');
    
    test('Utilities/ReadableSize test', 5, function() {
        var testingStr1 = '1024';
        var testingStr2 = 1024;
        var testingStr3 = 1024 * 1024;
        var testingStr4 = 1024 * 1024 * 1024;
        var testingStr5 = 1024 * 1024 * 1024 * 1024;
        
        equal(ReadableSize(testingStr1), '1 KB', testingStr1);
        equal(ReadableSize(testingStr2), '1 KB', testingStr2);
        equal(ReadableSize(testingStr3), '1 MB', testingStr3);
        equal(ReadableSize(testingStr4), '1 GB', testingStr4);
        equal(ReadableSize(testingStr5), '1 TB', testingStr5);
        
    });
});