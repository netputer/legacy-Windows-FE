require(['utilities/FilterFunction'], function(FilterFunction) {
    module('FilterFunction');
    
    test('filterfunction existence', 2, function() {
        ok(FilterFunction, 'FilterFunction exist');
        ok('generate' in FilterFunction, 'FilterFunction.generate');
    });
    
    test('operators existence', 7, function() {
        ok(typeof FilterFunction.operators[''] === 'function', 'default operator exists');
        ok(typeof FilterFunction.operators['eq'] === 'function', 'eq operator exists');
        ok(typeof FilterFunction.operators['ne'] === 'function', 'ne operator exists');
        ok(typeof FilterFunction.operators['lt'] === 'function', 'lt operator exists');
        ok(typeof FilterFunction.operators['lte'] === 'function', 'lte operator exists');
        ok(typeof FilterFunction.operators['gt'] === 'function', 'gt operator exists');
        ok(typeof FilterFunction.operators['gte'] === 'function', 'gte operator exists');
    });
});