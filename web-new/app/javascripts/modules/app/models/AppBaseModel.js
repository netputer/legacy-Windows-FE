/*global define*/
(function (window) {
    'use strict';

    define(['backbone'], function (Backbone) {
        console.log('AppBaseModel - File loaded.');

        var AppBaseModel = Backbone.Model.extend({
            defaults : {
                web_info : {
                    categories : [],
                    likeCount : 0,
                    dislikeCount : 0,
                    likeRate : 0
                }
            }
        });

        return AppBaseModel;
    });
}(this));
