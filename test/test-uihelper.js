require(['ui/UIHelper'], function(UIHelper) {
    module('UIHelper');
    
    test('UIHelper existence', 4, function() {
        ok(UIHelper, 'UIHelper exist');
        ok(window.UIHelper, 'window.UIHelper exists');
        ok(UIHelper.EventsMapping, 'UIHelper.EventsMapping exists');
        ok(UIHelper.KeyMapping, 'UIHelper.KeyMapping exists');
    });
    
    asyncTest('UIHelper.Mouse test', 4, function() {
        document.addEventListener('mousemove', function(evt) {
            ok(UIHelper.MouseState, 'UIHelper.MouseState exist');
            ok('x' in UIHelper.MouseState, 'UIHelper.MouseState.x exist');
            ok('y' in UIHelper.MouseState, 'UIHelper.MouseState.y exist');
            ok(UIHelper.MouseState.currentElement, 'UIHelper.MouseState.currentElement exist');
            document.removeEventListener('mousemove', arguments.callee);
            start();
        });
    });
});