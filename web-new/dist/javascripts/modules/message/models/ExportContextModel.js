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
                ids : []
            }
        });

        var exportContextModel = new ExportContextModel();

        return exportContextModel;
    });
}(this));
