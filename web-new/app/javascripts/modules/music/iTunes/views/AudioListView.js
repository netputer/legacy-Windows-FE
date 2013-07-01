/*global define*/
(function (window, undefined) {
    define([
        'underscore',
        'doT',
        'jquery',
        'Configuration',
        'Internationalization',
        'ui/Panel',
        'ui/TemplateFactory',
        'utilities/StringUtil',
        'utilities/FormatString',
        'music/iTunes/iTunesData'
    ], function (
        _,
        doT,
        $,
        CONFIG,
        i18n,
        Panel,
        TemplateFactory,
        StringUtil,
        formatString,
        iTunesData
    ) {
        var grid;
        var needCapacity;

        var AudioListView = Panel.extend({
            className : Panel.prototype.className + ' w-iTunes-audio-list-panel',
            initialize : function () {
                AudioListView.__super__.initialize.call(this);

                var buttons = [{
                    $button : $('<button/>').html(i18n.common.PRE_STEP),
                    eventName : 'PRE_STEP'
                }, {
                    $button : $('<button/>').addClass('primary next-step').html(i18n.common.NEXT_STEP),
                    eventName : 'NEXT_STEP'
                }, {
                    $button : $('<button/>').html(i18n.common.CANCEL),
                    eventName : 'CANCEL'
                }];

                this.title  = i18n.music.ITUNES_IMPORT;
                this.width  = 600;
                this.height = 410;
                this.draggable = true;
                this.disableX  = true;
                this.buttons   = buttons;
                this.$bodyContent = (doT.template(TemplateFactory.get('iTunes', 'audio-list')))({});

                this.off('NEXT_STEP');
                this.off('PRE_STEP');
                this.off('CANCEL');

                this.on('PRE_STEP', function () {
                    this.trigger('_PRE_STEP');
                    this.close();
                }, this);

                this.on('NEXT_STEP', function () {
                    var data = {
                        iTunesIds  : _.pluck(grid.getCheckedData(), 'id'),
                        sourceType : CONFIG.enums.ITUNES_IMPORT_AUDIOS,
                        capacity : needCapacity
                    };

                    this.trigger('_NEXT_STEP', data);
                    this.close();
                }, this);

                this.on('CANCEL', function () {
                    this.trigger('_CANCEL');
                    this.close();
                }, this);
            },

            show : function (data) {
                AudioListView.__super__.show.call(this);

                this.initAudioList();
                iTunesData.queryAudios().done(this.queryAudiosSuccess.bind(this)).fail(this.queryAudiosFail.bind(this));
            },

            initAudioList : function () {
                this.disableNextStep(false);

                var contentWrap = this.$('.audio-list-content');
                contentWrap.addClass('loading');
                contentWrap.html('');

                grid = new wonder.ui.Grid({
                    colModel : [{
                        colLabel : i18n.music.SING_NAME_TEXT,
                        index : 'title',
                        name : 'title',
                        width : 160,
                        resizable : true,
                        sortable : true,
                        sorttype : 'text'
                    }, {
                        colLabel : i18n.music.ARTIST_TEXT,
                        index : 'artist',
                        name : 'artist',
                        width : 140,
                        resizable : true,
                        sortable : true,
                        sorttype : 'text'
                    }, {
                        colLabel : i18n.music.ALBUM_TEXT,
                        index : 'album',
                        name : 'album',
                        width : 150,
                        resizable : true
                    }, {
                        colLabel : i18n.music.SING_SIZE_TEXT,
                        index : 'size',
                        name : 'size',
                        width : 70,
                        resizable : false,
                        sortable : true,
                        sorttype : 'number',
                        dataType : 'size'
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

                var selectedData = grid.getCheckedData();
                var audiosCount = selectedData.length;
                needCapacity = 0;
                _.each(selectedData, function (item) {
                    needCapacity += parseInt(item.size, 10);
                });

                var text = formatString(i18n.music.SELECT_AUDIOS_COUNT_TEXT,
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

            queryAudiosSuccess : function (data) {
                this.$('.audio-list-content').removeClass('loading');
                grid.setData(data.audio);
            },

            queryAudiosFail : function () {
                this.$('.audio-list-content').removeClass('loading');
            },

            disableNextStep : function (isDisable) {
                $('.next-step', this.$el).prop('disabled', !!isDisable);
            }
        });

        var audioListView;
        var factory = _.extend({
            getInstance : function () {
                if (!audioListView) {
                    audioListView = new AudioListView();
                }
                return audioListView;
            }
        });

        return factory;
    });
}(this));
