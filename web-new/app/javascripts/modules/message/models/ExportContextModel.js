/*global console, define*/
(function (window, undefined) {
    define([
        'backbone'
    ], function (
        Backbone
    ) {

        console.log('Message ExportContextModel - File Loaded');

        var ExportContextModel = Backbone.Model.extend({
            defaults : {
                ids : [],
                selectSmsCount: 0,
                allSms: 0
            }
        });

        var exportContextModel = new ExportContextModel();

        return exportContextModel;
    });
}(this));
