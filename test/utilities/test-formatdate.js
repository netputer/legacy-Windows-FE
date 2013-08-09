require(['utilities/FormatDate'], function(FormatDate) {
    module('FormatDate');
    
    test('Utilities/FormatDate test', 5, function() {
        var testingDate = '1332338478464';
        
        equal(FormatDate('yyyy/MM/dd', testingDate), '2012/03/21', 'Format date with current time');
        equal(FormatDate('MM/dd', testingDate), '03/21', 'Format date with current time');
        equal(FormatDate('MM/dd HH:mm', testingDate), '03/21 22:01', 'Format date with current time');
        equal(FormatDate('MM/dd hh:mm', testingDate), '03/21 10:01', 'Format date with current time');
        equal(FormatDate('MM/dd hh:mm:ss', testingDate), '03/21 10:01:18', 'Format date with current time');
       
    });
});