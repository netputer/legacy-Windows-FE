/*global define*/
(function (window, undefined) {
    define([
        'backbone'
    ], function (
        Backbone
    ) {
        console.log('iTunesModel - File loaded');

        var iTunesListModel = Backbone.Model.extend({
            default : {
                name : '',
                size : '',
                tracks_count : '',
                tracks_id : [],
                visible : true
            }
        });

        return iTunesListModel;
    });
}(this));
