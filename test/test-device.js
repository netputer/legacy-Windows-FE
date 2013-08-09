require(['Device'], function(Device) {
    module('Device');
    
    test('device existence', 9, function() {
        ok(Device, 'Device exist');
        ok('isConnected' in Device, 'IO.isConnected exists');
        ok('isMounted' in Device, 'IO.isMounted exists');
        ok('hasSDCard' in Device, 'IO.hasSDCard exists');
        ok('isWifi' in Device, 'IO.isWifi exists');
        ok('SDKVersion' in Device, 'IO.SDKVersion exists');
        ok('productId' in Device, 'IO.productId exists');
        ok('isRoot' in Device, 'IO.isRoot exists');
        ok('deviceName' in Device, 'IO.deviceName exists');
    });
    
    test('device change event', 1, function() {
        ok(false, 'Device.onchange to be tested');
    });
});