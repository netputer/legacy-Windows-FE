require(['Settings', 'Environment'], function(Settings, Environment) {
    module('Settings');
    
    test('settings existence', 5, function() {
        ok(Settings, 'Settings exists');
        ok(Settings.get, 'Settings.get exists');
        ok(Settings.set, 'Settings.set exists');
        ok(Settings.remove, 'Settings.remove exists');
        ok(Settings.clear, 'Settings.clear exists');
    });
    
    test('device settings read and write', 1, function() {
        ok(false, 'inversion of control is needed for this test case');
    });
    
    test('global settings read and write', 1, function() {
        ok(false, 'inversion of control is needed for this test case');
    });
});
