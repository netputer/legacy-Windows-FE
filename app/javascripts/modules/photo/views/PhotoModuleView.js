/*global define*/
(function (window) {
    define([
        'underscore',
        'backbone',
        'Configuration',
        'Environment',
        'photo/views/ImportPhotoView',
        'photo/IframeMessageListener'
    ], function (
        _,
        Backbone,
        CONFIG,
        Environment,
        ImportPhotoView,
        IframeMessageListener
    ) {
        console.log('PhotoModuleView - File loaded. ');

        var PhotoModuleView = Backbone.View.extend({
            className : 'module-main',
            tagName : 'iframe',
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
                this.$el.attr({
                    src : CONFIG.BASE_PATH + 'modules/photo/photo.html' + Environment.get('search')
                });

                var switchModuleHandler = function (data) {
                    if (data.module !== 'photo') {
                        this.stopListening(Backbone, 'switchModule', switchModuleHandler);

                        this.$el.attr({
                            src : ''
                        });

                        IframeMessageListener.destory();

                        this.rendered = false;
                    }
                };

                IframeMessageListener.init();

                this.listenTo(Backbone, 'switchModule', switchModuleHandler);

                this.rendered = true;

                return this;
            }
        });

        var photoModuleView;

        var factory = _.extend({
            getInstance : function () {
                if (!photoModuleView) {
                    photoModuleView = new PhotoModuleView();
                }
                return photoModuleView;
            },
            showImport : function (param) {
                var obj = eval('(' + param + ')');
                var resp = {
                    body : obj
                };
                var inst = ImportPhotoView.getInstance();
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
