/*global define*/
(function (window) {
    define([
        'underscore',
        'doT',
        'jquery',
        'Log',
        'IOBackendDevice',
        'ui/Panel',
        'ui/AlertWindow',
        'ui/UIHelper',
        'Environment',
        'WindowController',
        'Device',
        'Configuration',
        'Internationalization',
        'ui/TemplateFactory',
        'ui/behavior/ButtonSetMixin',
        'utilities/StringUtil',
        'music/iTunes/collections/ITunesCollection'
    ], function (
        _,
        doT,
        $,
        log,
        IO,
        Panel,
        AlertWindow,
        UIHelper,
        Environment,
        WindowController,
        Device,
        Configuration,
        i18n,
        TemplateFactory,
        ButtonSetMixin,
        StringUtil,
        ITunesCollection
    ) {

        console.log('iTunes ImportView - File Loaded');

        var alert = window.alert;
        var localeText = i18n.music;

        var importAudiosProgressCls = 'import-audios-progress';
        var createPlaylistCls = 'create-playlist-progress';
        var currentSesstion;
        var currentHandler;
        var itunesCollection;
        var ImportView = Panel.extend({
            className : Panel.prototype.className + ' w-iTunes-import-panel',

            initialize : function () {
                ImportView.__super__.initialize.call(this);

                this.buttons = [
                    {
                        $button : $('<button/>').addClass('import cancel').html(i18n.ui.CANCEL),
                        eventName : 'import'
                    }
                ];

                this.on(UIHelper.EventsMapping.SHOW, function () {
                    itunesCollection = ITunesCollection.getInstance();

                    this.once('remove', function () {
                        itunesCollection = undefined;
                    });
                });

                this.$bodyContent = (doT.template(TemplateFactory.get('iTunes', 'iTunes-import')))({
                    title : localeText.IMPORTING_TITLE
                });
            },

            render : function () {
                _.extend(this.events, ImportView.__super__.events);
                this.delegateEvents();

                ImportView.__super__.render.call(this);
            },

            show : function (data) {
                ImportView.__super__.show.call(this);

                this.updatePanelTitleAndBtn(false);
                this.$('.' + importAudiosProgressCls).remove();
                this.$('.' + createPlaylistCls).remove();

                this.data = data;
                this.importAudiosData = {};
                this.createPlaylistData = {};

                switch (data.sourceType) {
                case Configuration.enums.ITUNES_IMPORT_ALL:
                    this.isCreatePlaylist = true;
                    this.importAudiosData = {};
                    this.createPlaylistData = {};

                    log({
                        'event' : 'debug.itunes.import',
                        'type' : 'all'
                    });
                    break;

                case Configuration.enums.ITUNES_IMPORT_PLAYLIST:
                    this.importAudiosData.itunes_id = data.iTunesIds.join(',');
                    this.createPlaylistData.playlist_id = data.playlistIds.join(',');
                    this.isCreatePlaylist = true;

                    log({
                        'event' : 'debug.itunes.import',
                        'type' : 'playlist'
                    });
                    break;

                case Configuration.enums.ITUNES_IMPORT_AUDIOS:
                    this.importAudiosData.itunes_id = data.iTunesIds.join(',');
                    this.isCreatePlaylist = false;

                    log({
                        'event' : 'debug.itunes.import',
                        'type' : 'audios'
                    });
                    break;
                }

                this.startImportAudios();
            },

            updatePanelTitleAndBtn : function (isImportFinish) {
                if (isImportFinish) {
                    this.$('h3').html(localeText.IMPORT_COMPLETE);
                    this.$('.import').removeClass('cancel').addClass('primary complete').html(i18n.ui.OK);
                } else {
                    this.$('h3').html(localeText.IMPORTING_TITLE);
                    this.$('.import').removeClass('complete').addClass('cancel').removeClass('primary').html(i18n.ui.CANCEL);
                }
            },

            renderProgress: function (data) {
                var progress = this.$('.' + data.className);
                if (progress.length) {
                    progress.remove();
                }

                var progressTpl = doT.template(TemplateFactory.get('iTunes', 'import-progress'));
                var $progress = progressTpl(data);
                this.$('.progress-wrap').append($progress);
            },

            startImportAudios : function () {
                var session = Configuration.events.AUDIOS_IMPORT_MESSAGE;

                this.renderProgress({
                    tip : i18n.music.IMPORTING_AUDIOS_TIP,
                    className : importAudiosProgressCls,
                    current : 0,
                    isFaild : false,
                    total : this.data.songs || this.data.iTunesIds.length
                });

                var current = this.$('.' + importAudiosProgressCls + ' .current');
                var total = this.$('.' + importAudiosProgressCls + ' .total');

                var handler = IO.Backend.Device.onmessage({
                    'data.channel' : session
                }, function (message) {

                    current.html(message.current);
                    total.html(message.total);
                    if (message.current === message.total) {
                        IO.Backend.Device.offmessage(handler);
                    }

                }, this);

                currentSesstion = session;
                currentHandler = handler;

                this.importAudiosData.session = session;
                WindowController.blockWindowAsync();
                itunesCollection.importAudiosAsync(this.importAudiosData).done(this.importAudiosSuccess.bind(this)).fail(this.importAudiosFail.bind(this));
            },

            startCreatePlayList : function () {
                if (Device.get('isMounted')) {
                    alert(localeText.MOUNT_CANNOT_CREATE_PLAYLIST);

                    this.createPlaylistFail({
                        total : (this.data.playlistIds && this.data.playlistIds.length) || 0
                    });

                    this.updatePanelTitleAndBtn(true);
                    return;
                }

                var session = Configuration.events.PLAYLIST_IMPORT_MESSAGE;

                this.renderProgress({
                    tip : i18n.music.CREATING_PLAYLIST_TIP,
                    className : createPlaylistCls,
                    current : 0,
                    isFaild : false,
                    total : (this.data.play_lists && this.data.play_lists.length) || (this.data.playlistIds && this.data.playlistIds.length)
                });
                var current = this.$('.' + createPlaylistCls + ' .current');
                var total = this.$('.' + createPlaylistCls + ' .total');

                var handler = IO.Backend.Device.onmessage({
                    'data.channel' : session
                }, function (message) {
                    current.html(message.current);
                    total.html(message.total);

                    if (message.current === message.total) {
                        IO.Backend.Device.offmessage(handler);
                    }

                }, this);

                currentSesstion = session;
                currentHandler = handler;

                this.createPlaylistData.session = session;
                itunesCollection.createPlaylistAsync(this.createPlaylistData).done(this.createPlaylistSuccess.bind(this)).fail(this.createPlaylistFail.bind(this));
            },

            importAudiosSuccess : function (data) {
                if (data.success && data.success.length === data.total) {
                    this.$('.' + importAudiosProgressCls + ' .progress-tip').html(i18n.music.AUDIOS_IMPORT_COMPLETE);

                    if (this.isCreatePlaylist) {
                        this.startCreatePlayList();
                    } else {
                        this.updatePanelTitleAndBtn(true);
                    }
                } else {
                    this.importAudiosFail(data);
                }

                WindowController.releaseWindowAsync();
            },

            importAudiosFail : function (data) {
                IO.Backend.Device.offmessage(currentHandler);
                var audiosData = {
                    tip : i18n.music.AUDIOS_IMPORT_FAILD,
                    className : importAudiosProgressCls,
                    isFaild : true,
                    current : (data.success && data.success.length) || 0,
                    total : data.total
                };
                this.renderProgress(audiosData);

                var tip = StringUtil.format(i18n.music.IMPORT_AUDIOS_FAILD_TIP, data.failed.length);
                var buttons = [{
                    $button : $('<button/>').addClass('primary retry').html(i18n.ui.RETRY),
                    eventName : 'RETRY'
                }, {
                    $button : $('<button/>').addClass('ignore').html(i18n.ui.IGNORE),
                    eventName : 'IGNORE'
                }, {
                    $button : $('<button/>').html(i18n.ui.CANCEL),
                    eventName : 'CANCEL'
                }];

                var tipPanelView = new Panel({
                    title : i18n.ui.TIP,
                    width : 360,
                    disableX : true,
                    draggable : true,
                    buttons : buttons,
                    $bodyContent : tip
                });

                tipPanelView.off('RETRY');
                tipPanelView.off('IGNORE');
                tipPanelView.off('CANCEL');

                tipPanelView.on('RETRY', function () {
                    this.startImportAudios();
                    tipPanelView.close();
                }, this);

                tipPanelView.on('IGNORE', function () {
                    this.startCreatePlayList();
                    tipPanelView.close();
                }, this);

                tipPanelView.on('CANCEL', function () {
                    this.clickCancelImport();
                    tipPanelView.close();
                }, this);

                tipPanelView.show();

                IO.Backend.Device.onmessage({
                    'data.channel' : Configuration.events.DEVICE_STATE_CHANGE
                }, function (data) {
                    $('.retry', this.$el).prop('disabled', !Device.get('isConnected') || Device.get('isWifi') || Device.get('isInternet'));
                    $('.ignore', this.$el).prop('disabled', !Device.get('isConnected') || Device.get('isWifi') || Device.get('isInternet'));
                }, tipPanelView);

                WindowController.releaseWindowAsync();
            },

            createPlaylistSuccess : function (data) {
                this.updatePanelTitleAndBtn(true);
                IO.Backend.Device.offmessage(currentHandler);

                if (data.success && (data.success.length === data.total)) {
                    this.$('.' + createPlaylistCls + ' .progress-tip').html(i18n.music.CREATE_PLAYLIST_COMPLETE);
                } else {
                    this.createPlaylistFail(data);

                    var tip = StringUtil.format(i18n.music.CREATE_PLAYLIST_FAILD_TIP, data.failed.length);
                    var buttons = [
                        {
                            $button : $('<button/>').addClass('primary retry').html(i18n.ui.RETRY),
                            eventName : 'RETRY'
                        },
                        {
                            $button : $('<button/>').html(i18n.ui.CANCEL),
                            eventName : 'CANCEL'
                        }
                    ];

                    var tipPanelView = new Panel({
                        title : i18n.ui.TIP,
                        width : 360,
                        disableX : true,
                        draggable : true,
                        buttons : buttons,
                        $bodyContent : tip
                    });

                    tipPanelView.off('RETRY');
                    tipPanelView.off('CANCEL');

                    tipPanelView.on('RETRY', function () {
                        itunesCollection.createPlaylistAsync(this.createPlaylistData).done(this.createPlaylistSuccess.bind(this)).fail(this.createPlaylistFail.bind(this));
                        tipPanelView.close();
                        this.updatePanelTitleAndBtn(false);
                    }, this);

                    tipPanelView.on('CANCEL', function () {
                        tipPanelView.close();
                    }, this);

                    tipPanelView.show();
                    IO.Backend.Device.onmessage({
                        'data.channel' : Configuration.events.DEVICE_STATE_CHANGE
                    }, function (data) {
                        $('.retry', this.$el).prop('disabled', !Device.get('isConnected') || Device.get('isWifi') || Device.get('isInternet'));
                    }, tipPanelView);
                }

            },

            createPlaylistFail : function (data) {
                IO.Backend.Device.offmessage(currentHandler);
                var playlistData = {
                    tip : i18n.music.CREATE_PLAYLIST_FAILD,
                    className : createPlaylistCls,
                    isFaild : true,
                    current : (data.success && data.success.length) || 0,
                    total : data.total
                };
                this.renderProgress(playlistData);
            },

            clickCancelImport : function () {
                var data = {session: currentSesstion};
                IO.Backend.Device.offmessage(currentHandler);
                itunesCollection.cancelAsync(data);
                itunesCollection.finishAsync().always(this.closePanel.bind(this));

                WindowController.releaseWindowAsync();
            },

            clickCompleteImport: function () {
                itunesCollection.finishAsync().always(this.closePanel.bind(this));
            },

            closePanel : function () {
                this.close();
            },

            events : {
                'click .cancel' : 'clickCancelImport',
                'click .complete' : 'clickCompleteImport'
            }
        });


        var importView;
        var factory = _.extend({
            getInstance : function () {
                if (!importView) {
                    importView = new ImportView({
                        title : localeText.ITUNES_IMPORT,
                        width : 430,
                        height : 270,
                        draggable : true,
                        disableX : true
                    });
                }
                return importView;
            }
        });

        return factory;
    });
}(this));

