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
        'Environment',
        'Settings',
        'FunctionSwitch',
        'photo/collections/PhonePhotoCollection',
        'photo/collections/LibraryPhotoCollection',
        'photo/collections/CloudPhotoCollection',
        'photo/views/PhotoListView',
        'photo/views/PhotoIosView'
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
        Environment,
        Settings,
        FunctionSwitch,
        PhonePhotoCollection,
        LibraryPhotoCollection,
        CloudPhotoCollection,
        PhotoListView,
        PhotoIosView
    ) {
        console.log('PhotoGalleryView - File loaded. ');

        var lastWindowWidth;
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
                this.listenTo(WindowState, 'resize', function (state) {
                    if (lastWindowWidth !== state.width) {
                        this.relocatePointer();
                    }
                    lastWindowWidth = state.width;
                });

                return this;
            },
            remove : function () {
                if (this.phonePhotoView) {

                    this.phonePhotoView.remove();
                    delete this.phonePhotoView;

                    PhonePhotoCollection.dispose();
                    delete this.phonePhotoCollection;
                }

                if (this.libPhotoView) {

                    this.libPhotoView.remove();
                    delete this.libPhotoView;

                    LibraryPhotoCollection.dispose();
                    delete this.libraryPhotoCollection;
                }

                if (this.cloudPhotoView) {

                    this.cloudPhotoView.remove();
                    delete this.cloudPhotoView;

                    CloudPhotoCollection.dispose();
                    delete this.cloudPhotoCollection;
                }

                PhotoGalleryView.__super__.remove.call(this);
            },
            relocatePointer : function () {
                var $targetTab =  this.$('.tab li.selected');
                if ($targetTab.length > 0) {
                    this.$('.pointer').css({
                        left : $targetTab[0].offsetLeft,
                        width : $targetTab[0].offsetWidth
                    });
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

                if (this.iosView) {
                    this.iosView.$el.hide();
                }

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

                    if (FunctionSwitch.IS_CHINESE_VERSION && !Settings.get('ios.banner.isclosed')) {
                        $.ajax({
                            url : CONFIG.enums.IOS_SHOW_ADVERTISEMENT,
                            data : {
                                pcid : Environment.get('pcId')
                            },
                            success : function (resp) {
                                if (resp.type) {
                                    if (!this.iosView) {
                                        this.iosView = PhotoIosView.getInstance();

                                        this.listenTo(this.iosView, 'ios.banner.close', function () {
                                            this.iosView = undefined;
                                            this.cloudPhotoView.withBanner = false;
                                        });

                                        this.$el.append(this.iosView.render().$el);

                                        log({
                                            'event' : 'ui.show.ios_banner'
                                        });

                                    } else {
                                        this.iosView.$el.show();
                                    }

                                    this.cloudPhotoView.withBanner = true;
                                }
                            }.bind(this)
                        });
                    }

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
                    this.cloudPhotoView.withBanner = false;
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
