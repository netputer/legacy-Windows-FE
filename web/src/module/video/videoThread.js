/**
 * @fileoverview video thread
 * @author lixiaomeng@wandoujia.com
 */
wonder.addModule('video/thread', function(W){
    W.namespace('wonder.video');
    var locale = i18n.video;
    
    function VideoThread(threadData, threadName){
        this.data = threadData;
        this.name = threadName;
        this.items = [];
        W.ui.UIBase.call(this); 
    }

    W.extend(VideoThread, W.ui.UIBase);
    
    VideoThread.Events = {
        SELECT : 'videoThreadSelect',
        UNSELECT : 'videoThreadUnselect'  
    };
    
    W.mix(VideoThread.prototype, {
        _init : function () {
            var self = this;

            self.setThreadTitle(this.name);

            var videoItem;
            _.each(self.data, function(videoData) {
                
                W.mix(videoData, W.events);
                videoItem = new W.video.VideoItem(videoData);
                
                videoItem.bind( W.video.VideoItem.Events.SELECT, function(id){
                    self.trigger( W.video.VideoItem.Events.SELECT, id);
                    self.resetCheckbox();
                });

                videoItem.bind( W.video.VideoItem.Events.UNSELECT, function(id){
                    self.trigger( W.video.VideoItem.Events.UNSELECT, id);
                    self.resetCheckbox();
                });

                videoItem.bind(W.video.VideoItem.Events.REMOVE, function(id){
                   self.removeItem(id);
                 });

                self.addItem(videoItem);
            });
        },

        addItem : function(videoItem){
            videoItem.render(this._element.find('.w-video-thread-items'));
            this.items.push(videoItem);
        },

        removeItem: function(id){
            for(var i=0; i < this.items.length; i++){
                if(this.items[i].data.id == id){
                    this.items.splice(i, 1);
                }
            }
            this.resetCheckbox();
            if(this.items.length <= 0){
                this.remove();
            }
        },

        remove: function(){
            this._element.unbind().remove();
        },

        setThreadTitle : function(title) {
            this._element.find('.w-video-thread-title b').text(title);
        },

        resetCheckbox: function(){
            var checkedSize = this._element.find('dd>div.checked').length;
            var totalSize = this.items.length;
            this.setChecked((checkedSize == totalSize) && (totalSize > 0));
        },

        setChecked : function(checked) {
            this._checkbox.prop('checked', checked);
        }, 

        selectAll: function(){
            _.each(this.items, function(item){
                item.select();
            }, this);
            this.setChecked(true);
        },

        unSelectAll: function(){
            _.each(this.items, function(item){
                item.unSelect();
            }, this);
            this.setChecked(false);
        },

        render : function(parent) {
            var self = this;
            if(!this.rendered){
                this._element = $(W.Template.get('video', 'video_thread'));
                this._element.appendTo(parent);
                this._init();

                this._checkbox = this._element.find('.w-video-thread-checkbox');
                this._element.click(function(e){
                    var target = e.target;
                    if($(target).hasClass('w-video-thread-checkbox')){
                        if(target.checked){
                            self.selectAll();                      
                        }else{
                            self.unSelectAll();
                        }
                    }
                    
                });
                this.rendered = true;
            }
        } 
    });
    W.video.VideoThread = VideoThread;
});
wonder.useModule('video/thread');
