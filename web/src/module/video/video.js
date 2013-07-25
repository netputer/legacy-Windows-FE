/**
 * @fileoverview video module entrance
 * @author lixiaomeng@wandoujia.com
 */
wonder.addModule('video', function (W) {
    W.namespace('wonder.video');
    var locale = i18n.video;
    var toolbar = null;

    var loadingProcess = new W.ui.status.Process ();
    var loadingView = new W.ui.status.ProcessView (loadingProcess);
    var deleteTipDialog = new W.ui.Dialog (i18n.ui.TIP);
    var progressWin = new W.ui.Progress ();
    var allCheckbox = $('<input/>').attr('type', 'checkbox');
    var videoContent = W.video.videoContent = new W.video.VideoContent ();
    var VideoCollection = W.video.VideoCollection;
    var videoCollection = W.video.videoCollection = new VideoCollection ();
    window.Music.PIMCollection.getInstance().get(6).set({
        count : videoCollection.getVideoItemList().length
    });
    videoCollection.on('update', function () {
        window.Music.PIMCollection.getInstance().get(6).set({
            count : videoCollection.getVideoItemList().length
        });
    });
    window.Device.on('change:isMounted', function (Device, isMounted) {
        if (!isMounted) {
            window.Music.PIMCollection.getInstance().get(6).set({
                count : videoCollection.getVideoItemList().length
            });
        } else {
            window.Music.PIMCollection.getInstance().get(6).set({
                count : 0
            });
        }
    });
    var maxRequestOnePage = 80;
    var contentWrapper;
    var setPosition2ThreadTimer;
    var checkboxDelegate;
    var alert = new W.ui.Dialog (i18n.ui.TIP);
    alert.setButtonSet(W.ui.Dialog.ButtonSet.OK);

    /**
     * @constructor
     */
    function VideoPage (pageName, config) {
        W.ui.Page.call(this, pageName, config);
    }


    W.extend(VideoPage, W.ui.Page);

    W.mix(VideoPage.prototype, {
        _initToolbar : function () {
            var self = this;
            toolbar = new W.ui.Toolbar ();
            this.addTopContent(toolbar);

            var mainBtn = new W.ui.ImageButton (locale.ADD_LOCAL_VIDEO_TEXT);
            var delBtn = new W.ui.ImageButton (i18n.misc.DELETE);
            var expBtn = new W.ui.ImageButton (i18n.misc.EXPORT);
            var refreshBtn = new W.ui.ImageButton (i18n.misc.REFRESH);
            checkboxDelegate = new W.ui.SelectDelegate ();

            toolbar.addComponent('checkboxDelegateBtn', checkboxDelegate).addComponent('mainBtn', mainBtn).addComponent('deleteBtn', delBtn).addComponent('exportBtn', expBtn).addComponent('refreshBtn', refreshBtn);

            delBtn.setDisabled(true);
            expBtn.setDisabled(true);

            mainBtn.addClassName('primary min').addImageClass('add');
            delBtn.addClassName('min').addImageClass('delete');
            expBtn.addClassName('min').addImageClass('export');
            refreshBtn.addClassName('min').addImageClass('refresh');

            mainBtn.bind('click', this.addVideoFormPC, this);
            refreshBtn.bind('click', this.refreshActionCallback, this);
            expBtn.bind('click', function () {
                window.Music.VideoService.exportVideosAsync(checkboxDelegate.getList());
            });
            delBtn.bind('click', function () {
                self.deleteVideo(checkboxDelegate.getList());
            });

            checkboxDelegate.bind('add', this.setToolbarStatus);
            checkboxDelegate.bind('remove', this.setToolbarStatus);
            checkboxDelegate.bind('empty', this.setToolbarStatus);
            checkboxDelegate.bind('checked', function () {
                videoContent.selectAllThread();
                self.setToolbarStatus.call(self);
            });
            checkboxDelegate.bind('unchecked', function () {
                this.reset();
                videoContent.unSelectAllThread();
                self.setToolbarStatus.call(self);
            });
            checkboxDelegate.bind('show', this.setToolbarStatus);

            Device.on('change', this.setToolbarStatus, this);
            this.setToolbarStatus();
        },

        getCheckboxDelegate : function () {
            return checkboxDelegate;
        },

        addVideoFormPC : function () {
            window.Music.ImportVideoView.getInstance().show();
        },

        refreshActionCallback : function () {
            var self = this;
            checkboxDelegate.reset();
            videoContent.empty();
            loadingProcess.start();
            videoCollection.sync(function (response) {
                if (response.state_code !== 200 && response.state_code !== 402) {
                    alert(i18n.misc.REFRESH_ERROR);
                }
                loadingProcess.finish();
                window.Music.PIMCollection.getInstance().get(6).set({
                    count : videoCollection.getVideoItemList().length
                });
            });
        },

        deleteVideo : function (videoIds) {
            window.Music.VideoService.deleteVideosAsync(videoIds);
        },

        setToolbarStatus : function () {
            var connected = Device.get('isConnected');
            var hasSDCard = Device.get('hasSDCard');
            var checkedSize = checkboxDelegate.size();
            var totalSize = videoCollection.getVideoItemList().length;

            var mainBtn = toolbar.getComponent('mainBtn');
            var refreshBtn = toolbar.getComponent('refreshBtn');
            var delBtn = toolbar.getComponent('deleteBtn');
            var expBtn = toolbar.getComponent('exportBtn');

            mainBtn.setDisabled(!connected || !hasSDCard);
            refreshBtn.setDisabled(!connected || !hasSDCard);
            delBtn.setDisabled(!(connected && checkedSize > 0 && hasSDCard));
            expBtn.setDisabled(!(connected && checkedSize > 0 && hasSDCard));
            checkboxDelegate.setChecked((totalSize == checkedSize) && (totalSize > 0));
        },

        _initPage : function () {
            contentWrapper = $('<div/>').addClass('w-video-content-wrapper');
            videoContent.render(contentWrapper);
            this.addLeftContent(contentWrapper);

            progressBar = new W.ui.ProgressMonitor ();
            progressWin = new W.ui.Progress ();
            W.video.progressBar = progressBar;
            W.video.progressWin = progressWin;
            this.addPageContent(loadingView);
            this._initToolbar();
        },

        refreshVideosData : function (videoThreadDataList) {
            var threadData;
            var threadName;
            videoContent.empty();
            W.video.videoRequestList.reset();
            for (var i in videoThreadDataList) {
                threadData = videoThreadDataList[i];
                threadName = locale[i.toUpperCase() + '_THREAD_NAME'];
                var videoThread = new W.video.VideoThread (threadData, threadName);

                videoThread.bind(W.video.VideoItem.Events.SELECT, function (id) {
                    checkboxDelegate.add(id);
                });

                videoThread.bind(W.video.VideoItem.Events.UNSELECT, function (id) {
                    checkboxDelegate.remove(id);
                });

                videoContent.addThread(videoThread);
            }

            W.video.videoRequestList.sendRequest(0, maxRequestOnePage);

        },

        refresh : function () {
            window.Music.PIMCollection.getInstance().get(6).set({
                count : videoCollection.getVideoItemList().length
            });

            if (Device.get('hasSDCard')) {
                var self = this;
                var videoThreadDataList = {};
                checkboxDelegate.reset();
                videoContent.empty();

                loadingProcess.start();
                videoCollection.getVideoThreadList(function (response) {
                    window.Music.PIMCollection.getInstance().get(6).set({
                        count : videoCollection.getVideoItemList().length
                    });

                    if (response.state_code !== 202 || !Device.get('isConnected') || !Device.get('hasSDCard')) {
                        loadingProcess.finish();
                    }

                    if (response.body && response.body) {
                        videoThreadDataList = response.body;
                    }

                    var enumberable = false;
                    for (var i in videoThreadDataList) {
                        enumberable = true;
                    }
                    if (!enumberable && response.state_code !== 202) {
                        videoContent.showTip(locale.NO_VIDEOS_TEXT);
                        checkboxDelegate.setDisabled(true);
                    } else {
                        self.refreshVideosData(videoThreadDataList);
                        checkboxDelegate.setDisabled(false);
                    }

                    if (response.state_code !== 202) {
                    }
                });
            } else {
                videoContent.showTip(i18n.misc.NO_SD_CARD_TIP_TEXT);
                loadingView.hide();
            }
        },

        render : function (opt_parent) {
            var self = this;
            var preScrollTop = 0;
            var enableShowThreadTitle = [];

            VideoPage._super_.render.call(this, opt_parent);

            this.addClassName('w-video');
            this._initPage();
            // videoAddor.bind('successed', this.refresh, this);

            videoCollection.bind(VideoCollection.Events.UPDATE, this.refresh, this);
            videoCollection.bind(VideoCollection.Events.SYNC_FAILED, function () {
                this.refreshVideosData(videoCollection.getCacheList());
                loadingProcess.finish();
            }, this);
            videoCollection.bind(VideoCollection.Events.REMOVE, function (data) {
                checkboxDelegate.remove(data.id);
            });

            setTimeout(this.refresh.bind(this), 0);
            contentWrapper.bind('scroll', function (e) {
                var scrollTop = e.target.scrollTop;
                var scrollHeight = e.target.scrollHeight;
                var from = parseInt(scrollTop / 170);
                var requestList = null;

                W.delay(this, function () {
                    W.video.videoRequestList.sendRequest(from, maxRequestOnePage + from * 7);
                }, 100);

                enableShowThreadTitle = [];
                allThreadTitles = videoContent.getThreadTitle();

                setPosition2ThreadTimer = setTimeout(function () {
                    if (scrollTop > preScrollTop) {
                        _.each(allThreadTitles, function (item) {
                            var threadTitle = $(item), offset = threadTitle.offset();
                            if (offset.top <= 50) {
                                enableShowThreadTitle.push(threadTitle);
                            }
                        });
                        videoContent.setPosition2Thread(enableShowThreadTitle.pop(), setPosition2ThreadTimer);
                    } else {
                        _.each(allThreadTitles, function (item) {
                            var threadTitle = $(item), thread = threadTitle.parent('.w-video-thread'), offset = thread.offset();
                            if (thread.height() + offset.top > 20) {
                                enableShowThreadTitle.push(threadTitle);
                            }
                        });
                        videoContent.setPosition2Thread(enableShowThreadTitle.shift(), setPosition2ThreadTimer);
                    }

                    preScrollTop = scrollTop;
                }, 25);
            });
        }
    });

    videoPage = new VideoPage (W.PageManager.PageNames.VIDEO_PAGE, {
        top : true,
        rightWidth : 0
    });
    W.PM.addPage(videoPage);
    W.video.videoPage = videoPage;
});
wonder.useModule('video');
