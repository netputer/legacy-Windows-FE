wonder.addModule('photo/data', function(W) {
    W.namespace('wonder.photo');

    /**
     * constructor PhotoCollection
     */
    function PhotoCollection() {
        this.initialize();
    };

    PhotoCollection.type = {
        ALL : 0,
        PHONE : 1,
        LIBRARY : 2
    }

    PhotoCollection.Events = {
        SYNCED : 'synced',
        REMOVE : 'remove'
    }
    W.mix(PhotoCollection.prototype, W.events);
    W.mix(PhotoCollection.prototype, {
        _currentType : PhotoCollection.type.PHONE,
        _curPlayList : [],
        phoneThreadList : [],
        libraryThreadList : [],

        initialize : function() {
            var self = this;

            IO.Backend.Device.onmessage({
                'data.channel' : CONFIG.events.PHOTO_UPDATED
            }, function(data) {
                W.photo.loadingProcess.finish();
                if(!!data) {
                    self.trigger(PhotoCollection.Events.SYNCED);
                }
            });

            this.bind(W.photo.PhotoCollection.Events.REMOVE, function(data) {

                if(this._curPlayList) {
                    var index = this._curPlayList.indexOf(data);
                    if(index > -1) {
                        this._curPlayList.splice(index, 1);
                    }
                }
            }, this);
        },
        setCurrentType : function(type) {
            this._currentType = type;
        },
        getPhotoListByThreadKeyAndType : function(key, type) {
            var ret_photo_list = [];
            var thread;
            var list = type === PhotoCollection.type.PHONE ? this.phoneThreadList : this.libraryThreadList;
            for(var i = 0, len = list.length; i < len; i++) {
                thread = list[i];
                if(thread.key === key) {
                    ret_photo_list = thread.photo_info;
                    break;
                }
            }

            return ret_photo_list;
        },

        getPhotoThreadByTypeAndPhotoId : function(type, photoId) {
            var list = type === PhotoCollection.type.PHONE ? this.phoneThreadList : this.libraryThreadList;

            var retThread = _.find(list, function(thread) {
                return _.find(thread.photo_info, function(item) {
                    return item.id === photoId;
                });
            });

            return retThread;
        },

        getPlayList : function(type) {
            var playList = [];
            var list = type === PhotoCollection.type.PHONE ? this.phoneThreadList : this.libraryThreadList;
            _.each(list, function(data) {
                _.each(data.photo_info, function(phoneInfo) {
                    playList.push(phoneInfo);
                }, this);
            }, this);
            this._curPlayList = playList;
            return playList;
        },
        getPhotoListByType : function(type) {
            var retPhotoList = [], photoThreadList = (type === PhotoCollection.type.PHONE) ? this.phoneThreadList : this.libraryThreadList;

            _.each(photoThreadList, function(thread) {
                _.each(thread.photo_info, function(photo) {
                    retPhotoList.push(photo);
                }, this);
            }, this);

            this._curPlayList = retPhotoList;
            return retPhotoList;
        },
        updateCacheThreadIgnoreByKey : function(key, ignore) {
            var threadList = this.phoneThreadList.concat(this.libraryThreadList);
            var thread;
            for(var i = 0, len = threadList.length; i < len; i++) {
                thread = threadList[i];
                if(thread.key === key) {
                    thread.is_ignore = ignore;
                    break;
                }
            }
        },
        getUnignorePhotosList : function(type) {
            var photoList = [];
            var list = type === PhotoCollection.type.PHONE ? this.phoneThreadList : this.libraryThreadList;
            _.each(list, function(data) {
                if(!data.is_ignore) {
                    _.each(data.photo_info, function(phoneInfo) {
                        photoList.push(phoneInfo);
                    }, this);
                }
            }, this);
            return photoList;
        },
        setupThreadForPhotosList : function(type, thread, isIgnore) {
            var list = type === PhotoCollection.type.PHONE ? this.phoneThreadList : this.libraryThreadList;
            _.each(list, function(data) {
                if(data.key === thread.getKey()) {
                    data.is_ignore = isIgnore;
                    return false;
                }
            });
        },
        /* tip: the interface supports jpg and png format pictures*/
        getPhotoFromPC : function(type, callback) {
            var self = this;
            W.ajax({
                url : CONFIG.actions.SELECT_CONTACT_PHOTO,
                data : {
                    type : type
                },
                success : function(response) {
                    response = JSON.parse(response);
                    if(response.state_code === 200) {
                        console.log('Photos - Selected Photos success.');
                        callback.call(self, response.body.value ? response.body.value : '');
                    } else {
                        console.error('Photos - Selected photos failed. Error info: ' + response.state_line);
                    }
                }
            });
        },
        /**
         * @param {function} callback
         */
        getPhotosList : function(type, callback) {
            var self = this;

            W.ajax({
                url : CONFIG.actions.PHOTO_SHOW,
                data : {
                    photo_type : type
                },
                success : function(response) {
                    var response = JSON.parse(response);
                    var list = [];
                    if(response.body && response.body.list) {
                        list = response.body.list;
                    }
                    switch(type) {
                        case PhotoCollection.type.PHONE:
                            self.phoneThreadList = list;
                            break;
                        case PhotoCollection.type.LIBRARY:
                            self.libraryThreadList = list;
                            break;
                    }
                    callback && callback.call(this, response);
                }
            });
        },
        getCachePhotoThreadsByType : function(type) {
            var ret_threads = [];
            switch(type) {
                case PhotoCollection.type.PHONE:
                    ret_threads = this.phoneThreadList;
                    break;
                case PhotoCollection.type.LIBRARY:
                    ret_threads = this.libraryThreadList;
                    break;
            }

            return ret_threads;
        },
        getPhotoThreadsByType : function(type, callback, scope) {
            var self = this;

            W.ajax({
                url : CONFIG.actions.PHOTO_SHOW,
                data : {
                    photo_type : type
                },
                success : function(response) {
                    var response = JSON.parse(response), photoThreadList = [];
                    if(response.body && response.body.list) {
                        photoThreadList = response.body.list;
                    }
                    switch(type) {
                        case PhotoCollection.type.PHONE:
                            self.phoneThreadList = photoThreadList;
                            break;
                        case PhotoCollection.type.LIBRARY:
                            self.libraryThreadList = photoThreadList;
                            break;
                    }
                    callback && callback.call(scope, response);
                }
            });
        },
        sync : function(type, callback, scope) {
            var self = this;
            W.ajax({
                url : CONFIG.actions.PHOTO_SYNC,
                data : {
                    photo_type : type
                },
                success : function(response) {
                    var response = JSON.parse(response);
                    callback && callback.call(scope, response);
                }
            });
        },
        getThumbnailById : function(id, callback) {
            W.ajax({
                url : CONFIG.actions.PHOTO_THUMBNAIL,
                data : {
                    photo_id : id
                },
                success : function(response) {
                    response = JSON.parse(response);
                    callback && callback(response);
                }
            });
        },
        getBigPicById : function(id, callback) {
            W.ajax({
                url : CONFIG.actions.PHOTO_GET,
                data : {
                    photo_id : id
                },
                success : function(response) {
                    response = JSON.parse(response);
                    callback && callback(response);
                }
            });
        },
        getDataById : function(id) {
            var list = this.phoneThreadList.concat(this.libraryThreadList);
            for(var i = 0; i < list.length; i++) {
                var subList = list[i].photo_info;
                if(subList && subList.length > 0) {
                    for(var j = 0; j < subList.length; j++) {
                        if(subList[j].id === id)
                            return subList[j];
                    }
                }
            }
            return null;
        },
        removeDataById : function(id) {
            var list = this._currentType === PhotoCollection.type.PHONE ? this.phoneThreadList : this.libraryThreadList;
            for(var i = 0; i < list.length; i++) {
                var subList = list[i].photo_info;
                if(subList && subList.length > 0) {
                    for(var j = 0; j < subList.length; j++) {
                        if(subList[j].id === id) {
                            this.trigger(W.photo.PhotoCollection.Events.REMOVE, subList.splice(j, 1)[0]);
                            break;
                        }
                    }
                }
            }
            for(var j = 0; j < this._curPlayList.length; j++) {
                if(this._curPlayList[j].id === id) {
                    this._curPlayList.splice(j, 1);
                    break;
                }
            }
        },
        deletePictureById : function(ids, sessionId, callback) {
            var self = this;
            W.ajax({
                url : CONFIG.actions.PHOTO_DELETE,
                data : {
                    photo_id_list : ids.join(','),
                    session : sessionId
                },
                success : function(response) {
                    response = JSON.parse(response);
                    callback && callback.call(this, response);
                }
            });
        },
        setWallpaper : function(id, callback) {
            W.ajax({
                url : CONFIG.actions.PHOTO_SET_WALLPAPER,
                data : {
                    photo_id : id
                },
                success : function(response) {
                    response = JSON.parse(response);
                    if(callback)
                        callback.call(this, response);
                }
            });
        },
        refreshThumbnail : function(id, orientation) {
            var data = this.getDataById(id);
            data && data.trigger(W.photo.PhotoItem.Events.REFRESH, id, orientation);

        },
        getThumbnailsByIdList : function(sendList) {
            _.each(sendList, function(req, index) {
                req.sending = true;
            });
            W.ajax({
                url : CONFIG.actions.PHOTO_THUMBNAILS,
                data : {
                    photo_id_list : _.pluck(sendList, 'id')
                },
                success : function(response) {
                    response = JSON.parse(response);
                    if(response.state_code === 200) {
                        _.each(sendList, function(req, index) {
                            req.setThumbnail(response.body.success[index].item);
                            req.isSuccessed = true;
                        });
                    } else {
                        _.each(sendList, function(req, index) {
                            req.isSuccessed = false;
                        });
                    }
                    _.each(sendList, function(req, index) {
                        req.sending = false;
                    });
                }
            });
        }
    }, false);

    W.photo.PhotoCollection = PhotoCollection;
});
wonder.useModule('photo/data');
