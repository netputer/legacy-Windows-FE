require(['utilities/QueryString'], function(QueryString) {
    module('QueryString');
    
    test('querystring existence', 2, function() {
        ok(QueryString, 'QueryString exists');
        ok(QueryString.get, 'QueryString.get exists');
    });
    
    test('querystring get', 2, function() {
        if (!window.location.search) {
            ok(false, 'window.location.search is needed for this test case');
        }
        
        var firstKeyValueMatches = window.location.search.match(/\?([^=]*)=([^&]*)/);
        var firstKey = firstKeyValueMatches[1];
        var firstValue = decodeURIComponent(firstKeyValueMatches[2]);
        
        equal(QueryString.get(firstKey), firstValue, 'QueryString returns correct value for key "' + firstKey + '"');
        
        var lastKeyValueMatches = window.location.search.match(/[\?&]([^=]*)=([^&]*)$/);
        var lastKey = lastKeyValueMatches[1];
        var lastValue = decodeURIComponent(lastKeyValueMatches[2]);
        
        equal(QueryString.get(lastKey), lastValue, 'QueryString returns correct value for key "' + lastKey + '"');
    });
});
