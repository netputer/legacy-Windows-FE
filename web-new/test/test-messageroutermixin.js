require(['IO', 'MessageRouterMixin'], function(IO, MessageRouterMixin) {
    module('MessageRouterMixin');
    
    test('MessageRouterMixin existence', 3, function() {
        ok(MessageRouterMixin.mixin, 'MessageRouterMixin.mixin exist');
        
        ok(IO.onmessage, 'MessageRouterMixin.onmesage exist');
        ok(IO.offmessage, 'MessageRouterMixin.offmessage exist');
    });
    
    test('MessageRouterMixin function test', 3, function() {
        ok(IO.onmessage({
            'data.channel' : 'test'
        }), 'Reg message success.');
        
        ok(IO.onmessage({
            'source' : 'cloud',
            'data.channel' : 'test'
        }), 'Reg message with source param success.');
        
        raises(IO.onmessage({ 'source' : 'test' }), 'Unsupported reg failed.');
    });
});