/*global define*/
(function (window) {
    define([
        'backbone',
        'jquery',
        'IO',
        'Configuration'
    ], function (
        Backbone,
        $,
        IO,
        CONFIG
    ) {
        console.log('VideoModel - File loaded. ');

        var VideoModel = Backbone.Model.extend({
            getThumbnailAsync : function () {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.VIDEO_THUMBNAIL,
                    data : {
                        video_id : this.id
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            this.set({
                                error : false,
                                thumb : 'file:///' + resp.body.value
                            });
                            deferred.resolve(resp);
                        } else {
                            this.set('error', true);
                            deferred.reject(resp);
                        }
                    }.bind(this)
                });

                return deferred.promise();
            }
        });

        return VideoModel;
    });
}(this));
