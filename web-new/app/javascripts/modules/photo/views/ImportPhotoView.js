/*global define*/
(function (window, undefined) {
    define([
        'backbone',
        'doT',
        'underscore',
        'ui/Panel',
        'ui/TemplateFactory',
        'ui/AlertWindow',
        'ui/SmartList',
        'ui/behavior/ButtonSetMixin',
        'utilities/StringUtil',
        'IOBackendDevice',
        'Configuration',
        'Internationalization',
        'Device',
        'photo/PhotoService',
        'photo/models/PhotoModel',
        'photo/views/PhotoListItemView'
    ], function (
        Backbone,
        doT,
        _,
        Panel,
        TemplateFactory,
        AlertWindow,
        SmartList,
        ButtonSetMixin,
        StringUtil,
        IO,
        CONFIG,
        i18n,
        Device,
        PhotoService,
        PhotoModel,
        PhotoListItemView
    ) {
        console.log('ImportPhotoView - File loaded.');

        var bodyView;
        var footerMonitorView;

        var FooterMonitorView = Backbone.View.extend({
            initialize : function () {
                if (Device.get('hasEmulatedSD')) {
                    Device.getDeviceCapacityAsync();
                } else {
                    Device.getSDCapacityAsync();
                }
                this.listenTo(Device, 'change', this.setContent);
            },
            render : function () {
                var tip = StringUtil.format(i18n.misc.SELECTOR_DESCRIPTION_TEXT, bodyView.photoList.selected.length, bodyView.photoList.currentModels.length);

                if (Device.get('hasEmulatedSD')) {
                    tip += StringUtil.format(i18n.misc.DEVICE_CAPACITY_REMAIN, StringUtil.readableSize(Device.get('internalFreeCapacity')));
                    Device.getDeviceCapacityAsync().done(this.setContent.bind(this));
                } else {
                    tip += StringUtil.format(i18n.misc.SD_CAPACITY_REMAIN, StringUtil.readableSize(Device.get('externalFreeCapacity')));
                    Device.getSDCapacityAsync().done(this.setContent.bind(this));
                }

                this.$el.html(tip);
                return this;
            },
            setContent : function () {
                var selectedSize = 0;
                _.each(bodyView.photoList.selected, function (id) {
                    selectedSize += parseInt(bodyView.collection.get(id).get('size'), 0);
                });

                var tip = StringUtil.format(i18n.misc.SELECTOR_DESCRIPTION_TEXT, bodyView.photoList.selected.length, bodyView.photoList.currentModels.length);

                if (Device.get('hasEmulatedSD')) {
                    tip += StringUtil.format(i18n.misc.DEVICE_CAPACITY_REMAIN, StringUtil.readableSize(Math.max(Device.get('internalFreeCapacity') - selectedSize, 0)));
                } else {
                    tip += StringUtil.format(i18n.misc.SD_CAPACITY_REMAIN, StringUtil.readableSize(Math.max(Device.get('externalFreeCapacity') - selectedSize, 0)));
                }

                this.$el.html(tip);
            }
        });

        var BodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('photo', 'local-import-body')),
            className : 'w-photo-local-import vbox',
            initialize : function () {
                this.collection = new Backbone.Collection();
            },
            render : function () {
                this.$el.html(this.template({}));

                this.photoList = new SmartList({
                    itemView : PhotoListItemView.getClass(),
                    dataSet : [{
                        name : 'default',
                        getter : function () {
                            return [];
                        }
                    }],
                    keepSelect : false,
                    $observer : this.$('.check-select-all'),
                    $header : this.$('header'),
                    itemHeight : 53,
                    listenToCollection : this.collection
                });

                this.listenTo(this.photoList, 'switchSet', function (currentSet) {
                    this.photoList.emptyTip = i18n.photo.PHOTO_ADDOR_GRID_TIP;
                    this.photoList.toggleEmptyTip(this.photoList.currentModels.length === 0);

                    if (footerMonitorView) {
                        footerMonitorView.setContent();
                    }
                });

                this.listenTo(this.photoList, 'select:change', function () {
                    if (footerMonitorView) {
                        footerMonitorView.setContent();
                    }
                });

                this.$('.w-photo-local-import-list').append(this.photoList.render().$el);

                this.photoList.emptyTip = i18n.photo.PHOTO_ADDOR_GRID_TIP;
                this.photoList.toggleEmptyTip(true);

                return this;
            },
            parsePhotos : function (resp) {
                var newPhotos = [];
                var faildText = [];

                _.each(resp.body.image, function (image) {
                    image.id = StringUtil.MD5(image.path);
                    newPhotos.push(new PhotoModel(image));
                });

                var newPhotoIds = [];

                _.each(newPhotos, function (item) {
                    var photo = this.collection.get(item.id);
                    if (photo !== undefined) {
                        photo.set(item.toJSON());
                    } else {
                        this.collection.add(item);
                    }
                    newPhotoIds.push(item.id);
                }, this);

                this.photoList.switchSet('default', function () {
                    return this.collection.models;
                }.bind(this));
                this.photoList.addSelect(newPhotoIds);
            },
            remove : function () {
                this.photoList.remove();
                this.collection.set([]);
                delete this.photoList;
                delete this.collection;

                BodyView.__super__.remove.call(this);
            },
            selectPhotos : function (type) {
                var alertWindow = new AlertWindow({
                    $bodyContent : i18n.photo.IMPORT_PROGRESS_TEXT
                });
                alertWindow.show();

                PhotoService.selectPhotosAsync(type).done(this.parsePhotos.bind(this)).always(function () {
                    alertWindow.close();
                });
            },
            clickButtonAddFile : function () {
                this.selectPhotos(0);
            },
            clickButtonAddFolder : function () {
                this.selectPhotos(1);
            },
            events : {
                'click .button-add-file' : 'clickButtonAddFile',
                'click .button-add-folder' : 'clickButtonAddFolder'
            }
        });

        var ImportPhotoView = Panel.extend({
            initialize : function () {
                ImportPhotoView.__super__.initialize.apply(this, arguments);

                this.on('show', function () {
                    bodyView = new BodyView().render();

                    this.$bodyContent = bodyView.$el;

                    footerMonitorView = new FooterMonitorView();
                    this.$('.w-ui-window-footer-monitor').append(footerMonitorView.render().$el);

                    this.once('remove', function () {
                        bodyView.remove();
                        footerMonitorView.remove();
                        bodyView = undefined;
                        footerMonitorView = undefined;
                    }, this);
                }, this);

                this.on('button_yes', this.importPhoto, this);
            },
            importPhoto : function () {
                var paths = [];
                _.each(bodyView.photoList.selected, function (id) {
                    var photo = bodyView.collection.get(id);
                    if (photo !== undefined) {
                        paths.push(photo.get('path'));
                    }
                });

                if (paths.length > 0) {
                    PhotoService.importPhotosAsync(paths);
                }

                this.close();
            }
        });

        var importPhotoView;

        var factory = _.extend({
            getInstance : function () {
                if (!importPhotoView) {
                    importPhotoView = new ImportPhotoView({
                        title : i18n.photo.ADD_LAOCEL_PHOTO_LABEL,
                        height : 480,
                        width : 630,
                        buttonSet : ButtonSetMixin.BUTTON_SET.YES_CANCEL
                    });
                }
                return importPhotoView;
            }
        });

        return factory;
    });
}(this));
