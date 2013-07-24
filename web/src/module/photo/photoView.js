/**
 * @fileoverview
 * @author jingfeng@wandoujia.com
 */

wonder.addModule('photo/photoView', function(W) {
    W.namespace('wonder.photo');

    var lastSelectItemId = null;
    var locale = i18n.photo;
    W.photo.phoneRequestList = new W.RequestList();
    W.photo.libraryRequestList = new W.RequestList();

    /**
     * @constructor ThreadView
     */
    function ThreadView(thread, type, index, globalCheckboxStatus) {
        this._data = thread;
        this._items = [];
        this._type = type;
        this._index = index;
        this.checkboxStatus = globalCheckboxStatus;
        W.ui.UIBase.call(this);
    }


    W.extend(ThreadView, W.ui.UIBase);

    ThreadView.Events = {
        SELECT : 'selectForToolbar',
        UNSELECT : 'unselectForToolbar',
        IGNORE : 'ignore'
    };

    W.mix(ThreadView.prototype, {
        _init : function() {
            var self = this;
            var title;
            if(this._data.key.indexOf('/') > -1) {
                var tmpArray = this._data.key.split('/');
                title = tmpArray[tmpArray.length - 2];
            } else {
                var tmpTitle = this._data.key.replace(/[\\]$/, '');
                tmpTitle = tmpTitle.replace(/^.*[\\]/, '');
                title = tmpTitle;
            }
            this.setTitle(title);

            this._data.path = this._data.key;
            this._data.isIgnore = this._data.is_ignore || false;

            this.setIgnoreBtn(this._data.isIgnore);
            this._data.isIgnore && this.hidePhotoItems();

            this.buildPhotoItem(this._data.photo_info);

        },
        buildPhotoItem : function(photosInfo, needPushData) {
            var self = this;

            if(needPushData) {
                this._data.photo_info = this._data.photo_info.concat(photosInfo);
            }

            _.each(photosInfo, function(photoInfo) {
                W.mix(photoInfo, W.events);

                var item = new PhotoItem(photoInfo, this._type, this._data.isIgnore, this.checkboxStatus);
                item.bind(PhotoItem.Events.PLAY, function(id) {
                    self.trigger(PhotoItem.Events.PLAY, id);
                });
                item.bind(PhotoItem.Events.SELECT, function(id, status) {
                    self.trigger(PhotoItem.Events.SELECT, id, status);
                    self.resetCheckbox();
                });
                photoInfo.bind('remove', function() {
                    self.removeItem(item);
                });

                photoInfo.bind(W.photo.PhotoItem.Events.REFRESH, function(id, orientation) {
                    self.refreshThumbnail(item, orientation);
                });
                photoInfo.bind(PhotoItem.Events.SELECT, function(status) {
                    if(status) {
                        item.select();
                    } else {
                        item.unSelect();
                    }
                });

                this.addItem(item);
            }, this);
        },
        setTitle : function(title) {
            this._element.find('.w-photo-title').text(title);
        },
        setIgnoreBtn : function(isIgnore) {
            var showText = isIgnore ? locale.THREAD_DISPLAY_SHOW : locale.THREAD_DISPLAY_HIDDEN;
            var ignoreBtn = this._element.find('.w-photo-ignore');
            ignoreBtn.text(showText);

            if(this._type === W.photo.PhotoCollection.type.PHONE) {
                ignoreBtn.hide();
                ignoreBtn.addClass('w-photo-phone-ignore');
            }
        },
        addItem : function(photoItem) {
            photoItem.render(this._element.find('.w-photo-items'));
            this._items.push(photoItem);
        },
        removeItem : function(photoItem) {
            for(var i = 0; i < this._items.length; i++) {
                if(this._items[i] == photoItem) {
                    this._items.splice(i, 1);
                    photoItem.remove();
                }
            }
            this.resetCheckbox();
            if(this._items.length <= 0) {
                this.remove();
            }
        },
        refreshThumbnail : function(item, orientation) {
            item.rotate(orientation);
        },
        resetCheckbox : function() {
            var checkedSize = this._element.find('.checked').length;
            var totalSize = this._items.length;
            var isChecked = (checkedSize == totalSize) && (totalSize > 0);
            this.setChecked(isChecked);
        },
        setChecked : function(checked) {
            this._checkbox.prop('checked', checked);
        },
        selectAll : function() {
            _.each(this._items, function(item) {
                item.setCheckboxSelect();
            }, this);
            this.setChecked(true);

            var photoList = W.photo.photoCollection.getPhotoListByThreadKeyAndType(this._data.key, this._type);
            this.trigger(ThreadView.Events.SELECT, _.pluck(photoList, 'id'));
        },
        unSelectAll : function() {
            _.each(this._items, function(item) {
                item.setCheckboxUnSelect();
            }, this);
            this.setChecked(false);

            var photoList = W.photo.photoCollection.getPhotoListByThreadKeyAndType(this._data.key, this._type);
            this.trigger(ThreadView.Events.UNSELECT, _.pluck(photoList, 'id'));
        },
        remove : function() {
            this._element.unbind().remove();
        },
        setItemIgnore : function(isIgnore) {
            _.each(this._items, function(item) {
                item.setIgnore(isIgnore);
            });
        },
        showPhotoItems : function() {
            this._element.find('.w-photo-items').show();

            var requestList = [];
            if(this._type === W.photo.PhotoCollection.type.PHONE) {
                requestList = W.photo.phoneRequestList;
            } else if(this._type === W.photo.PhotoCollection.type.LIBRARY) {
                requestList = W.photo.libraryRequestList;
            }
            _.each(this._items, function(photoItem) {
                if(!photoItem.getIsRequested()) {
                    requestList._list.unshift(photoItem.getRequest());
                }
            });
            requestList.sendRequest(0, this._items.length);
        },
        hidePhotoItems : function() {
            this._element.find('.w-photo-items').hide();
        },
        ignoreThread : function() {
            var self = this;
            var url = self._data.isIgnore ? CONFIG.actions.PHOTO_UNIGNORE_FOLDER : CONFIG.actions.PHOTO_IGNORE_FOLDER;

            W.ajax({
                type : 'GET',
                url : url,
                data : {
                    folder : self._data.path
                },
                success : function(response) {
                    response = JSON.parse(response);
                    if(response.state_code == 200) {

                        self._data.isIgnore = !self._data.isIgnore;
                        self.setItemIgnore(self._data.isIgnore);
                        self.setIgnoreBtn(self._data.isIgnore);
                        W.photo.photoCollection.updateCacheThreadIgnoreByKey(self._data.path, self._data.isIgnore);

                        if(self._data.isIgnore) {
                            self.hidePhotoItems();
                            W.photo.page.insertThreadsFromUnbuildThread(self._items.length);
                        } else {
                            self.showPhotoItems();
                            W.photo.page.updateContentWrapperSize();
                        }
                        self.trigger(ThreadView.Events.IGNORE);
                    } else {
                        // to do Fail
                    }
                }
            });
        },
        getKey : function() {
            return this._data.key;
        },
        getIsIgnore : function() {
            return this._data.isIgnore;
        },
        getHeight : function() {
            return this._element.height();
        },
        render : function(opt_parent) {
            if(!this._isRendered) {
                var self = this;
                this._element = $(W.Template.get('photo', 'photo_thread'));
                this._element.appendTo(opt_parent);

                this._checkbox = this._element.find('.w-photo-thread-checkbox');
                this._checkbox.bind('click', $.proxy(function(e) {
                    if(e.target.checked) {
                        this.selectAll();
                    } else {
                        this.unSelectAll();
                    }
                }, this));

                this._ignoreBtn = this._element.find('.w-photo-ignore');
                this._ignoreBtn.bind('click', function() {
                    self.ignoreThread();
                });

                this._isRendered = true;
                this._init();
                this._element.find('.w-photo-thread-title').attr('data-path', this._data.path);

                this.setChecked(this.checkboxStatus);
            }
        }
    });

    /**
     * @constructor PhotoItem
     */
    function PhotoItem(data, type, isIgnore, checkboxStatus) {
        this._data = data;
        this._type = type;
        this._data._type = type;
        this.checkboxStatus = checkboxStatus;
        this.isIgnore = isIgnore;
        W.ui.UIBase.call(this);
    }


    W.extend(PhotoItem, W.ui.UIBase);
    PhotoItem.Events = {
        PLAY : 'play',
        SELECT : 'select',
        WALLPAPER : 'setwallpaper',
        REFRESH : 'refresh'
    };

    W.mix(PhotoItem.prototype, {
        _init : function() {

        },
        doCallbak : function(e) {
            var self = this;
            var target = $(e.target);
            if(target.hasClass('w-photo-item-thumbnail-share') ||
            	target.hasClass('icon')) {
                target.prop('disabled', true);

                this.getBigPicture(function(response) {
                    var previewContentSize = socialService.getPreviewContentSize();

                    var previewImg = $('<img/>').attr('src', 'file:///' + response.path + ' ?date= ' + new Date().getTime())
                                                .css({
                                                    'max-width' : previewContentSize.width,
                                                    'max-height': previewContentSize.height
                                                });
                    var rotation;
                    switch(self._data.orientation){
                        case 0 :
                            rotation = 0;
                        break;
                        case 3 :
                        case 90:
                            previewImg.addClass('turn-right')
                            rotation = 3;
                        break;
                        case 2 :
                        case 180:
                            previewImg.addClass('turn-down')
                            rotation = 2;
                        break;
                        case 1 :
                        case 270:
                            previewImg.addClass('turn-left')
                            rotation = 1;
                        break;
                    }
                    var data = {
                        hasPreview : true,
                        previewContent : previewImg,
                        shareData : {
                            need_shell : 0,
                            pic        : response.path,
                            rotation   : rotation
                        },
                        type : CONFIG.enums.SOCIAL_PHOTO,
                        size : this._data.size,
                        shareCallback : function(){
                            window.Sync.PhotoSyncView.getInstance().tryToShowPhotoSyncAlertView();
                        }
                    };

                    socialService.show(data);
                });

                target && target.prop('disabled', false);
            } else if(e.target.tagName.toLowerCase() == 'input') {
                this.toggle();
                if(e.target.checked) {
                    W.photo.photoItemColletion.showAllItemCheckbox();
                } else if(!W.photo.photoItemColletion.hasCheckedBox()) {
                    W.photo.photoItemColletion.hideAllItemCheckbox();
                }

                if(e.shiftKey && lastSelectItemId !== null) {
                    W.photo.photoItemColletion.setCheckedBox(this._data.id, lastSelectItemId, e.target.checked);
                }
                lastSelectItemId = this._data.id;
            } else {
                this.playPic();
            }
        },
        getBigPicture : function(callback) {
            var self = this;
            W.photo.progressBar.add();
            W.ajax({
                url : CONFIG.actions.PHOTO_GET,
                data : {
                    photo_id : self._data.id
                },
                success : function(response) {
                    W.photo.progressBar.remove();
                    response = JSON.parse(response);
                    if(response.state_code === 200) {
                        callback.call(self, response.body);
                    } else {
                        alert(i18n.photo.GET_PHOTOS_ERROR);
                    }
                }
            });
        },
        toggle : function() {
            var checked = this._element.hasClass('checked'); !checked ? this.select() : this.unSelect();
        },
        setCheckboxSelect : function() {
            if(this._element.children('input:visible').length == 0) {
                return;
            }
            this._element.children('input').prop('checked', true);
            this._element.addClass('checked');
        },
        setCheckboxUnSelect : function() {
            this._element.children('input').prop('checked', false);
            this._element.removeClass('checked');
        },
        select : function() {
            this.setCheckboxSelect();
            this.trigger(PhotoItem.Events.SELECT, this._data.id, true);
        },
        unSelect : function() {
            this.setCheckboxUnSelect();
            this.trigger(PhotoItem.Events.SELECT, this._data.id, false);
        },
        setIgnore : function(isIgnore) {
            this.isIgnore = isIgnore;
            this.request.isIgnore = isIgnore;
        },
        getThumbnail : function() {
            var self = this;
            var id = this._data.id;

            this.request = {
                id : id,
                item : this,
                sending : false,
                isSuccessed : false,
                isIgnore : self.isIgnore,
                supportSendList : false,
                send : function() {
                    this.sending = true;
                    W.ajax({
                        url : CONFIG.actions.PHOTO_THUMBNAIL,
                        data : {
                            photo_id : id
                        },
                        success : function(response) {
                            response = JSON.parse(response);
                            if(response.state_code == 200) {
                                self.request.isSuccessed = true;
                                self.request.setThumbnail.call(self, response.body.value);
                            } else {
                                self.request.isSuccessed = false;
                            }
                            self.request.sending = false;
                        }
                    });
                },
                setThumbnail : function(source) {
                    var imgEl = self._element.find('img');
                    imgEl.attr('src', 'file:///' + source);
                }
            };

            if(!this.isIgnore) {
                if(this._type === 1) {
                    W.photo.phoneRequestList.push(this.request);
                } else if(this._type == 2) {
                    W.photo.libraryRequestList.push(this.request);
                }
            }

        },
        getIsRequested : function() {
            return this.request.isSuccessed ? true : false;
        },
        getRequest : function() {
            return this.request;
        },
        remove : function() {
            this._element.unbind().remove();
            this.trigger('remove', this._data.id);
        },
        playPic : function() {
            this.trigger(PhotoItem.Events.PLAY, this._data.id);
        },
        setVisibility : function(visibiliy) {
            var el = this._element;
            visibiliy ? el.removeClass('wd-invisible') : el.addClass('wd-invisible');
        },
        rotate : function(orientation) {
            for(var i in this.ROTATE_CLASS) {
                this._element.removeClass(this.ROTATE_CLASS[i]);
            }
            switch(orientation) {
                case 0 :
                    break;
                case 90:
                    this._element.addClass(this.ROTATE_CLASS.R90);
                    break;
                case 180:
                    this._element.addClass(this.ROTATE_CLASS.R180);
                    break;
                case 270:
                    this._element.addClass(this.ROTATE_CLASS.R270);
                    break;
            }

            this._data.orientation = orientation;
        },
        ROTATE_CLASS : {
            R90 : 'w-rotate-90',
            R180 : 'w-rotate-180',
            R270 : 'w-rotate-270'
        },

        setThumbnailWeiboButton : function() {
            var isConnected = Device.get('isConnected');
            var weiboButton = this._element.find('.w-photo-item-thumbnail-share');

            if(isConnected) {
                weiboButton.show();
            } else {
                weiboButton.hide();
            }
            switch(Environment.locale) {
                case CONFIG.enums.LOCALE_EN_US :
                    title = i18n.misc.SHARE_TO_FACEBOOK;
                    break;
                case CONFIG.enums.LOCALE_ZH_CN :
                case CONFIG.enums.LOCALE_DEFAULT :
                default:
                    title = i18n.misc.WEIBO_SHARE_TEXT;
                    break;
            }
            weiboButton.attr('title', title);
        },
        render : function(opt_parent) {
            var self = this;
            if(!this._isRendered) {
                this._element = $(_.template(W.Template.get('photo', 'photo_item'))({}));
                this._element.appendTo(opt_parent);
                this.rotate(this._data.orientation);

                this._element.attr('data-name', self._data.display_name);
                this._element.attr('data-date', self._data.date);
                this._element.attr('data-size', self._data.size);

                this._element.bind('click', $.proxy(this.doCallbak, this));
                Device.on('change:isConnected', function() {
                    self.setThumbnailWeiboButton();
                });
                this._isRendered = true;
                this._init();
                // this.setVisibility(false);
                this.getThumbnail();
                this.setThumbnailWeiboButton();

                if(this.checkboxStatus) {
                    this.setCheckboxSelect();
                } else {
                    this.setCheckboxUnSelect();
                }

                W.photo.phoneRequestList.setSendListCallback(W.photo.photoCollection.getThumbnailsByIdList);
                W.photo.libraryRequestList.setSendListCallback(W.photo.photoCollection.getThumbnailsByIdList);

            }
        }
    });

    W.photo.PhotoItem = PhotoItem;
    W.photo.ThreadView = ThreadView;
});
wonder.useModule('photo/photoView');
