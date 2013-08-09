/*global define*/
(function (window) {
    define([
        'backbone'
    ], function (
        Backbone
    ) {
        console.log('iTunesModel - File loaded');

        var ITunesListModel = Backbone.Model.extend({
            defaults : {
                name : '',
                size : '',
                tracks_count : '',
                tracks_id : [],
                visible : true
            }
        });

        return ITunesListModel;
    });
}(this));
