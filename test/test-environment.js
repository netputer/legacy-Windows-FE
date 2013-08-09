require(['Environment', 'utilities/QueryString'], function(Environment, QueryString) {
    module('Environment');

    test('environment existence', 3, function() {
        ok(Environment, 'Environment exists');
        ok(Environment.get('deviceId'), 'Environment.get(\'deviceId\') exists');
        ok(Environment.get('backendVersion'), 'Environment.get(\'backendVersion\') exists');
    });

    test('environment values', 2, function() {
        if (!QueryString.get('device_id')) {
            ok(false, 'device_id and device_name in querystring is needed for this test case');
        }

        equal(Environment.get('deviceId'), QueryString.get('device_id'), 'Environment.get(\'deviceId\') equals to device_id in querystring');
        equal(Environment.get('backendVersion'), '2.0', 'Environment.get(\'backendVersion\') equals to 2.0');
    });
});
