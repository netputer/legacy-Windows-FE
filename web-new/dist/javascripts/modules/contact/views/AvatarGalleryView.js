/*global define*/
(function (window) {
    define([
        'underscore',
        'jquery',
        'Log',
        'doT',
        'ui/TemplateFactory',
        'photo/views/PhotoGalleryView',
        'photo/collections/PhonePhotoCollection',
        'photo/collections/LibraryPhotoCollection',
        'contact/views/AvatarEditorWindowView'
    ], function (
        _,
        $,
        log,
        doT,
        TemplateFactory,
        PhotoGalleryView,
        PhonePhotoCollection,
        LibraryPhotoCollection,
        AvatarEditorWindowView
    ) {
        console.log('AvatarGalleryView - File loaded. ');

        var AvatarGalleryView = PhotoGalleryView.getClass().extend({
            className : 'w-photo-gallery-ctn w-contact-avatar-list',
            initialize : function () {
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

                log({
                    'event' : 'ui.click.contact_avatar_tab',
                    'tab' : tab
                });
            },
            render : function () {
                _.extend(this.events, AvatarGalleryView.__super__.events);
                this.delegateEvents();
                return AvatarGalleryView.__super__.render.call(this);
            },
            clickItem : function () {
                AvatarEditorWindowView.getInstance({
                    parentView : this.options.parentView
                }).show();

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
                }), args);
            }
        });

        return factory;
    });
}(this));
