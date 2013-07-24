/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
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
        'music/MusicService',
        'music/models/MusicModel',
        'music/views/MusicItemView'
    ], function (
        Backbone,
        _,
        doT,
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
        MusicService,
        MusicModel,
        MusicItemView
    ) {
        console.log('ImportMusicView - File loaded.');

        var musicList;

        var alertWindow;

        var BodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('music', 'local-import-body')),
            className : 'w-music-local-import vbox',
            initialize : function () {
                this.collection = new Backbone.Collection();

                alertWindow = new AlertWindow({
                    $bodyContent : i18n.music.IMPORT_PROGRESS_TEXT
                });

                Device.on('change', this.setFooterContent, this);

                if (Device.get('hasEmulatedSD')) {
                    Device.getDeviceCapacityAsync();
                } else {
                    Device.getSDCapacityAsync();
                }
            },
            render : function () {
                this.$el.html(this.template({}));

                musicList = new SmartList({
                    itemView : MusicItemView.getClass(),
                    dataSet : [{
                        name : 'default',
                        getter : function () {
                            return [];
                        }
                    }],
                    keepSelect : false,
                    $observer : this.$('.check-select-all'),
                    $header : this.$('header'),
                    itemHeight : 35,
                    listenToCollection : this.collection
                });

                musicList.on('switchSet', function (currentSet) {
                    musicList.emptyTip = i18n.music.NO_SELECTED_MUSIC_TEXT;
                    musicList.toggleEmptyTip(musicList.currentModels.length === 0);

                    this.setFooterContent();
                }, this);

                musicList.on('select:change', function () {
                    this.setFooterContent();
                }, this);

                this.$('.w-smart-list-header').after(musicList.render().$el);

                musicList.emptyTip = i18n.music.NO_SELECTED_MUSIC_TEXT;
                musicList.toggleEmptyTip(true);

                return this;
            },
            parseMusics : function (resp) {
                var newMusics = [];

                _.each(resp.body.audio, function (music) {
                    music.id = StringUtil.MD5(music.path);
                    newMusics.push(new MusicModel(music));
                });

                var newMusicIds = [];

                _.each(newMusics, function (item) {
                    var music = this.collection.get(item.id);
                    if (music) {
                        music.set(item.toJSON());
                    } else {
                        this.collection.add(item);
                    }
                    newMusicIds.push(item.id);
                }, this);

                musicList.switchSet('default', function () {
                    return this.collection.models;
                }.bind(this));
                musicList.addSelect(newMusicIds);
            },
            selectMusics : function (type) {
                alertWindow.show();

                MusicService.selectMusicsAsync(type).done(this.parseMusics.bind(this)).always(function () {
                    alertWindow.close();
                });
            },
            setFooterContent : function () {
                var selectedSize = 0;
                _.each(musicList.selected, function (id) {
                    selectedSize += parseInt(this.collection.get(id).get('size'), 0);
                }, this);

                var tip = StringUtil.format(i18n.misc.SELECTOR_DESCRIPTION_TEXT, musicList.selected.length, musicList.currentModels.length);

                if (Device.get('hasEmulatedSD')) {
                    tip += StringUtil.format(i18n.misc.DEVICE_CAPACITY_REMAIN, StringUtil.readableSize(Math.max(Device.get('internalFreeCapacity') - selectedSize, 0)));
                } else {
                    tip += StringUtil.format(i18n.misc.SD_CAPACITY_REMAIN, StringUtil.readableSize(Math.max(Device.get('externalFreeCapacity') - selectedSize, 0)));
                }

                this.$('footer').html(tip);
            },
            clickButtonAddFile : function (evt) {
                this.selectMusics(0);
            },
            clickButtonAddFolder : function (evt) {
                this.selectMusics(1);
            },
            events : {
                'click .button-add-file' : 'clickButtonAddFile',
                'click .button-add-folder' : 'clickButtonAddFolder'
            }
        });

        var bodyView;

        var ImportMusicView = Panel.extend({
            initialize : function () {
                ImportMusicView.__super__.initialize.apply(this, arguments);

                this.on('show', function () {
                    bodyView = new BodyView().render();
                    if (this.resp) {
                        bodyView.parseMusics(this.resp);
                        delete this.resp;
                    }
                    this.$bodyContent = bodyView.$el;

                    bodyView.setFooterContent();
                }, this);

                this.on('button_yes', this.importMusicView, this);
            },
            importMusicView : function () {
                var paths = [];
                _.each(musicList.selected, function (id) {
                    var music = bodyView.collection.get(id);
                    if (music !== undefined) {
                        paths.push(music.get('path'));
                    }
                });

                if (paths.length > 0) {
                    MusicService.importMusicsAsync(paths);
                }

                this.close();
            }
        });

        var importMusicView;

        var factory = _.extend({
            getInstance : function () {
                if (!importMusicView) {
                    importMusicView = new ImportMusicView({
                        title : i18n.music.ADD_LOCAL_MUSIC_TEXT,
                        height : 480,
                        width : 630,
                        buttonSet : ButtonSetMixin.BUTTON_SET.YES_CANCEL
                    });
                }
                return importMusicView;
            }
        });

        return factory;
    });
}(this));
