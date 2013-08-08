/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'jquery',
        'Log',
        'doT',
        'IO',
        'Configuration',
        'ui/TemplateFactory',
        'ui/WindowState',
        'photo/views/PhotoGalleryView',
        'photo/collections/PhonePhotoCollection',
        'photo/collections/LibraryPhotoCollection',
        'contact/views/AvatarEditorWindowView'
    ], function (
        Backbone,
        _,
        $,
        log,
        doT,
        IO,
        CONFIG,
        TemplateFactory,
        WindowState,
        PhotoGalleryView,
        PhonePhotoCollection,
        LibraryPhotoCollection,
        AvatarEditorWindowView
    ) {
        console.log('AvatarGalleryView - File loaded. ');

        var AvatarGalleryView = PhotoGalleryView.getClass().extend({
            template : doT.template(TemplateFactory.get('contact', 'gallery')),
            className : 'w-photo-gallery-ctn w-contact-avatar-list',
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

                this.listenTo(this.phonePhotoCollection, 'refresh add remove', _.debounce(function (phonePhotoCollection) {
                    this.$('.tab li[data-tab="phone"] .count').html(phonePhotoCollection.length);
                    this.relocatePointer();
                }));
                this.listenTo(this.libraryPhotoCollection, 'refresh add remove', _.debounce(function (libraryPhotoCollection) {
                    this.$('.tab li[data-tab="lib"] .count').html(libraryPhotoCollection.length);
                    this.relocatePointer();
                }));
            },
            clickTab : function (evt) {
                var tab = $(evt.currentTarget).data('tab');
                this.selectTab(tab);
                this.currentTab = tab;

                log({
                    'event' : 'ui.click.contact_avatar_tab',
                    'tab' : tab
                });
            },
            render : function () {
                _.extend(this.events, AvatarGalleryView.__super__.events);
                this.delegateEvents();

                this.$el.html(this.template({
                    phone : this.phonePhotoCollection.length,
                    lib : this.libraryPhotoCollection.length
                }));

                this.selectTab('phone');

                IO.sendCustomEventsAsync(CONFIG.events.CUSTOM_IFRAME_PHOTO_RENDERED);

                setTimeout(this.relocatePointer.bind(this), 0);
                this.listenTo(WindowState, 'resize', this.relocatePointer);

                return this;
            },
            clickItem : function () {
                var photo;
                if (this.currentTab === 'phone') {
                    photo = this.phonePhotoCollection.getSelectedPhoto();
                } else {
                    photo = this.libraryPhotoCollection.getSelectedPhoto();
                }

                AvatarEditorWindowView.getInstance({
                    detialView : this.options.detialView,
                    editorView : this.options.editorView,
                    selectPhoto : photo[0]
                }).show();

                this.options.editorView.hide();
            },
            events : {
                'click .w-photo-item' : 'clickItem'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new AvatarGalleryView(_.extend({
                    listTemplate : doT.template(TemplateFactory.get('contact', 'avatar-list')),
                    threadTemplate : doT.template(TemplateFactory.get('contact', 'avatar-list-thread')),
                    itemTemplate : doT.template(TemplateFactory.get('contact', 'avatar-list-item'))
                }, args));
            }
        });

        return factory;
    });
}(this));
