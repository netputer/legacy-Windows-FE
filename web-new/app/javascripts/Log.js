/*global define, console*/
/**
 * @author wangye.zhao@wandoujia.com
 * @doc https://github.com/wandoulabs/engineering-documents/wiki/%5BClient%5D-Log.js
 */
(function (window, undefined) {
    define(['Configuration'], function (CONFIG) {
        console.log('Log - File loaded.');

        var Log = function (data) {
            var logSwitch = true;
            if (logSwitch) {
                data = data || {};

                var url = CONFIG.actions.SEND_LOG;
                var datas = [];
                var d;
                for (d in data) {
                    if (data.hasOwnProperty(d)) {
                        datas.push(d + '=' + window.encodeURIComponent(data[d]));
                    }
                }
                url += '?' + datas.join('&');

                window.OneRingRequest('get', url, '', function (resp) {
                    resp = JSON.parse(resp);
                    if (resp.state_code === 200) {
                        console.log('Log: ', url);
                    }
                });
            }
        };

        // Exposure this function to global
        window.log = Log;

        return Log;
    });
}(this));