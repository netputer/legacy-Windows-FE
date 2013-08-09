require(['BackendSocket'], function(BackendSocket) {
    module('BackendSocket');

    test('backendsocket existence', 10, function() {
        ok(BackendSocket, 'BackendSocket exist');

        var socket = new BackendSocket('wdjs://window/events');
        ok('readyState' in socket, 'backendSocket.readyState exists');
        ok('extensions' in socket, 'backendSocket.extensions exists');
        ok('protocol' in socket, 'backendSocket.protocol exists');
        ok('onopen' in socket, 'backendSocket.onopen exists');
        ok('onerror' in socket, 'backendSocket.onerror exists');
        ok('onclose' in socket, 'backendSocket.onclose exists');
        ok('onmessage' in socket, 'backendSocket.onmessage exists');
        ok(socket.close, 'backendSocket.close exists');
        ok(socket.send, 'backendSocket.send exists');
    });
});
