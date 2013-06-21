(function(window, undefined) {
    define(["video/views/ImportVideoView"], function(ImportVideoView) {
        console.log('VideoModuleView - File loaded. ');

        var VideoModuleView = Backbone.View.extend({
            className : 'w-video-module-main module-main vbox',
            initialize : function() {
                var rendered = false;
                Object.defineProperties(this, {
                    rendered : {
                        set : function(value) {
                            rendered = value;
                        },
                        get : function() {
                            return rendered;
                        }
                    }
                });
            },
            render : function() {
                window.wonder.PM.getPage('video_page').render();
                this.$el.append(window.wonder.PM.getPage('video_page')._element);

                this.rendered = true;
                return this;
            }
        });

        var videoModuleView;

        var factory = _.extend({
            getInstance : function() {
                if(!videoModuleView) {
                    videoModuleView = new VideoModuleView();
                }
                return videoModuleView;
            },
            showImport: function(param) {
                console.log('show import video')
                var obj = eval('(' + param + ')');
                var resp = {'body': obj};
                var inst = ImportVideoView.getInstance();
                inst.resp = resp;
                inst.show();
            },
            preload : function() {

            }
        });

        return factory;
    });
})(this);