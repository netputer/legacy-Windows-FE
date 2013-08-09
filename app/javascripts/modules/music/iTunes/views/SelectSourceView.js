/*global define*/
(function (window) {
    define([
        'underscore',
        'doT',
        'jquery',
        'ui/UIHelper',
        'ui/Panel',
        'ui/AlertWindow',
        'Internationalization',
        'ui/TemplateFactory',
        'utilities/StringUtil',
        'music/iTunes/collections/ITunesCollection'
    ], function (
        _,
        doT,
        $,
        UIHelper,
        Panel,
        AlertWindow,
        i18n,
        TemplateFactory,
        StringUtil,
        ITunesCollection
    ) {
        console.log('SelectSourceView - File loaded. ');

        var alert = window.alert;

        var songs = 0;
        var capacitySize;

        var itunesCollection;
        var SelectSourceView = Panel.extend({
            className  : Panel.prototype.className + ' w-iTunes-select-source-panel',
            initialize : function () {
                SelectSourceView.__super__.initialize.call(this);

                this.on(UIHelper.EventsMapping.SHOW, function () {
                    itunesCollection = ITunesCollection.getInstance();

                    this.once('remove', function () {
                        itunesCollection = undefined;
                    });
                });

                this.buttons = [{
                    $button : $('<button/>').addClass('primary next-step').html(i18n.ui.NEXT),
                    eventName : 'NEXT_STEP'
                }, {
                    $button : $('<button/>').html(i18n.ui.CANCEL),
                    eventName : 'CANCEL'
                }];

                this.sourceType = 0;

                this.off('NEXT_STEP');
                this.off('CANCEL');

                this.on('NEXT_STEP', function () {
                    this.playlistData.sourceType = this.sourceType;
                    this.playlistData.songs = songs;
                    this.playlistData.capacity = capacitySize;
                    this.trigger('_NEXT_STEP', this.playlistData);
                    this.hide();
                }, this);

                this.on('CANCEL', function () {
                    this.trigger('_CANCEL');
                    this.close();
                }, this);
            },
            render : function () {
                _.extend(this.events, SelectSourceView.__super__.events);
                this.delegateEvents();

                SelectSourceView.__super__.render.call(this);
            },
            show : function (data) {
                SelectSourceView.__super__.show.call(this);

                if (!!data) {
                    this.recovery();
                    this.createContent();

                    this.disableNextStep(true);
                    this.iTunesXMLdata = data;

                    var path = {
                        path : (this.iTunesXMLdata instanceof Array) ? this.iTunesXMLdata[0].path : this.iTunesXMLdata.path
                    };

                    itunesCollection.parseSourceAsync(path).done(this.parseSourceSuccess.bind(this)).fail(this.parseSourceFail.bind(this));
                }
            },
            recovery : function () {
                $('input:first', this.$el).prop('checked', 'checked');
                this.sourceType = 0;
                this.$bodyContent = '';
            },
            createContent : function () {
                var tpl = doT.template(TemplateFactory.get('iTunes', 'select-source-content'));

                var data = [{
                    label : i18n.music.ALL_AUDIOS_AND_PLAYLIST
                }, {
                    label : i18n.music.SELECT_PLAYLIST
                }, {
                    label : i18n.music.SELECT_AUDIOS
                }];

                this.$bodyContent = tpl(data);
            },
            disableNextStep : function (isDisabled) {
                this.$('.next-step').prop({
                    disabled : isDisabled
                });
            },
            parseSourceSuccess : function (data) {
                this.playlistData = data;

                if (!data || !data.play_lists || data.play_lists.length === 0) {
                    this.trigger('CANCEL');
                    alert(i18n.music.PARSE_EMPTY_LIST);
                    return;
                }

                var sourceInfoTpl = doT.template(TemplateFactory.get('iTunes', 'iTunes-source-info'));

                var audiosCount = data.songs;
                songs = data.songs;
                capacitySize = data.total;

                this.disableNextStep(false);

                var sourceInfo = {
                    playlistCount : data.play_lists.length,
                    audiosCount   : audiosCount,
                    capacitySize  : StringUtil.readableSize(capacitySize)
                };

                this.$('.source-tip').html(sourceInfoTpl(sourceInfo));
            },
            parseSourceFail : function (data) {
                alert(i18n.music.PARSE_ITUNES_SOURCE_FAIL);
                this.trigger('CANCEL');
            },
            events : {
                'change input' : function (e) {
                    this.sourceType = e.target.value;
                }
            }
        });

        var selectSourceView;

        var factory = _.extend({
            getInstance : function () {
                if (!selectSourceView) {
                    selectSourceView = new SelectSourceView({
                        title : i18n.music.ITUNES_IMPORT,
                        width : 430,
                        height : 270,
                        draggable : true,
                        disableX : true
                    });
                }

                return selectSourceView;
            }
        });

        return factory;
    });
}(this));
