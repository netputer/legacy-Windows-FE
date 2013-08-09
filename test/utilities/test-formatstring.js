require(['utilities/FormatString'], function(FormatString) {
    module('FormatString');
    
    test('Utilities/FormatString test', 2, function() {
        var testingString1 = '参数 {1}, 参数 {2}, 参数 {3}';
        
        equal(FormatString(testingString1, '猫', '狗', '猪'), '参数 猫, 参数 狗, 参数 猪', 'Replace arguments with index success.');
        
        var testingString2 = '参数 {cat}, 参数 {dog}, 参数 {pig}';

        equal(FormatString(testingString2, { cat : '猫', dog : '狗', pig : '猪'}), '参数 猫, 参数 狗, 参数 猪', 'Replace arguments with key name success.');
    });
});