/**
 * @fileoverview video content
 * @author lixiaomeng@wandoujia.com
 */
wonder.addModule('video/content', function(W){
    W.namespace('wonder.video');
    var locale = i18n.video;
    var progressWin = new W.ui.Progress({className : 'w-video-play-loading', mask: false});

    function VideoContent(){
        this._threads = [];
        W.ui.UIBase.call(this);
    }
    W.extend(VideoContent, W.ui.UIBase);

        playVideo: function(video_id){
            var self = this;
            var parentEl = self._element.parent('.w-video-content-wrapper');
            var sessionId
                = self.lastSessionId
                = progressWin.start(0, 100, locale.PLAY_VIDEO_TEXT, locale.PLAY_VIDEO_SUCCESS,'','','', parentEl);
            progressWin.view.setDelimiter('%');
            progressWin.view.hideMax();
            W.video.videoCollection.play(video_id, sessionId, function(response){
                progressWin.hide();

                if(response.state_code == 500){
                    alert(locale.PLAY_DISCONNECT);
                }else if(response.state_code == 400){
                    var text;
                    if(progressWin.getCurrent() == 100){
                        var video_data = W.video.videoCollection.getVideoById(video_id);
                        var video_arry = video_data.display_name.split('.');
                        var video_type = video_arry[video_arry.length - 1];
                        text = window.StringUtil.format(locale.PLAY_NO_PLAYER, video_type.toUpperCase());
                    }else{
                        text = locale.PLAY_CANNOT_READ;
                    }
                    alert(text);
                }

            }, self);
        },

        render: function(parent){
            var self = this;
            if(!this.rendered){
                this._element = $('<div/>').addClass('w-video-content');
                this._element.appendTo(parent);

                this._element.delegate('.w-video-item-mask', 'click', function(e){
                    var target = $(e.target);
                    var video_id = target.attr('data-id');

                    if(self.lastSessionId){
                        W.video.videoCollection.cancelPlay(self.lastSessionId, video_id, self.playVideo, self);
                    }else{
                        self.playVideo(video_id);
                    }

                }).delegate('.w-video-item-mask', 'mouseover', function(e){

                    var offset = $(this).offset();
                    var position = {
                        left : offset.left - 150,
                        top  : offset.top + 40
                    };
                    var target = $(e.target);
                    var video_id = target.attr('data-id');
                    var video_data = W.video.videoCollection.getVideoById(video_id);

                    var data = {};
                    data.name = video_data.display_name;
                    data.size = W.String.readableSize(video_data.size);
                    data.duration = W.timer().formatTimerFromMillisecond(video_data.duration);

                    self.showVideoInfo(data, position);

                }).delegate('.w-video-item-mask', 'mouseout', function(e){
                    self.hideVideoInfo();
                });

                Device.on('change:hasSDCard', function(Device){
                    var tipText = '';
                    if(!Device.get('hasSDCard')){
                        tipText =  i18n.misc.NO_SD_CARD_TIP_TEXT;
                        this.showTip(tipText);
                    }if(this._threads.length <= 0){
                        tipText = locale.NO_VIDEOS_TEXT;
                        this.showTip(tipText);
                    }

                }, this);

                $(document).bind('keydown', function(e){
                   if(e.which === 27){ // Esc is pressed
                        W.video.videoCollection.cancelPlay(self.lastSessionId, '', function(){
                            progressWin.hide();
                        }, self);
                   }
                });
                this.rendered = true;
            }
        }
    });

    W.video.VideoContent = VideoContent;
});
wonder.useModule('video/content');
