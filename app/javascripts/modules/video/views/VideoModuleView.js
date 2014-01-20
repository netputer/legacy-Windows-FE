/*global define*/
(function (window) {
    define([
        'underscore',
        'backbone',
        'doT',
        'ui/TemplateFactory',
        'video/views/VideoModuleToolbarView',
        'video/views/ImportVideoView',
        'video/views/VideoListView',
        'video/collections/VideosCollection',
        'PerformanceTracker'
    ], function (
        _,
        Backbone,
        doT,
        TemplateFactory,
        VideoModuleToolbarView,
        ImportVideoView,
        VideoListView,
        VideosCollection,
        PerformanceTracker
    ) {
        console.log('VideoModuleView - File loaded. ');

        var VideoModuleView = Backbone.View.extend({
            className : 'w-video-module-main module-main vbox',
            template : doT.template(TemplateFactory.get('video', 'video')),
            initialize : function () {
                var rendered = false;
                Object.defineProperties(this, {
                    rendered : {
                        set : function (value) {
                            rendered = Boolean(value);
                        },
                        get : function () {
                            return rendered;
                        }
                    }
                });
            },
            render : function () {
                this.$el.append(VideoModuleToolbarView.getInstance().render().$el)
                    .append(VideoListView.getInstance({
                        collection : VideosCollection.getInstance()
                    }).render().$el)
                    .append(this.template());

                this.rendered = true;
                return this;
            }
        });

        var videoModuleView;

        var factory = _.extend({
            getInstance : function () {
                if (!videoModuleView) {
                    videoModuleView = new VideoModuleView();
                }
                return videoModuleView;
            },
            showImport: function (param) {
                var obj = eval('(' + param + ')');
                var resp = {'body' : obj};
                var inst = ImportVideoView.getInstance();
                inst.resp = resp;
                inst.show();
            },
            preload : function () {
                return;
            }
        });

        return factory;
    });
}(this));
