/*global define*/
(function (window, undefined) {
    define([
        'underscore',
        'doT',
        'jquery',
        'Configuration',
        'ui/UIHelper',
        'ui/Panel',
        'Internationalization',
        'utilities/FormatString',
        'ui/TemplateFactory',
        'ui/behavior/ButtonSetMixin',
        'utilities/StringUtil',
        'music/iTunes/iTunesData'
    ], function (
        _,
        doT,
        $,
        CONFIG,
        UIHelper,
        Panel,
        Internationalization,
        FormatString,
        TemplateFactory,
        ButtonSetMixin,
        StringUtil,
        iTunesData
    ) {
        var localeText = Internationalization.music;
        var grid;
        var needCapacity;
        var totalSongs = 0;
        var PlayListView = Panel.extend({
            className : Panel.prototype.className + ' w-iTunes-playlist-panel',

            initialize : function () {
                PlayListView.__super__.initialize.call(this);

                var buttons = [{
                    $button : $('<button/>').html(Internationalization.common.PRE_STEP),
                    eventName : 'PRE_STEP'
                }, {
                    $button : $('<button/>').addClass('primary next-step').html(Internationalization.common.NEXT_STEP),
                    eventName : 'NEXT_STEP'
                }, {
                    $button : $('<button/>').html(Internationalization.common.CANCEL),
                    eventName : 'CANCEL'
                }];
                this.title = localeText.ITUNES_IMPORT;
                this.width = 600;
                this.height = 410;
                this.draggable = true;
                this.disableX = true;
                this.buttons  = buttons;
                this.$bodyContent = (doT.template(TemplateFactory.get('iTunes', 'playlist')))({});

                this.off('NEXT_STEP');
                this.off('PRE_STEP');
                this.off('CANCEL');

                this.on('NEXT_STEP', function () {
                    var selectediTunesIds = [];
                    var selectedPlaylistIds = [];

                    var selectedData = grid.getCheckedData();
                    var data = {
                        iTunesIds   : [],
                        playlistIds : [],
                        sourceType  : CONFIG.enums.ITUNES_IMPORT_PLAYLIST,
                        capacity : needCapacity
                    };
                    _.each(selectedData, function (item) {
                        data.iTunesIds = data.iTunesIds.concat(item.tracks_id);
                        data.playlistIds.push(item.id);
                    });

                    this.trigger('_NEXT_STEP', data);
                    this.close();
                }, this);

                this.on('PRE_STEP', function () {
                    this.trigger('_PRE_STEP');
                    this.hide();
                }, this);

                this.on('CANCEL', function () {
                    this.trigger('_CANCEL');
                    this.close();
                }, this);
            },

            show : function (data) {
                PlayListView.__super__.show.call(this);

                this.addContent(data.play_lists);
            },

            addContent: function (data) {
                this.initPlaylist();

                _.each(data, function (item) {
                    item.count = item.tracks_id.length;
                });

                grid.setData(data);
            },

            initPlaylist : function () {
                this.disableNextStep(false);

                var contentWrap = $('.playlist-content', this.$el);
                contentWrap.html('');

                grid = new wonder.ui.Grid({
                    colModel : [{
                        colLabel : localeText.PLAYLIST_NAME,
                        index : 'name',
                        name : 'name',
                        width : 310,
                        resizable : true,
                        sortable : true,
                        sorttype : 'text'
                    }, {
                        colLabel : localeText.AUDIOS_COUNT,
                        index : 'count',
                        name : 'count',
                        width : 200,
                        resizable : true,
                        sortable : true,
                        sorttype : 'number'
                    }],

                    rowHeight : 30,
                    multiSelectable : true,
                    checkboxColWidth : 25,
                    isContentMultiSelected : true
                });

                grid.render(contentWrap);

                grid.bind(wonder.ui.Grid.Events.SELECT, this.showSelectCountText, this);
                grid.bind(wonder.ui.Grid.Events.UNSELECT, this.showSelectCountText, this);
                grid.bind(wonder.ui.Grid.Events.SELECT_ALL, this.showSelectCountText, this);
                grid.bind(wonder.ui.Grid.Events.UNSELECT_ALL, this.showSelectCountText, this);

                this.showSelectCountText();
            },

            showSelectCountText : function () {
                var selectCountWrap = $('.select-count-wrap', this.$el);

                if (!selectCountWrap.length) {
                    selectCountWrap = $('<div/>').addClass('select-count-wrap');
                    selectCountWrap.appendTo(this.$('.w-ui-window-body'));
                }

                var selectedData  = grid.getCheckedData();
                var playlistCount = selectedData.length;
                var audiosCount   = 0;
                needCapacity  = 0;

                _.each(selectedData, function (item) {
                    audiosCount  += item.tracks_id.length;
                    needCapacity += parseInt(item.size, 10);
                });

                var text = FormatString(Internationalization.music.SELECT_PLAYLIST_COUNT_TEXT,
                                        playlistCount,
                                        audiosCount,
                                        StringUtil.readableSize(needCapacity)
                                        );

                selectCountWrap.html(text);

                if (selectedData.length) {
                    this.disableNextStep(false);
                } else {
                    this.disableNextStep(true);
                }
            },

            disableNextStep : function (isDisable) {
                $('.next-step', this.$el).prop('disabled', !!isDisable);
            }
        });

        var playListView;
        var factory = _.extend({
            getInstance : function () {
                if (!playListView) {
                    playListView = new PlayListView();
                }
                return playListView;
            }
        });

        return factory;
    });
}(this));
