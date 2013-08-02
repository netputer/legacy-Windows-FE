/*global define*/
(function (window) {
    define([
        'underscore',
        'backbone',
        'doT',
        'jquery',
        'ui/TemplateFactory',
        'ui/WindowState',
        'Internationalization',
        'Log',
        'IOBackendDevice',
        'Configuration',
        'photo/collections/PhonePhotoCollection',
        'photo/collections/LibraryPhotoCollection',
        'photo/collections/CloudPhotoCollection',
        'photo/views/PhotoListView'
    ], function (
        _,
        Backbone,
        doT,
        $,
        TemplateFactory,
        WindowState,
        i18n,
        log,
        IO,
        CONFIG,
        PhonePhotoCollection,
        LibraryPhotoCollection,
        CloudPhotoCollection,
        PhotoListView
    ) {
        console.log('PhotoGalleryView - File loaded. ');

        var PhotoGalleryView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('photo', 'gallery')),
            className : 'w-photo-gallery-ctn',
            initialize : function () {
                var currentTab = 'phone';

                Object.defineProperties(this, {
                    currentTab : {
                        get : function () {
                            return currentTab;
                        },
                        set : function (value) {
                            currentTab = value;
                        }
                    }
                });

                this.phonePhotoCollection = PhonePhotoCollection.getInstance();
                this.libraryPhotoCollection = LibraryPhotoCollection.getInstance();
                this.cloudPhotoCollection = CloudPhotoCollection.getInstance();

                this.listenTo(Backbone, 'switchModule', function (data) {
                    if (data.module === 'photo') {
                        this.selectTab(data.tab);
                        currentTab = data.tab;
                    }
                });

                IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.CUSTOM_IFRAME_PHOTO_SELECT_TAB
                }, function (data) {
                    this.selectTab(data.tab);
                    currentTab = data.tab;
                }, this);

                this.listenTo(this.phonePhotoCollection, 'refresh add remove', _.debounce(function () {
                    this.$('.tab li[data-tab="phone"] .count').html(this.phonePhotoCollection.length);
                    this.relocatePointer();
                }));
                this.listenTo(this.libraryPhotoCollection, 'refresh add remove', _.debounce(function () {
                    this.$('.tab li[data-tab="lib"] .count').html(this.libraryPhotoCollection.length);
                    this.relocatePointer();
                }));
                this.listenTo(this.cloudPhotoCollection, 'refresh add remove', _.debounce(function () {
                    this.$('.tab li[data-tab="cloud"] .count').html(this.cloudPhotoCollection.length);
                    this.relocatePointer();
                }));
            },
            render : function () {
                this.$el.html(this.template({
                    phone : this.phonePhotoCollection.length,
                    lib : this.libraryPhotoCollection.length,
                    cloud : this.cloudPhotoCollection.length
                }));

                this.selectTab('phone');

                IO.sendCustomEventsAsync(CONFIG.events.CUSTOM_IFRAME_PHOTO_RENDERED);

                setTimeout(this.relocatePointer.bind(this), 0);
                this.listenTo(WindowState, 'resize', this.relocatePointer);

                return this;
            },
            remove : function () {
                if (this.phonePhotoView) {
                    this.phonePhotoView.remove();
                    delete this.phonePhotoView;
                }
                if (this.libPhotoView) {
                    this.libPhotoView.remove();
                    delete this.libPhotoView;
                }
                if (this.cloudPhotoView) {
                    this.cloudPhotoView.remove();
                    delete this.cloudPhotoView;
                }

                PhonePhotoCollection.dispose();
                delete this.phonePhotoCollection;
                LibraryPhotoCollection.dispose();
                delete this.libraryPhotoCollection;
                CloudPhotoCollection.dispose();
                delete this.cloudPhotoCollection;

                PhotoGalleryView.__super__.remove.call(this);
            },
            relocatePointer : function () {
                var $targetTab =  this.$('.tab li.selected');
                if ($targetTab.length > 0) {
                    var $pointer = this.$('.pointer');

                    var oldTransition = $pointer.css('-webkit-transition');

                    $pointer.css({
                        '-webkit-transition' : 'none'
                    });

                    this.$('.pointer').css({
                        left : $targetTab[0].offsetLeft,
                        width : $targetTab[0].offsetWidth
                    });

                    setTimeout(function () {
                        $pointer.css({
                            '-webkit-transition' : oldTransition
                        });
                    }, 0);
                }
            },
            hideTabs : function (phone, lib, cloud) {
                if (phone && this.phonePhotoView) {
                    this.phonePhotoView.$el.addClass('w-layout-hidden');
                }
                if (lib && this.libPhotoView) {
                    this.libPhotoView.$el.addClass('w-layout-hidden');
                }
                if (cloud && this.cloudPhotoView) {
                    this.cloudPhotoView.$el.addClass('w-layout-hidden');
                }
            },
            selectTab : function (tab) {
                this.$('.tab li.selected').removeClass('selected');
                var $targetTab = this.$('.tab li[data-tab="' + tab + '"]');
                $targetTab.addClass('selected');

                this.$('.pointer').css({
                    left : $targetTab[0].offsetLeft,
                    width : $targetTab[0].offsetWidth
                });

                switch (tab) {
                case 'phone':
                    this.hideTabs(false, true, true);
                    if (!this.phonePhotoView) {
                        this.phonePhotoView = PhotoListView.getInstance({
                            collection : this.phonePhotoCollection,
                            template : this.options.listTemplate,
                            threadTemplate : this.options.threadTemplate,
                            itemTemplate : this.options.itemTemplate
                        });
                        this.$el.append(this.phonePhotoView.render().$el);
                    } else {
                        this.phonePhotoView.$el.removeClass('w-layout-hidden');
                    }
                    break;
                case 'lib':
                    this.hideTabs(true, false, true);
                    if (!this.libPhotoView) {
                        this.libPhotoView = PhotoListView.getInstance({
                            collection : this.libraryPhotoCollection,
                            template : this.options.listTemplate,
                            threadTemplate : this.options.threadTemplate,
                            itemTemplate : this.options.itemTemplate
                        });
                        this.$el.append(this.libPhotoView.render().$el);
                    } else {
                        this.libPhotoView.$el.removeClass('w-layout-hidden');
                    }
                    break;
                case 'cloud':
                    this.hideTabs(true, true, false);
                    if (!this.cloudPhotoView) {
                        this.cloudPhotoView = PhotoListView.getInstance({
                            collection : this.cloudPhotoCollection,
                            template : this.options.listTemplate,
                            threadTemplate : this.options.threadTemplate,
                            itemTemplate : this.options.itemTemplate
                        });
                        this.$el.append(this.cloudPhotoView.render().$el.addClass('cloud'));
                    } else {
                        this.cloudPhotoView.$el.removeClass('w-layout-hidden');
                    }
                    break;
                }
            },
            clickTab : function (evt) {
                var tab = $(evt.currentTarget).data('tab');
                Backbone.trigger('switchModule', {
                    module : 'photo',
                    tab : tab
                });

                log({
                    'event' : 'ui.click.photo_tab',
                    'tab' : tab
                });
            },
            events : {
                'click .tab li' : 'clickTab'
            }
        });

        var photoGalleryView;

        var factory = _.extend({
            getInstance : function (args) {
                if (!photoGalleryView) {
                    photoGalleryView = new PhotoGalleryView(args);
                }
                return photoGalleryView;
            },
            getClass : function () {
                return PhotoGalleryView;
            }
        });

        return factory;
    });
}(this));
