require(['utilities/ConditionalEscape'], function(ConditionalEscape) {
    module('ConditionalEscape');
    
    test('Utilities/ConditionalEscape test', 4, function() {
        var testingStr1 = '<div class="div"></div>';
        var testingStr2 = '<em></em>';
        equal(ConditionalEscape(testingStr1, 'em'), '&lt;div class=&quot;div&quot;&gt;&lt;/div&gt;', testingStr1);
        equal(ConditionalEscape(testingStr2, 'em'), '<em></em>', testingStr2);
        equal(ConditionalEscape(testingStr1, 'div'), '<div class="div"></div>', testingStr1);
        equal(ConditionalEscape(testingStr1), '&lt;div class=&quot;div&quot;&gt;&lt;/div&gt;', testingStr1);
    });
});