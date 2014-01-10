require(['ui/TemplateFactory'], function(TemplateFactory) {
    module('TemplateFactory');
    
    test('TemplateFactory existence', 2, function() {
        ok(TemplateFactory, 'TemplateFactory exist');
        ok(TemplateFactory.get, 'TemplateFactory.get exist');
    });
});
