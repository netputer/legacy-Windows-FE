require(['utilities/ValidateURL'], function(ValidateURL) {
    module('ValidateURL');
    
    test('Utilities/ValidateURL test', 11, function() {
        var testingURL1 = 'http://www.wandoujia.com';
        var testingURL2 = 'http://www.wandoujia.com/';
        var testingURL3 = 'http://www.wandoujia.com?param=1&param=2?param=3';
        var testingURL4 = 'https://www.wandoujia.com?param=1&param=2?param=3';
        var testingURL5 = 'ftp://www.wandoujia.com?param=1&param=2?param=3';
        var testingURL6 = 'ftp:/www.wandoujia.com?param=1&param=2?param=3';
        var testingURL7 = 'ftp/www.wandoujia.com?param=1&param=2?param=3';
        var testingURL8 = 'www.wandoujia.com?param=1&param=2?param=3';
        var testingURL9 = 'www.wandoujiaram=2?param=3';
        var testingURL10 = undefined;
        var testingURL11 = 'http://www.wandoujia.com#hash1#hash2';
        
        equal(ValidateURL(testingURL1), true, testingURL1);
        equal(ValidateURL(testingURL2), true, testingURL2);
        equal(ValidateURL(testingURL3), true, testingURL3);
        equal(ValidateURL(testingURL4), true, testingURL4);
        equal(ValidateURL(testingURL5), true, testingURL5);
        equal(ValidateURL(testingURL6), false, testingURL6);
        equal(ValidateURL(testingURL7), false, testingURL7);
        equal(ValidateURL(testingURL8), false, testingURL8);
        equal(ValidateURL(testingURL9), false, testingURL9);
        equal(ValidateURL(testingURL10), false, 'undefined');
        equal(ValidateURL(testingURL11), true, testingURL11);
        
    });
});