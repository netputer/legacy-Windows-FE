/*global define*/
(function (window) {
    define([
        'backbone',
        'doT',
        'underscore',
        'ui/Panel',
        'ui/TemplateFactory',
        'ui/AlertWindow',
        'ui/SmartList',
        'ui/behavior/ButtonSetMixin',
        'utilities/StringUtil',
        'IOBackendDevice',
        'Configuration',
        'Internationalization',
        'Device',
        'video/VideoService',
        'video/models/VideoModel',
        'video/views/VideoItemView'
    ], function (
        Backbone,
        doT,
        _,
        Panel,
        TemplateFactory,
        AlertWindow,
        SmartList,
        ButtonSetMixin,
        StringUtil,
        IO,
        CONFIG,
        i18n,
        Device,
        VideoService,
        VideoModel,
        VideoItemView
    ) {
        console.log('ImportVideoView - File loaded.');

        var bodyView;

        var videoList;
        var footerMonitorView;

        var FooterMonitorView = Backbone.View.extend({
            initialize : function () {
                Device.on('change', this.setContent, this);

                if (Device.get('hasEmulatedSD')) {
                    Device.getDeviceCapacityAsync();
                } else {
                    Device.getSDCapacityAsync();
                }
            },
            render : function () {
                var tip = StringUtil.format(i18n.misc.SELECTOR_DESCRIPTION_TEXT, videoList.selected.length, videoList.currentModels.length);

                if (Device.get('hasEmulatedSD')) {
                    tip += StringUtil.format(i18n.misc.DEVICE_CAPACITY_REMAIN, StringUtil.readableSize(Device.get('internalFreeCapacity')));
                    Device.getDeviceCapacityAsync().done(this.setContent.bind(this));
                } else {
                    tip += StringUtil.format(i18n.misc.SD_CAPACITY_REMAIN, StringUtil.readableSize(Device.get('externalFreeCapacity')));
                    Device.getSDCapacityAsync().done(this.setContent.bind(this));
                }

                this.$el.html(tip);
                return this;
            },
            setContent : function () {
                var selectedSize = 0;
                _.each(videoList.selected, function (id) {
                    selectedSize += parseInt(bodyView.collection.get(id).get('size'), 0);
                });

                var tip = StringUtil.format(i18n.misc.SELECTOR_DESCRIPTION_TEXT, videoList.selected.length, videoList.currentModels.length);

                if (Device.get('hasEmulatedSD')) {
                    tip += StringUtil.format(i18n.misc.DEVICE_CAPACITY_REMAIN, StringUtil.readableSize(Math.max(Device.get('internalFreeCapacity') - selectedSize, 0)));
                } else {
                    tip += StringUtil.format(i18n.misc.SD_CAPACITY_REMAIN, StringUtil.readableSize(Math.max(Device.get('externalFreeCapacity') - selectedSize, 0)));
                }

                this.$el.html(tip);
            }
        });

        var alertWindow;

        var BodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('video', 'local-import-body')),
            className : 'w-video-local-import vbox',
            initialize : function () {
                this.collection = new Backbone.Collection();

                alertWindow = new AlertWindow({
                    $bodyContent : i18n.video.ADD_VIDEO_LOADING
                });
            },
            render : function () {
                this.$el.html(this.template({}));

                videoList = new SmartList({
                    itemView : VideoItemView.getClass(),
                    dataSet : [{
                        name : 'default',
                        getter : function () {
                            return [];
                        }
                    }],
                    keepSelect : false,
                    $observer : this.$('.check-select-all'),
                    $header : this.$('header'),
                    itemHeight : 29,
                    listenToCollection : this.collection
                });

                videoList.on('switchSet', function (currentSet) {
                    videoList.emptyTip = i18n.video.VIDEO_ADDOR_GRID_TIP;
                    videoList.toggleEmptyTip(videoList.currentModels.length === 0);

                    if (footerMonitorView) {
                        footerMonitorView.setContent();
                    }
                });

                videoList.on('select:change', function () {
                    if (footerMonitorView) {
                        footerMonitorView.setContent();
                    }
                });

                this.$('.w-video-local-import-list').append(videoList.render().$el);

                videoList.emptyTip = i18n.video.VIDEO_ADDOR_GRID_TIP;
                videoList.toggleEmptyTip(true);

                return this;
            },
            parseVideos : function (resp) {
                var newVideos = [];

                _.each(resp.body.video, function (video) {
                    video.id = StringUtil.MD5(video.path);
                    newVideos.push(new VideoModel(video));
                });

                var newVideoIds = [];

                _.each(newVideos, function (item) {
                    var video = this.collection.get(item.id);
                    if (video !== undefined) {
                        video.set(item.toJSON());
                    } else {
                        this.collection.add(item);
                    }
                    newVideoIds.push(item.id);
                }, this);

                videoList.switchSet('default', function () {
                    return this.collection.models;
                }.bind(this));
                videoList.addSelect(newVideoIds);
            },
            selectVideos : function (type) {
                alertWindow.show();

                VideoService.selectVideosAsync(type).done(this.parseVideos.bind(this)).always(function () {
                    alertWindow.close();
                });
            },
            clickButtonAddFile : function () {
                this.selectVideos(0);
            },
            clickButtonAddFolder : function () {
                this.selectVideos(1);
            },
            clickButtonManageSD : function () {
                var $btn = this.$('.button-manage-sd').prop('disabled', true);

                setTimeout(function () {
                    $btn.prop('disabled', false);
                }.bind(this), 2000);

                Device.manageSDCardAsync();
            },
            events : {
                'click .button-add-file' : 'clickButtonAddFile',
                'click .button-add-folder' : 'clickButtonAddFolder',
                'click .button-manage-sd' : 'clickButtonManageSD'
            }
        });

        var ImportVideoView = Panel.extend({
            initialize : function () {
                ImportVideoView.__super__.initialize.apply(this, arguments);

                this.on('show', function () {
                    bodyView = new BodyView().render();
                    if (this.resp) {
                        bodyView.parseVideos(this.resp);
                        delete this.resp;
                    }
                    this.$bodyContent = bodyView.$el;

                    footerMonitorView = new FooterMonitorView();

                    this.$('.w-ui-window-footer-monitor').append(footerMonitorView.render().$el);
                }, this);

                this.on('button_yes', this.importVideo, this);
            },
            importVideo : function () {
                var paths = [];
                _.each(videoList.selected, function (id) {
                    var video = bodyView.collection.get(id);
                    if (video !== undefined) {
                        paths.push(video.get('path'));
                    }
                });

                if (paths.length > 0) {
                    VideoService.importVideosAsync(paths);
                }

                this.close();
            }
        });

        var importVideoView;

        var factory = _.extend({
            getInstance : function () {
                if (!importVideoView) {
                    importVideoView = new ImportVideoView({
                        title : i18n.video.ADD_LOCAL_VIDEO_TEXT,
                        height : 480,
                        width : 630,
                        buttonSet : ButtonSetMixin.BUTTON_SET.YES_CANCEL
                    });
                }
                return importVideoView;
            }
        });

        return factory;
    });
}(this));
