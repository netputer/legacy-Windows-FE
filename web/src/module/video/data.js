/**
 * @fileoverview
 * @author lixiaomeng@wandoujia.com
 */
wonder.addModule('video/dataCollection', function(W) {
    W.namespace('wonder.video');
    var alert = new W.ui.Dialog(i18n.common.DIALOG_TIP);
    alert.setButtonSet(W.ui.Dialog.ButtonSet.OK);

    function VideoCollection() {
        this.initialize();
    }


    VideoCollection.Events = {
        UPDATE : 'update',
        REMOVE : 'remove',
        SYNC_FAILED : 'syncFailed'
    };

    W.mix(VideoCollection.prototype, W.events);

    W.mix(VideoCollection.prototype, {
        cacheList : {},

        initialize : function() {
            IO.Backend.Device.onmessage({
                'data.channel' : CONFIG.events.VIDEO_UPDATED
            }, function(data) {
                console.log('Video - Video list update success.');
                if(!!data) {
                    this.trigger(VideoCollection.Events.UPDATE);
                }
            }, this);
        },

        getVideoThumbnail : function(id, callback, scope) {
            W.ajax({
                url : CONFIG.actions.VIDEO_THUMBNAIL,
                data : {
                    video_id : id
                },
                success : function(response) {
                    response = JSON.parse(response);
                    callback && callback.call(scope, response);
                }
            });
        },

        getCacheList : function() {
            return this.cacheList;
        },

        getVideoItemList : function() {
            var videoItemList = [];

            for(var i in this.cacheList) {
                _.each(this.cacheList[i], function(data) {
                    videoItemList.push(data);
                });
            }
            return videoItemList;
        },

        getVideoThreadList : function(callback) {
            var self = this;
            W.ajax({
                url : CONFIG.actions.VIDEO_SHOW,
                success : function(response) {
                    try {
                        response = JSON.parse(response);
                    } catch(e) {
                        console.error('get List error: please check if backend response:', response);
                    }
                    if(!!response.body) {
                        self.cacheList = response.body;
                    }
                    callback && callback.call(this, response);
                }
            });
        },

        sync : function(callback) {
            W.ajax({
                url : CONFIG.actions.VIDEO_SYNC,
                success : function(response) {
                    try {
                        response = JSON.parse(response);
                    } catch(e) {
                        console.error('get List error: please check if backend response:', response);
                    }
                    callback && callback.call(this, response);
                }
            });
        },

        getVideoById : function(id) {
            var list = this.getVideoItemList();
            for(var i = 0, len = list.length; i < len; i++) {
                if(list[i].id === id) {
                    return list[i];
                }
            }

            return null;
        },

        removeVideoById : function(id) {
            var self = this;
            var list = this.cacheList;
            var videoArry = [];
            for(var i in list) {
                videoArry = list[i];
                _.each(videoArry, function(videoData, index) {
                    if(videoData.id === id) {
                        self.trigger(VideoCollection.Events.REMOVE, videoArry.splice(index, 1)[0]);
                    }
                });
            }

        },

        getVideoPath : function(id, callback) {
            W.ajax({
                url : CONFIG.actions.VIDEO_LOAD,
                data : {
                    video_id : id
                },
                success : callback
            });
        },

        getVideosFromPC : function(type, callback, scope) {
            W.ajax({
                url : CONFIG.actions.VIDEO_SELECT_VIDEO,
                data : {
                    type : type
                },
                success : function(response) {
                    response = JSON.parse(response);
                    callback && callback.call(scope, response);
                }
            });
        },

        importVideo : function(videoList, sessionId, callback, scope) {
            W.ajax({
                url : CONFIG.actions.VIDEO_IMPORT,
                data : {
                    file_path_list : videoList,
                    session : sessionId
                },
                success : function(response) {
                    response = JSON.parse(response);
                    callback && callback.call(scope, response);
                }
            });
        },

        play : function(videoId, sessionId, callback, scope) {
            W.ajax({
                url : CONFIG.actions.VIDEO_PLAY,
                data : {
                    video_id : videoId,
                    session : sessionId
                },
                success : function(response) {
                    response = JSON.parse(response);
                    callback && callback.call(scope, response);
                }
            });
        },

        cancelPlay : function(sessionId, videoId, callback, scope) {
            W.ajax({
                url : CONFIG.actions.VIDEO_CANCEL,
                data : {
                    session : sessionId
                },
                success : function(response) {
                    response = JSON.parse(response);
                    if(response.state_code === 200) {
                        callback && callback.call(scope, videoId);
                    }
                }
            });
        }
    });
    W.video.VideoCollection = VideoCollection;
});
wonder.useModule('video/dataCollection');
