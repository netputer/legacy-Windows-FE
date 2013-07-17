/*global define*/
(function (window, undefined) {
    define([
        'backbone'
    ], function (
        Backbone
    ) {
        console.log('iTunesModel - File loaded');

        var iTunesModel = Backbone.Model.extend({
            default : {
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

        return iTunesModel;
    });
}(this));
