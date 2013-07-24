/*global define*/
(function (window) {
    define([
        'underscore',
        'backbone',
        'video/views/ImportVideoView'
    ], function (
        _,
        Backbone,
        ImportVideoView
    ) {
        console.log('VideoModuleView - File loaded. ');

        var VideoModuleView = Backbone.View.extend({
            className : 'w-video-module-main module-main vbox',
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
                window.wonder.PM.getPage('video_page').render();
                this.$el.append(window.wonder.PM.getPage('video_page')._element);

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
