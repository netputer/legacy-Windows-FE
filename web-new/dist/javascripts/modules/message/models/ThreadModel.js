/*global define*/
(function (window, undefined) {
    define(['backbone'], function (Backbone) {
        console.log('ThreadModel - File loaded.');

        var ThreadModel = Backbone.Model.extend();

        return ThreadModel;
    });
}(this));