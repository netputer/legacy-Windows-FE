/*global define*/
(function (window) {
    define([
        'jquery',
        'backbone',
        'underscore',
        'ui/Panel',
        'Configuration',
        'Internationalization',
        'utilities/StringUtil',
        'utilities/FormatDate',
        'ui/AlertWindow',
        'music/iTunes/collections/ITunesCollection',
        'music/iTunes/views/SelectLibraryView',
        'music/iTunes/views/SelectSourceView',
        'music/iTunes/views/AudioListView',
        'music/iTunes/views/ImportView'
    ], function (
        $,
        Backbone,
        _,
        Panel,
        CONFIG,
        i18n,
        StringUtil,
        FormatDate,
        AlertWindow,
        ITunesCollection,
        SelectLibraryView,
        SelectSourceView,
        AudioListView,
        ImportView
    ) {
        console.log('iTunes file loaded');

        var alert = AlertWindow.alert;
        var itunesCollection;

        function ITunesController() {
            var selectLibraryView;
            var selectSourceView;
            var audioListView;
            var importView;

            function showConfirmImport(data, continueCb, scope) {
                if (data.capacity <= Math.pow(1024, 3)) {
                    continueCb.call(scope, data);
                } else {
                    var time;
                    var capacity = StringUtil.readableSize(data.capacity);
                    var capacityNum = parseFloat(capacity);
                    var num;
                    if ((capacityNum * 1024) % 60) {
                        num = (capacityNum * 1024 / 60 / 60).toFixed(1);
                    } else {
                        num = capacityNum * 1024 / 60 / 60;
                    }

                    if (capacity.indexOf('GB') !== -1) {
                        time = StringUtil.format(i18n.misc.HOUR, num);
                    } else if (capacity.indexOf('TB') !== -1) {
                        time = StringUtil.format(i18n.misc.HOUR, num * 1024);
                    }

                    var tip = StringUtil.format(i18n.music.CONFIRM_IMPORT, capacity, time);
                    var buttons = [
                        {
                            $button : $('<button/>').addClass('primary').html(i18n.ui.OK),
                            eventName : 'OK'
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

                    tipPanelView.off('OK');
                    tipPanelView.off('CANCEL');

                    tipPanelView.on('OK', function () {
                        continueCb.call(scope, data);
                        tipPanelView.close();
                    }, this);

                    tipPanelView.on('CANCEL', function () {
                        itunesCollection.finishAsync();
                        tipPanelView.close();
                    }, this);

                    tipPanelView.show();
                }
            }

            function bindEvents() {

                selectLibraryView.off('_NEXT_STEP');
                selectLibraryView.off('_CANCEL');

                selectSourceView.off('_NEXT_STEP');
                selectSourceView.off('_CANCEL');

                audioListView.off('_PRE_STEP');
                audioListView.off('_CANCEL');
                audioListView.off('_NEXT_STEP');

                selectLibraryView.on('_NEXT_STEP', selectSourceView.show, selectSourceView);

                selectLibraryView.on('_CANCEL', itunesCollection.finishAsync, itunesCollection);

                selectSourceView.on('_NEXT_STEP', function (data) {
                    switch (parseInt(data.sourceType, 10)) {
                    case CONFIG.enums.ITUNES_IMPORT_ALL:
                        showConfirmImport(data, importView.show, importView);
                        selectSourceView.close();
                        break;
                    default:
                        audioListView.setType(data.sourceType);
                        audioListView.show();
                    }
                });

                selectSourceView.on('_CANCEL', itunesCollection.finishAsync, itunesCollection);

                audioListView.on('_PRE_STEP', selectSourceView.show, selectSourceView);

                audioListView.on('_NEXT_STEP', function (data) {
                    showConfirmImport(data, importView.show, importView);
                    selectSourceView.close();
                }, this);

                audioListView.on('_CANCEL', function () {
                    itunesCollection.finishAsync();
                    selectSourceView.close();
                }, this);
            }

            function showStartPanel(data) {
                selectLibraryView = SelectLibraryView.getInstance();
                selectSourceView  = SelectSourceView.getInstance();
                audioListView     = AudioListView.getInstance();
                importView        = ImportView.getInstance();

                var list = data.info;
                if (list.length === 1) {
                    selectSourceView.show(list);
                } else if (list.length > 1) {
                    selectLibraryView.show(list);
                } else {
                    this.startImportiTunesFail();
                }

                bindEvents();
            }

            return {
                start : function () {
                    if (!itunesCollection) {
                        itunesCollection = ITunesCollection.getInstance();
                    }
                    itunesCollection.beginAsync().done(showStartPanel.bind(this)).fail(this.startImportiTunesFail.bind(this));
                },

                startImportiTunesFail : function (data) {
                    var text;
                    switch (data.state_code) {
                    case 724:
                        text = i18n.music.ALEADY_EXIT_ITUNES_TASK;
                        break;
                    case 725:
                        text = i18n.music.NO_ITUNES_IMPORT_TASK;
                        break;
                    case 726:
                        text = i18n.music.PARSE_ITUNES_SOURCE_FAILD;
                        break;
                    case 727:
                        text = i18n.music.NO_ITUNES_FILE;
                        break;
                    default:
                        text = i18n.music.START_IMPORT_ITUNES_FAIL;
                        break;
                    }
                    alert(text);
                    itunesCollection.finishAsync();
                },

                finish : function () {
                    itunesCollection.finishAsync();
                }
            };
        }

        _.extend(ITunesController.prototype, Backbone.Events);

        var iTunes = new ITunesController();

        return iTunes;
    });
}(this));
