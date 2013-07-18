/*global console, define*/
(function (window, undefined) {
    define([
        'backbone'
    ], function (
        Backbone
    ) {

        console.log('iTunes ListContextModel - File Loaded');

        var ListContextModel = Backbone.Model.extend({
            defaults : {
                play_lists : []
            }
        });

        var listContextModel = new ListContextModel();

        return listContextModel;
    });
}(this));
