/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'ui/TemplateFactory',
        'ui/SmartList',
        'Device',
        'Internationalization',
        'music/collections/MusicsCollection',
        'music/views/MusicItemView',
        'music/views/MusicContextMenu',
        'browser/views/BrowserModuleView',
        'Log'
    ], function (
        Backbone,
        _,
        doT,
        TemplateFactory,
        SmartList,
        Device,
        i18n,
        MusicsCollection,
        MusicItemView,
        MusicContextMenu,
        BrowserModuleView,
        log

    ) {
        console.log('MusicsListView - File loaded. ');

        var musicsCollection;
        var musicsList;

        var MusicsListView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('music', 'music-list')),
            className : 'w-music-list vbox',
            initialize : function () {
                Object.defineProperties(this, {
                    selected : {
                        get : function () {
                            return musicsList ? musicsList.selected : [];
                        }
                    }
                });

                musicsCollection = MusicsCollection.getInstance();
                musicsCollection.on('refresh', this.buildList, this);

                musicsCollection.on('syncStart update syncEnd refresh', function () {
                    if (musicsList !== undefined) {
                        musicsList.loading = musicsCollection.loading || musicsCollection.syncing;
                    }
                });

                Device.on('change:hasSDCard', function (Device, hasSDCard) {
                    if (musicsList !== undefined) {
                        if (!hasSDCard) {
                            musicsList.emptyTip = i18n.misc.NO_SD_CARD_TIP_TEXT;
                        } else {
                            musicsList.emptyTip = i18n.music.MUSIC_EMPTY_TEXT_WANXIAODOU;
                        }

                        log({
                            'event' : 'ui.show.wanxiaodou',
                            'type' : 'music'
                        });
                    }
                });

                this.listenTo(Backbone, 'showModule', function (name) {
                    if (name === 'music') {
                        musicsList.isVisble = true;
                    }
                });
            },
            buildList : function () {
                if (!musicsList) {
                    musicsList = new SmartList({
                        itemView : MusicItemView.getClass(),
                        dataSet : [{
                            name : 'default',
                            getter : musicsCollection.getMusics
                        }],
                        keepSelect : false,
                        enableContextMenu : true,
                        $header : this.$('header'),
                        $observer : this.options.$observer,
                        itemHeight : 35,
                        listenToCollection : musicsCollection,
                        loading : musicsCollection.loading || musicsCollection.syncing,
                        showWanXiaoDou : true,
                        enableResizeListener : true
                    });

                    this.$el.append(musicsList.render().$el);

                    musicsList.on('select:change', function (selected) {
                        this.trigger('select:change', selected);
                    }, this);

                    musicsList.on('contextMenu', this.showContextMenu, this);

                    if (!Device.get('hasSDCard')) {
                        musicsList.emptyTip = i18n.misc.NO_SD_CARD_TIP_TEXT;
                    } else {
                        musicsList.emptyTip = i18n.music.MUSIC_EMPTY_TEXT_WANXIAODOU;
                    }

                    this.listenTo(musicsList, 'switchSet', this.toggleEmptyTip);

                    this.listenTo(Device, 'change:isFastADB', this.toggleEmptyTip);

                } else {
                    musicsList.switchSet('default', musicsCollection.getMusics);
                }
            },
            toggleEmptyTip : function () {
                if (musicsCollection.loading || musicsCollection.syncing || Device.get('isFastADB')) {
                    musicsList.toggleEmptyTip(false);
                    return;
                }
                musicsList.toggleEmptyTip(musicsList.currentModels.length === 0);
            },
            showContextMenu : function (selected) {
                var musicContextMenu = MusicContextMenu.getInstance({
                    selected : selected
                });

                musicContextMenu.show();
            },
            render : function () {
                this.$el.html(this.template({}));

                this.buildList();
                return this;
            },
            clickButtonDownload: function () {
                BrowserModuleView.navigateToThirdParty(255);

                log({
                    'event' : 'ui.click.wanxiaodou_download',
                    'type' : 'music'
                });
            },
            events : {
                'click .button-download-music' : 'clickButtonDownload'
            }
        });

        var musicsListView;

        var factory = _.extend({
            getInstance : function (args) {
                if (!musicsListView) {
                    musicsListView = new MusicsListView(args);
                }
                return musicsListView;
            }
        });

        return factory;
    });
}(this));
