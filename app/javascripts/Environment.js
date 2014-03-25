/*global define*/
(function (window) {
    'use strict';

    define([
        'backbone',
        'jquery',
        'utilities/QueryString',
        'IO',
        'Configuration'
    ], function (
        Backbone,
        $,
        QueryString,
        IO,
        CONFIG
    ) {

        var Environment = Backbone.Model.extend({
            defaults : {
                deviceId : QueryString.get('device_id') || 'Default',
                pcId : QueryString.get('pcid') || '00',
                backendVersion : QueryString.get('version') || '2.0',
                locale : parseInt(QueryString.get('config'), 10) || CONFIG.enums.LOCALE_DEFAULT,
                source : QueryString.get('source') || '',
                search : window.location.search,
                internetBar : Boolean(parseInt(QueryString.get('internet_bar'), 10))
            },
            initialize : function () {
                if (this.get('deviceId') === 'Default') {
                    IO.requestAsync(CONFIG.actions.DEVICE_GET_UDID).done(function (resp) {
                        this.set({
                            deviceId : resp.body.value,
                            search : this.get('search').replace('device_id=Default', 'device_id=' + resp.body.value)
                        });

                        if (resp.body.value === 'Default') {
                            var handler = IO.Backend.onmessage({
                                'data.channel' : CONFIG.events.DEVICE_ID_CHANGE
                            }, function (data) {
                                IO.Backend.offmessage(handler);
                                this.set({
                                    deviceId : data.value,
                                    search : this.get('search').replace('device_id=Default', 'device_id=' + data.value)
                                });
                            }, this);
                        }
                    }.bind(this));
                }
            }
        });

        var environment = new Environment();

        $('body').addClass('locale-' + navigator.language.toLowerCase());

        window.Environment = environment;

        return environment;
    });
}(this));
