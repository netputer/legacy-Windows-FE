/*global console, define*/
(function (window) {
    define([
        'backbone'
    ], function (
        Backbone
    ) {

        console.log('Contact GroupManagerContextModel - File Loaded');

        var GroupManagerContextModel = Backbone.Model.extend({
            defaults : {
                del : [],
                rename : {}
            }
        });

        var groupManagerContextModel = new GroupManagerContextModel();

        return groupManagerContextModel;
    });
}(this));
