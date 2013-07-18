/*global define*/
(function (window, undefined) {
    define([
        'backbone'
    ], function (
        Backbone
    ) {
        console.log('ITunesModel - File loaded');

        var ITunesModel = Backbone.Model.extend({
            defaults : {
                duration : '',
                format : '',
                id: '',
                path : '',
                sizeText : '',
                size : 0,
                title : '',
                artist : '',
                album : ''
            }
        });

        return ITunesModel;
    });
}(this));
