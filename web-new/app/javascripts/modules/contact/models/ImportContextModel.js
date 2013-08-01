/*global console, define*/
(function (window) {
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
        console.log('ImportContextModel - File loaded.');

        var ImportContextModel = Backbone.Model.extend({
            defaults : {
                files : '',
                accountId : ''
            }
        });

        var importContextModel = new ImportContextModel();

        return importContextModel;
    });
}(this));
