/*global define*/
(function (window) {
    'use strict';

    define([
        'underscore',
        'backbone',
        'doT',
        'ui/TemplateFactory',
        'ui/Toolbar',
        'Internationalization',
        'IframeMessageWorker',
        'Device',
        'Configuration',
        'IOBackendDevice',
        'FunctionSwitch',
        'photo/collections/PhotoCollection',
        'photo/collections/PhonePhotoCollection',
        'photo/collections/LibraryPhotoCollection',
        'photo/collections/CloudPhotoCollection',
        'photo/views/PhotoGalleryView',
        'photo/views/SlideShowView',
        'photo/views/PhotoSyncSwitchView'
    ], function (
        _,
        Backbone,
        doT,
        TemplateFactory,
        Toolbar,
        i18n,
        IframeMessageWorker,
        Device,
        CONFIG,
        IO,
        FunctionSwitch,
        PhotoCollection,
        PhonePhotoCollection,
        LibraryPhotoCollection,
        CloudPhotoCollection,
        PhotoGalleryView,
        SlideShowView,
        PhotoSyncSwitchView
    ) {
        console.log('PhotoModuleToolbarView - File loaded. ');

        var phonePhotoCollection;
        var libraryPhotoCollection;
        var cloudPhotoCollection;

        var PhotoModuleToolbarView = Toolbar.extend({
            template : doT.template(TemplateFactory.get('photo', 'toolbar')),
            initialize : function () {
                phonePhotoCollection = PhonePhotoCollection.getInstance();
                libraryPhotoCollection = LibraryPhotoCollection.getInstance();
                cloudPhotoCollection = CloudPhotoCollection.getInstance();

                this.listenTo(Device, 'change:isConnected', this.setButtonState);

                this.listenTo(Backbone, 'switchModule', function (data) {
                    if (data.module === 'photo') {
                        this.setButtonState(data.tab);
                    }
                });
                this.listenTo(phonePhotoCollection, 'refresh add remove', _.debounce(this.setButtonState));
                this.listenTo(libraryPhotoCollection, 'refresh add remove', _.debounce(this.setButtonState));
                this.listenTo(cloudPhotoCollection, 'refresh add remove', _.debounce(this.setButtonState));
                this.listenTo(Backbone, 'photo:selected:change', this.setButtonState);
            },
            getCollectionByTab : function (currentTab) {
                var targetCollection;
                if (currentTab === 'phone') {
                    targetCollection = phonePhotoCollection;
                } else if (currentTab === 'lib') {
                    targetCollection = libraryPhotoCollection;
                } else if (currentTab === 'cloud') {
                    targetCollection = cloudPhotoCollection;
                }
                return targetCollection;
            },
            setButtonState : function (tab) {
                var currentTab = typeof tab === 'string' ? tab : PhotoGalleryView.getInstance().currentTab;
                var isCloud = currentTab === 'cloud';
                var targetCollection = this.getCollectionByTab(currentTab);

                this.$('.check-select-all').prop({
                    disabled : targetCollection.length === 0,
                    checked : targetCollection.getSelectedPhoto().length === targetCollection.length
                });

                this.$('.button-refresh').prop({
                    disabled : !Device.get('isConnected') || isCloud
                });

                this.$('.button-import').prop({
                    disabled : !Device.get('isConnected')
                });

                this.$('.button-delete, .button-export').prop({
                    disabled : (!Device.get('isConnected') && !isCloud) || targetCollection.length === 0 ||
                        targetCollection.getSelectedPhoto().length === 0
                });

                this.$('.button-fullscreen').prop({
                    disabled : targetCollection.length === 0
                });
            },
            render : function () {
                this.$el.html(this.template({}));

                this.setButtonState();
                if (FunctionSwitch.ENABLE_PHOTO_SYNC_DOWNLOAD) {
                    this.$el.append(PhotoSyncSwitchView.getInstance().render().$el);
                }

                return this;
            },
            clickButtonImport : function () {
                IframeMessageWorker.trigger(CONFIG.events.PHOTO_SHOW_IMPORTOR);
            },
            clickButtonRefresh : function () {
                var targetCollection = this.getCollectionByTab(PhotoGalleryView.getInstance().currentTab);
                targetCollection.syncAsync().fail(function () {
                    IframeMessageWorker.alert(i18n.misc.REFRESH_ERROR);
                });
            },
            clickCheckSelectAll : function (evt) {
                var targetCollection = this.getCollectionByTab(PhotoGalleryView.getInstance().currentTab);

                targetCollection.each(function (photo) {
                    photo.set({
                        selected : evt.target.checked
                    });
                });
            },
            clickButtonDelete : function () {
                var targetCollection = this.getCollectionByTab(PhotoGalleryView.getInstance().currentTab);

                IframeMessageWorker.trigger(CONFIG.events.CUSTOM_IFRAME_PHOTO_DELETE, {
                    ids : _.pluck(targetCollection.getSelectedPhoto(), 'id'),
                    models : targetCollection.toJSON()
                });

                var handler = IO.Backend.Device.onmessage({
                    'data.channel' : CONFIG.events.CUSTOM_IFRAME_PHOTO_DELETED
                }, function (data) {
                    targetCollection.remove(data.data);
                    IO.Backend.Device.offmessage(handler);
                });
            },
            clickButtonFullscreen : function () {
                var targetCollection = this.getCollectionByTab(PhotoGalleryView.getInstance().currentTab);

                var selected = targetCollection.getSelectedPhoto();

                if (selected.length === 0) {
                    SlideShowView.getInstance().start(targetCollection.at(0), true);
                } else {
                    var Collection = PhotoCollection.getClass();
                    var tempCollection = new Collection().set(_.map(selected, function (photo) {
                        return photo.toJSON();
                    }));
                    tempCollection.each(function (photo) {
                        photo.on('change', function (photo) {
                            targetCollection.get(photo.id).set(photo.toJSON());
                        });
                    });

                    var removeHandler = function (photo) {
                        targetCollection.get(photo.id).deleteAsync();
                    };

                    tempCollection.on('remove', removeHandler);

                    this.listenToOnce(SlideShowView.getInstance(), 'close', function () {
                        tempCollection.off('remove', removeHandler);
                        tempCollection.dispose();
                        tempCollection = undefined;
                    });

                    SlideShowView.getInstance().start(tempCollection.at(0), true);
                }
            },
            clickButtonExport : function () {
                var targetCollection = this.getCollectionByTab(PhotoGalleryView.getInstance().currentTab);

                IframeMessageWorker.trigger(CONFIG.events.CUSTOM_IFRAME_PHOTO_EXPORT, {
                    ids : _.pluck(targetCollection.getSelectedPhoto(), 'id'),
                    models : targetCollection.toJSON()
                });
            },
            events : {
                'click .button-import' : 'clickButtonImport',
                'click .button-delete' : 'clickButtonDelete',
                'click .button-refresh' : 'clickButtonRefresh',
                'click .button-fullscreen' : 'clickButtonFullscreen',
                'click .button-export' : 'clickButtonExport',
                'click .check-select-all' : 'clickCheckSelectAll'
            }
        });

        var photoModuleToolbarView;

        var factory = _.extend({
            getInstance : function () {
                if (!photoModuleToolbarView) {
                    photoModuleToolbarView = new PhotoModuleToolbarView();
                }
                return photoModuleToolbarView;
            }
        });

        return factory;
    });
}(this));
