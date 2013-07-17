/*global define*/
(function (window) {
    define([
        'backbone'
    ], function (
        Backbone
    ) {

        console.log('Message ImportContextModel - File Loaded');

        var ImportContextModel = Backbone.Model.extend({
            defaults : {
                files : ''
            }
        });

        var importContextModel = new ImportContextModel();

        return importContextModel;
    });
}(this));
