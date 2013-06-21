/**
 * @fileoverview 
 * @author lixiaomeng@wandoujia.com
 */
wonder.addModule('video/item', function(W){
    W.namespace('wonder.video');

    function VideoItem(data){
        this.data = data;
        W.ui.UIBase.call(this);
    }
    W.extend(VideoItem, W.ui.UIBase);

    VideoItem.Events = {
        SELECT : 'videoItemSelect',
        UNSELECT : 'videoItemUnselect',
        REMOVE : 'videoItemRemove'
    };

    W.mix(VideoItem.prototype, {
       getThumbnail: function(){
            var self = this;
            var id = this.data.id;

            this.request = {
                id: id,
                item: this,
                sending: false,
                isSuccessed: false,
                isIgnore: false,
                send: function(){
                    this.sending = true;
                    
                    W.video.videoCollection.getVideoThumbnail(id, function(response){
                        if(response.state_code == 200){
                             this.request.isSuccessed = true;
                             var imgEl = this._element.find('img');
                             imgEl.attr('src', 'file:///' + response.body.value);
                        }else{
                            this.request.isSuccessed = false;
                        }
                        this.request.sending = false;
                    }, self)
                }
            };
            
           
            W.video.videoRequestList.push(this.request);
        },

        removeItem: function(){
            this._element.unbind().remove();
            this.trigger(VideoItem.Events.REMOVE, this.data.id);
        },

        toggle: function(){
            var checked = this._element.hasClass('checked');
            !checked ? this.select() : this.unSelect();
        },
        
        select: function(){
            if(this._element.children('input:visible').length == 0){
                return ;
            }
            this._element.children('input').prop('checked', true);
            this._element.addClass('checked');
            this.trigger(VideoItem.Events.SELECT, this.data.id);
        },
        
        unSelect: function(){
            this._element.children('input').prop('checked', false);
            this._element.removeClass('checked');
            this.trigger(VideoItem.Events.UNSELECT, this.data.id);
        },
        
        setVisibility: function(visibiliy){
            var el = this._element;
            visibiliy ? el.removeClass('wd-invisible') : el.addClass('wd-invisible');
        },

        render : function(parent) {
            var self = this;
            if(!this.rendered){
                var tpl = W.Template.get('video', 'video_item');
                
                this._element = $(tpl);
                this._element.appendTo(parent);
                this._element.find('.w-video-item-mask').attr('data-id', self.data.id);
                
                this._element.click(function(e){
                    var target = e.target;
                    if(target.tagName.toLowerCase() == 'input'){
                        self.toggle();
                        if(target.checked){
                            W.video.videoContent.showAllCheckbox();
                        }else if(!W.video.videoContent.hasCheckedbox()){
                            W.video.videoContent.hideAllCheckbox();
                        }
                    }
                });

                this.data.bind(VideoItem.Events.REMOVE, function(){
                    self.removeItem();
                });

                this.rendered = true;
            }
            this.getThumbnail();
        }
    });

    W.video.VideoItem = VideoItem;
    W.video.videoRequestList = new W.RequestList();

});
wonder.useModule('video/item');
