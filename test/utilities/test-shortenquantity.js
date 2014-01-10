require(['utilities/ShortenQuantity'], function(ShortenQuantity) {
    module('ShortenQuantity');
    
    test('Utilities/ShortenQuantity test', 1, function() {
        var testingQuantity = 234567;
        equal(ShortenQuantity(testingQuantity), '23 万', 234567);
    });
});