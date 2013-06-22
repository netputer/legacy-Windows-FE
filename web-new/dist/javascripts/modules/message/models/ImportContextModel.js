/*global console, define*/
(function (window, undefined) {
    define([
        'backbone',
        'doT',
        'jquery',
        'underscore'
    ], function (
        Backbone,
        doT,
        $,
        _
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
