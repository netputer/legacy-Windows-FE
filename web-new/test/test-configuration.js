require(['Configuration'], function(Configuration) {
    module('Configuration');

    test('configuration existence', 2, function() {
        ok(Configuration, 'Configuration exists');
        ok(window.CONFIG, 'window.Configuration exists');
    });

    test('configuration frozen', 2, function() {
        /* this test is expected to fail silently or to throw an error */
        try {
            Configuration.nonexistence = 42;
            ok(!('nonexistence' in Configuration), 'writing to Configuration fails silently');
        } catch (error) {
            if (error.type === 'invalid_in_operator_use') {
                ok(true, 'writing to Configuration throws error');
            } else {
                throw error;
            }
        }

        try {
            Configuration.actions.nonexistence = 42;
            ok(!('nonexistence' in Configuration.actions), 'writing to window.CONFIG.action fails silently');
        } catch (error) {
            if (error.type === 'invalid_in_operator_use') {
                ok(true, 'writing to Configuration.actions throws error');
            } else {
                throw error;
            }
        }
    });
});
