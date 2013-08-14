/*global define*/
(function (window) {
    'use strict';

    define([
        'underscore',
        'backbone',
        'doT',
        'ui/TemplateFactory',
        'ui/Toolbar',
        'Internationalization',
        'Device',
        'video/collections/VideosCollection',
        'video/views/ImportVideoView',
        'video/VideoService'
    ], function (
        _,
        Backbone,
        doT,
        TemplateFactory,
        Toolbar,
        i18n,
        Device,
        VideosCollection,
        ImportVideoView,
        VideoService
    ) {
        console.log('VideoModuleToolbarView - File loaded. ');

        var videosCollection;

        var VideoModuleToolbarView = Toolbar.extend({
            template : doT.template(TemplateFactory.get('video', 'toolbar')),
            initialize : function () {
                this.listenTo(Device, 'change', this.setButtonState);

                videosCollection = VideosCollection.getInstance();
                this.listenTo(Backbone, 'video:selected:change', this.setButtonState);
            },
            setButtonState : function () {
                this.$('.check-select-all').prop({
                    disabled : videosCollection.length === 0,
                    checked : videosCollection.getSelectedVideo().length === videosCollection.length
                });

                this.$('.button-import').prop({
                    disabled : !Device.get('isConnected') || !Device.get('hasSDCard')
                });

                this.$('.button-delete, .button-export').prop({
                    disabled : videosCollection.length === 0
                                || videosCollection.getSelectedVideo().length === 0
                                || !Device.get('isConnected')
                                || !Device.get('hasSDCard')
                });
            },
            render : function () {
                this.$el.html(this.template({}));

                this.setButtonState();
                return this;
            },
            clickButtonImport : function () {
                ImportVideoView.getInstance().show();
            },
            clickbuttonDelete : function () {
                VideoService.deleteVideosAsync(_.pluck(videosCollection.getSelectedVideo(), 'id'));
            },
            clickButtonExport : function () {
                VideoService.exportVideosAsync(_.pluck(videosCollection.getSelectedVideo(), 'id'));
            },
            clickCheckSelectAll : function (evt) {
                videosCollection.each(function (video) {
                    video.set({
                        selected : evt.target.checked
                    });
                });
            },
            events : {
                'click .button-import' : 'clickButtonImport',
                'click .button-delete' : 'clickbuttonDelete',
                'click .button-export' : 'clickButtonExport',
                'click .check-select-all' : 'clickCheckSelectAll'
            }
        });

        var videoModuleToolbarView;

        var factory = _.extend({
            getInstance : function () {
                if (!videoModuleToolbarView) {
                    videoModuleToolbarView = new VideoModuleToolbarView();
                }
                return videoModuleToolbarView;
            }
        });

        return factory;
    });
}(this));
