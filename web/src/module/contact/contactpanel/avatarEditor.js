/**
 *   @constructor AvatarEditor
 */
wonder.addModule('contact/avatarEditor', function (W) {
    W.namespace('wonder.contact');

    function AvatarEditor () {
        W.ui.Window.call(this, i18n.contact.EDIT_CONTACT_HEAD);
    }


    W.extend(AvatarEditor, W.ui.Window);
    W.mix(AvatarEditor.prototype, {
        okBtn : null,
        cancelBtn : null,
        panelContentEl : null,
        delHeadEl : null,
        picLists : [],
        maxCountInOnePage : 30,
        clipImage : null,
        _data : {},
        _addComponent : function () {
            var self = this;
            self.okBtn = new W.ui.Button (i18n.misc.SAVE);
            self.cancelBtn = new W.ui.Button (i18n.ui.CANCEL);
            self.returnBtn = new W.ui.Button (i18n.misc.RESELECT_FILE_TEXT);
            self.picFormatTip = $('<span/>').text(i18n.contact.ALERT_PIC_FORMAT_TIP).addClass('w-contact-pic-format-tip');

            self.addFooterContent(self.okBtn);
            self.addFooterContent(self.cancelBtn);
            self.addFooterContent(self.returnBtn);
            self.addFooterContent({
                render : function (parent) {
                    self.picFormatTip.appendTo(parent);
                }
            });

            self.okBtn.addClassName('primary');
            self.returnBtn.addClassName('primary');
            self.returnBtn.addClassName('w-contact-edit-head-return');

            self.okBtn.bind('click', function (e) {
                var clipData = self.clipImage.clipImg();
                self._data.rect = clipData.left + ';' + clipData.top + ';' + clipData.width + ';' + clipData.height;
                self._data.dst_size = self.contactPanelHandle.getAvatarSize();
                W.ajax({
                    url : CONFIG.actions.EDIT_IMAGE,
                    data : self._data,
                    success : function (response) {
                        response = JSON.parse(response);
                        if (response.state_code === 200) {
                            self.contactPanelHandle.refreshAvatar(response.body.value);
                            self.hide();
                        } else {
                            // fail
                        }
                    }
                });
            });
            self.cancelBtn.bind('click', function (e) {
                self.hide();
            });
            self.returnBtn.bind('click', function (e) {
                self.recovery();
            });
            var tpl = W.Template.get('contact', 'contact_edit_head_panel');
            var panelContentEl = this.panelContentEl = $(tpl);
            var types = W.photo.PhotoCollection.type;

            this.phonePhotosEl = panelContentEl.find('.w-contact-edit-head-phone');
            this.libraryPhotosEl = panelContentEl.find('.w-contact-edit-head-library');
            this.photosEl = panelContentEl.find('.w-contact-edit-head-photos');

            this.tipEl = panelContentEl.find('.w-contact-edit-head-tip');

            panelContentEl.find('.w-contact-edit-head-source-tip').html(i18n.contact.EDIT_CONTACT_HEAD_SELECT_SOURCE);
            this.selectBtns = panelContentEl.find('.w-contact-edit-head-select-btns');
            this.createMenuBtn(this.selectBtns, types);

            this.selectPhotoFromPCBtn = new W.ui.Button (i18n.contact.EDIT_CONTACT_HEAD_PC_SOURCE);
            this.selectPhotoFromPCBtn.render(this.selectBtns);
            this.selectPhotoFromPCBtn.addClassName('primary');
            this.selectPhotoFromPCBtn.bind('click', function () {
                W.photo.photoCollection.getPhotoFromPC(0, function (imgPath) {
                    if (!imgPath) {
                        self.alertTip(i18n.photo.GET_PHOTO_FROM_PC_ERROR);
                    } else {
                        self.createClipImage(imgPath, 0);
                    }
                });
            });

            this.createDelHeadAlert();
            this.delHeadEl = this.panelContentEl.find('.w-contact-del-head');
            this.delHeadEl.html(i18n.contact.EDIT_CONTACT_HEAD_DEL_TEXT).attr('title', i18n.contact.EDIT_CONTACT_HEAD_DEL_TEXT);
            this.delHeadEl.bind('click', function () {
                self.delHeadAlert.show();
            });

            this.clipContainer = panelContentEl.find('.w-contact-edit-head-clip');
            this.selectContainer = panelContentEl.find('.w-contact-edit-head-select-container');
            this.photosEl.delegate('img', 'click', function (e) {
                var target = e.target;
                var id = $(target).attr('data-index');
                W.photo.photoCollection.getBigPicById(id, function (rep) {
                    if (rep.state_code === 200) {
                        var path = rep.body.path;
                        var picFormatArray = path.split('.');
                        if (/^(jpg|jpeg|png)$/i.test(picFormatArray[picFormatArray.length - 1])) {
                            self.createClipImage(rep.body.path, rep.body.orientation);
                        } else {
                            self.alertTip(i18n.contact.ALERT_PIC_FORMAT_ERROR);
                        }
                    } else {
                        self.alertTip(i18n.photo.GET_PHOTOS_ERROR);
                    }
                });
            });

            this.addBodyContent({
                render : function (opt_parent) {
                    panelContentEl.appendTo(opt_parent);
                }
            });

            panelContentEl.find('.w-contact-edit-head-photo-wrap')[0].onscroll = function (e) {
                var line = parseInt(e.target.scrollTop / 100, 10);
                var range = self.maxCountInOnePage + line * 5;

                W.delay(this, function () {
                    self.contactPhotoRequest.sendRequest(self.maxCountInOnePage, range);
                    self.maxCountInOnePage = range;
                }, 100);
            };

            W.photo.photoCollection.bind(W.photo.PhotoCollection.Events.SYNCED, function () {
                //currentContent.empty();
                //self.refresh();
                self.refreshPhotosList();
            });
        },
        alertTip : function (text) {
            alert(text);
        },
        createClipImage : function (path, orientation) {
            var self = this;
            var source = 'file:///' + path + '?date=' + new Date ().getTime();
            var img = self.clipContainer.find('.w-contact-edit-head-origin-img');
            if (img.length == 0) {
                img = $('<img/>').attr('src', source).addClass('w-contact-edit-head-origin-img').hide();
            } else {
                img.attr('src', source);
            }
            self._data = {
                'path' : path,
                'degree' : orientation
            };
            self.rotate(img, orientation);
            self.clipContainer.append(img);

            img.on('load', function () {
                var imgWidth = img[0].width;
                var imgHeight = img[0].height;
                var containerWidth = self.clipContainer.width();
                var containerHeight = self.clipContainer.height();
                var width = Math.min(imgWidth, containerWidth);
                var height = Math.min(imgHeight, containerHeight);

                if (!self.clipImage) {
                    self.clipImage = new W.ui.ClipImage ({
                        imageClipContainer : self.clipContainer,
                        imagePath : source,
                        imageConf : {
                            defaultWidth : width,
                            defaultHeight : height,
                            minWidth : 200,
                            minHeight : 200,
                            resizable : false,
                            keepSquare : false,
                            orientation : orientation
                        },
                        clipingBoxConf : {
                            defaultWidth : 100,
                            defaultHeight : 100,
                            minWidth : 40,
                            minHeight : 40,
                            maxWidth : width,
                            maxHeight : height,
                            resizable : true,
                            keepSquare : true,
                            className : 'w-imageClip-clipingbox'
                        }
                    });
                } else {
                    self.clipImage.setImage(source, width, height, orientation);
                }

                self.clipContainer.css('display', '-webkit-box');
                self.okBtn.show();
                self.cancelBtn.show();
                self.returnBtn.show();
                self.selectContainer.hide();
                self.picFormatTip.hide();
            });
        },
        createDelHeadAlert : function () {
            var self = this;
            if (!this.delHeadAlert) {
                this.delHeadAlert = new W.ui.Dialog (i18n.contact.DEL_CONTACT_HEAD);
                var buttonSetKey = W.ui.Dialog.ButtonSet.OK_CANCEL;
                var alertText = i18n.contact.ALERT_DEL_CONTACT_HEAD;
                this.delHeadAlert.bind('select', function (key) {
                    if (key === 'ok') {
                        self.contactPanelHandle.refreshAvatar('');
                    }
                    self.delHeadAlert.hide();
                    self.hide();
                });
                this.delHeadAlert.setButtonSet(buttonSetKey);
            }
            this.delHeadAlert.setContent(alertText);
        },
        createMenuBtn : function (opt_parent, types) {
            var selectSourceMenu = null;
            var item;
            var self = this;
            for (var i in types) {
                if (i !== 'ALL') {
                    if (!selectSourceMenu) {
                        selectSourceMenu = new W.ui.Menu (i18n.contact['EDIT_CONTACT_HEAD_SOURCE_BY_' + i.toUpperCase()]);
                        selectSourceMenu.render(opt_parent);
                        selectSourceMenu.addClassName('primary');
                        selectSourceMenu.removeAllItems();
                    }
                    item = new W.ui.CheckMenuItem (i18n.contact['EDIT_CONTACT_HEAD_SOURCE_BY_' + i.toUpperCase()]);
                    item.setValue(types[i]);
                    selectSourceMenu.addItem(item);
                }
            }
            selectSourceMenu.bind('select', function (e) {
                var value = e.target.getValue();
                self.currentType = value;
                if (value == W.photo.PhotoCollection.type.PHONE) {
                    self.phonePhotosEl.show();
                    self.libraryPhotosEl.hide();
                    this.setTitle(i18n.misc.NAV_PIC_PHONE_LIB);
                } else if (value == W.photo.PhotoCollection.type.LIBRARY) {
                    self.phonePhotosEl.hide();
                    self.libraryPhotosEl.show();
                    this.setTitle(i18n.misc.NAV_PIC_GALLERY);
                }

                self.refreshPhotosList();
            });
            selectSourceMenu.selectItemByIndex(0);
        },
        showTip : function () {
            var tip = '';
            if (this.picLists.length == 0) {
                if (this.currentType == W.photo.PhotoCollection.type.PHONE) {
                    tip = i18n.photo.EMPTY_PHONE_LIST;
                } else if (this.currentType == W.photo.PhotoCollection.type.LIBRARY) {
                    tip = i18n.photo.EMPTY_LIBRARY_LIST;
                }
            }

            if (Device.get('isMounted')) {
                tip = i18n.misc.SD_MOUNT_TIP_TEXT;
            }
            this.tipEl.text(tip).show();
        },
        hideTip : function () {
            this.tipEl.hide();
        },
        clearContent : function () {
            this.phonePhotosEl.empty();
            this.libraryPhotosEl.empty();
        },
        refreshPhotosList : function () {
            this.clearContent();
            if (!Device.get('isMounted')) {
                this.hideTip();
                this.getPhotos();
            } else {
                this.showTip();
            }
        },
        getPhotos : function () {
            this.contactPhotoRequest = new W.RequestList ();
            var request;
            var self = this;
            var photoInfo;
            var photosEl;
            W.photo.photoCollection.getPhotosList(self.currentType, function (response) {
                var list = [];
                self.picLists = [];
                if (response.body && response.body.list) {
                    list = response.body.list;
                }

                if (list.length <= 0 && response.state_code !== 202) {
                    self.showTip();
                } else if (response.state_code == 200) {

                    for (var i = 0, len = list.length; i < len; i++) {
                        for (var j = 0, len2 = list[i].photo_info.length; j < len2; j++) {
                            photoInfo = list[i].photo_info[j];
                            self.picLists.push(photoInfo);
                            setRequests(photoInfo.id, photoInfo.orientation);
                        }
                    }

                    function setRequests (id, orientation) {
                        var request = {
                            sending : false,
                            isSuccessed : false,
                            send : function () {
                                request.sending = true;
                                W.photo.photoCollection.getThumbnailById(id, function (resp) {
                                    if (resp.state_code == 200) {
                                        request.isSuccessed = true;

                                        var imgContainer = $('<div/>').addClass('w-contact-edit-head-img-wrap');
                                        var imgEl = $('<img>');
                                        if (self.currentType == W.photo.PhotoCollection.type.PHONE) {
                                            imgEl.appendTo(self.phonePhotosEl);
                                        } else if (self.currentType == W.photo.PhotoCollection.type.LIBRARY) {
                                            imgEl.appendTo(self.libraryPhotosEl);
                                        }
                                        imgEl.appendTo(imgContainer);
                                        imgEl.attr('src', 'file:///' + resp.body.value);
                                        imgEl.attr('data-index', id);
                                        self.rotate(imgEl, orientation);
                                        imgContainer.appendTo(photosEl);
                                    } else {
                                        request.isSuccessed = false;
                                    }
                                    request.sending = false;
                                });
                            }
                        }
                        self.contactPhotoRequest.push(request);
                    }

                    if (self.currentType == W.photo.PhotoCollection.type.PHONE) {
                        photosEl = self.phonePhotosEl;
                    } else if (self.currentType == W.photo.PhotoCollection.type.LIBRARY) {
                        photosEl = self.libraryPhotosEl;
                    }
                    photosEl.css('height', Math.round(self.picLists.length / 4) * 100);
                    self.contactPhotoRequest.sendRequest(0, self.maxCountInOnePage);
                }
            });
        },
        rotate : function (el, orientation) {
            for (var i in this.ROTATE_CLASS) {
                el.removeClass(this.ROTATE_CLASS[i]);
            }
            switch(orientation) {
            case 0 :
                break;
            case 90:
                el.addClass(this.ROTATE_CLASS.R90);
                break;
            case 180:
                el.addClass(this.ROTATE_CLASS.R180);
                break;
            case 270:
                el.addClass(this.ROTATE_CLASS.R270);
                break;
            }
        },
        ROTATE_CLASS : {
            R90 : 'w-rotate-90',
            R180 : 'w-rotate-180',
            R270 : 'w-rotate-270'
        },
        recovery : function () {
            this.clipContainer.hide();
            this.okBtn.hide();
            this.cancelBtn.hide();
            this.returnBtn.hide();
            this.selectContainer.show();
            this.picFormatTip.show();
        },
        saveHandleAndShow : function (handle) {
            this.contactPanelHandle = handle;
            this.show();
        },
        render : function (opt_parent) {
            var self = this;
            AvatarEditor._super_.render.call(this, opt_parent);
            this._addComponent();
            this.bind(W.ui.Window.Events.SHOW, function () {
                self.recovery();
            });
            Device.on('change:isMounted', function () {
                this.showTip();
            }, this);
        }
    });

    W.contact.avatarEditor = new AvatarEditor ();
});
wonder.useModule('contact/avatarEditor');
