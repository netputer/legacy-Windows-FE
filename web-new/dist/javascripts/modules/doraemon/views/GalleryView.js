/*global define*/
(function (window, undefined) {
    define([
        'backbone',
        'underscore',
        'doT',
        'ui/TemplateFactory',
        'Account',
        'Configuration',
        'IO',
        'browser/views/BrowserView',
        'doraemon/collections/ExtensionsCollection',
        'doraemon/models/ExtensionModel'
    ], function (
        Backbone,
        _,
        doT,
        TemplateFactory,
        Account,
        CONFIG,
        IO,
        BrowserView,
        ExtensionsCollection,
        ExtensionModel
    ) {
        console.log('GalleryView - File loaded.');

        var extensionsCollection;

        var GalleryView = Backbone.View.extend({
            className : 'module-main vbox',
            initialize: function () {
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

                this.listenTo(Account, 'change:uid', function () {
                    var iframe = this.$('iframe')[0];
                    iframe.reload(iframe.src);
                });

                extensionsCollection = extensionsCollection || ExtensionsCollection.getInstance();
                this.listenTo(extensionsCollection, 'add', function (model) {
                    this.sendMessage(CONFIG.events.CUSTOM_GALLERY_STAR, {
                        id : model.id
                    });
                });

                this.listenTo(extensionsCollection, 'remove', function (model) {
                    this.sendMessage(CONFIG.events.CUSTOM_GALLERY_UNSTAR, {
                        id : model.id
                    });
                });

                this.$host = this.options.$host;
            },
            render : function () {
                this.$el.append(BrowserView.getInstance({
                    id : 'wdj-iframe-gallery',
                    model : new ExtensionModel({
                        id : 305,
                        name : '豌豆荚的百宝袋'
                    })
                }).render().$el);

                this.rendered = true;
                return this;
            },
            sendMessage : function (channel, data) {
                this.$('iframe')[0].contentWindow.postMessage(JSON.stringify({
                    actions : channel,
                    id : data.id
                }), this.$('iframe')[0].contentWindow.location.href);
            }
        });

        var galleryView;

        var factory = _.extend({
            enablePreload : false,
            preload : function () {},
            getInstance : function (args) {
                if (!galleryView) {
                    galleryView = new GalleryView(args);
                }
                return galleryView;
            }
        });

        return factory;
    });
}(this));
