/*global define*/
(function (window) {
    define([
        'underscore',
        'backbone',
        'music/collections/MusicsCollection',
        'music/views/MusicModuleToolbarView',
        'music/views/MusicsListView',
        'music/views/ImportMusicView'
    ], function (
        _,
        Backbone,
        MusicsCollection,
        MusicModuleToolbarView,
        MusicsListView,
        ImportMusicView
    ) {
        console.log('MusicModuleView - File loaded. ');

        var MusicModuleView = Backbone.View.extend({
            className : 'w-music-module-main module-main vbox',
            initialize : function () {
                var rendered = false;
                Object.defineProperties(this, {
                    rendered : {
                        set : function (value) {
                            rendered = value;
                        },
                        get : function () {
                            return rendered;
                        }
                    }
                });
            },
            render : function () {
                this.$el.append(MusicModuleToolbarView.getInstance().render().$el);
                this.$el.append(MusicsListView.getInstance().render().$el);

                this.rendered = true;
                return this;
            }
        });

        var musicModuleView;

        var factory = _.extend({
            getInstance : function () {
                if (!musicModuleView) {
                    musicModuleView = new MusicModuleView();
                }
                return musicModuleView;
            },
            showImport : function (param) {
                var obj = eval('(' + param + ')');
                var resp = {
                    body : obj
                };
                var inst = ImportMusicView.getInstance();
                inst.resp = resp;
                inst.show();
            }
        });

        return factory;
    });
}(this));
