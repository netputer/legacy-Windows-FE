
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
