require(['Internationalization'], function(Internationalization) {
    module('Internationalization');
    
    test('Internationalization', 1, function() {
        _.each(Internationalization, function(module) {
            _.each(module, function(value) {
                //console.debug(value);
            });
        });
    });
});