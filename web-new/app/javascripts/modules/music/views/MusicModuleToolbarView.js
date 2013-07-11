/*global define*/
(function (window) {
    define([
        'underscore',
        'doT',
        'jquery',
        'ui/Toolbar',
        'ui/TemplateFactory',
        'ui/AlertWindow',
        'Internationalization',
        'Device',
        'Log',
        'music/collections/MusicsCollection',
        'music/iTunes/iTunesService',
        'music/views/MusicsListView',
        'music/views/ImportMusicView',
        'music/MusicService',
        'music/iTunes/iTunesController'
    ], function (
        _,
        doT,
        $,
        Toolbar,
        TemplateFactory,
        AlertWindow,
        i18n,
        Device,
        log,
        MusicsCollection,
        iTunesService,
        MusicsListView,
        ImportMusicView,
        MusicService,
        iTunesController
    ) {
        console.log('MusicModuleToolbarView - File loaded. ');

        var alert = window.alert;

        var musicsListView;
        var musicsCollection;
        var settingButton;

        var MusicModuleToolbarView = Toolbar.extend({
            template : doT.template(TemplateFactory.get('music', 'toolbar')),
            className : Toolbar.prototype.className + ' w-music-toolbar',
            initialize : function () {
                Device.on('change', this.setButtonState, this);

                musicsCollection = MusicsCollection.getInstance();
                musicsCollection.on('refresh', this.setButtonState, this);
            },
            setButtonState : function () {
                this.$('.button-add-music, .button-refresh').prop({
                    disabled : !Device.get('isConnected') ||
                                !Device.get('hasSDCard')
                });

                this.$('.button-itunes').prop({
                    disabled : Device.get('isMounted') ||
                                !Device.get('isConnected') ||
                                !Device.get('hasSDCard') ||
                                Device.get('isWifi') ||
                                Device.get('isInternet')
                });

                this.$('.button-delete').prop({
                    disabled : !Device.get('isConnected') ||
                                !Device.get('hasSDCard') ||
                                musicsListView.selected.length === 0
                });

                this.$('.button-export').prop({
                    disabled : !Device.get('isConnected') ||
                                !Device.get('hasSDCard') ||
                                musicsListView.selected.length === 0 ||
                                musicsCollection.models.length === 0
                });
            },
            render : function () {
                this.$el.html(this.template({}));

                iTunesService.checkiTunesAsync().done(function (resp) {
                    if (resp.body.value) {
                        this.$('.button-itunes').show();
                    }
                }.bind(this));

                musicsListView = MusicsListView.getInstance({
                    $observer : this.$('.check-select-all')
                });

                musicsListView.on('select:change', this.setButtonState, this);

                this.setButtonState();

                return this;
            },
            clickButtonAddMusic : function () {
                ImportMusicView.getInstance().show();
            },
            clickButtonDelete : function () {
                MusicService.deleteMusicsAsync(musicsListView.selected);

                log({
                    'event' : 'ui.click.music.button.delete',
                    'count' : musicsListView.selected.length,
                    'source' : 'toolbar'
                });
            },
            clickButtonRefresh : function () {
                musicsCollection.syncAsync().fail(function () {
                    alert(i18n.common.REFRESH_ERROR);
                });
            },
            clickButtonExport : function () {
                MusicService.exportMusicsAsync(musicsListView.selected);

                log({
                    'event' : 'ui.click.music.button.export',
                    'count' : musicsListView.selected.length,
                    'source' : 'toolbar'
                });
            },
            clickButtonITunes : function () {
                iTunesController.start();
            },
            events : {
                'click .button-add-music' : 'clickButtonAddMusic',
                'click .button-delete' : 'clickButtonDelete',
                'click .button-refresh' : 'clickButtonRefresh',
                'click .button-export' : 'clickButtonExport',
                'click .button-itunes' : 'clickButtonITunes'
            }
        });

        var musicModuleToolbarView;

        var factory = _.extend({
            getInstance : function () {
                if (!musicModuleToolbarView) {
                    musicModuleToolbarView = new MusicModuleToolbarView();
                }
                return musicModuleToolbarView;
            }
        });

        return factory;
    });
}(this));
