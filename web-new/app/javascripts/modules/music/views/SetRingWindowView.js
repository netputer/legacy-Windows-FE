/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'ui/Panel',
        'ui/TemplateFactory',
        'ui/SmartList',
        'Device',
        'Internationalization',
        'music/views/MusicItemView',
        'music/views/ImportMusicView',
        'music/collections/MusicsCollection',
        'music/MusicService'
    ], function (
        Backbone,
        _,
        doT,
        $,
        Panel,
        TemplateFactory,
        SmartList,
        Device,
        i18n,
        MusicItemView,
        ImportMusicView,
        MusicsCollection,
        MusicService
    ) {
        console.log('SetRingWindowView - File loaded. ');

        var musicsList;
        var musicsCollection;

        var BodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('music', 'set-ring-list')),
            className : 'w-music-set-ring-list vbox',
            initialize : function () {
                musicsCollection = musicsCollection || MusicsCollection.getInstance();

                musicsCollection.on('refresh', function (musicsCollection) {
                    if (!musicsList) {
                        this.buildList();
                    } else {
                        musicsList.switchSet('default', musicsCollection.getAll);
                    }
                }, this);

                musicsCollection.on('syncStart update', function () {
                    if (musicsList !== undefined) {
                        musicsList.loading = true;
                    }
                });

                musicsCollection.on('syncEnd refresh', function () {
                    if (musicsList !== undefined) {
                        musicsList.loading = false;
                    }
                });

                Device.on('change:hasSDCard', function (Device, hasSDCard) {
                    if (musicsList !== undefined) {
                        if (!hasSDCard) {
                            musicsList.emptyTip = i18n.music.NO_SD_CARD_TIP_TEXT;
                        } else {
                            musicsList.emptyTip = i18n.music.MUSIC_EMPTY_TEXT;
                        }
                    }
                });
            },
            buildList : function () {
                musicsList = new SmartList({
                    itemView : MusicItemView.getClass(),
                    dataSet : [{
                        name : 'default',
                        getter : musicsCollection.getAll
                    }],
                    keepSelect : false,
                    $header : this.$('header'),
                    itemHeight : 35,
                    listenToCollection : musicsCollection
                });

                this.$el.append(musicsList.render().$el);

                musicsList.loading = musicsCollection.loading || musicsCollection.syncing;

                if (!Device.get('hasSDCard')) {
                    musicsList.emptyTip = i18n.music.NO_SD_CARD_TIP_TEXT;
                } else {
                    musicsList.emptyTip = i18n.music.MUSIC_EMPTY_TEXT;
                }

                musicsList.on('switchSet', function () {
                    musicsList.toggleEmptyTip(musicsList.currentModels.length === 0);
                });
            },
            render : function () {
                this.$el.html(this.template({}));

                this.buildList();

                return this;
            }
        });

        var bodyView;

        var SetRingWindowView = Panel.extend({
            initialize : function () {
                SetRingWindowView.__super__.initialize.apply(this, arguments);

                this.on('show', function () {
                    this.$('.w-ui-window-footer-monitor').html($('<button>').html(i18n.music.ADD_LOCAL_MUSIC_TEXT).addClass('button-import'));

                    bodyView = new BodyView();

                    this.$bodyContent = bodyView.render().$el;
                }, this);

                this.on('remove', function () {
                    MusicService.stopAsync();
                });
            },
            render : function () {
                _.extend(this.events, SetRingWindowView.__super__.events);
                this.delegateEvents();

                SetRingWindowView.__super__.render.apply(this, arguments);
            },
            clickButtonImport : function () {
                ImportMusicView.getInstance().show();
            },
            events : {
                'click .button-import' : 'clickButtonImport'
            }
        });

        var setRingWindowView;

        var factory = _.extend({
            getInstance : function () {
                if (!setRingWindowView) {
                    setRingWindowView = new SetRingWindowView({
                        height : 440,
                        width : 375,
                        title : i18n.welcome.EDIT_RING,
                        buttonSet : 'yes'
                    });
                }
                return setRingWindowView;
            }
        });

        return factory;
    });
}(this));
