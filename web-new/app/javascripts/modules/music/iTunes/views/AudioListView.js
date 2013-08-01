/*global define*/
(function (window) {
    define([
        'underscore',
        'doT',
        'jquery',
        'backbone',
        'Configuration',
        'Internationalization',
        'ui/Panel',
        'ui/UIHelper',
        'ui/TemplateFactory',
        'ui/SmartList',
        'utilities/StringUtil',
        'music/iTunes/collections/ITunesCollection',
        'music/iTunes/collections/ITunesListCollection',
        'music/iTunes/views/AudioListItemView',
        'music/iTunes/views/PlayListItemView'
    ], function (
        _,
        doT,
        $,
        Backbone,
        CONFIG,
        i18n,
        Panel,
        UIHelper,
        TemplateFactory,
        SmartList,
        StringUtil,
        ITunesCollection,
        ITunesListCollection,
        AudioListItemView,
        PlayListItemView
    ) {

        console.log('PlayListView - File loaded');
        var itunesCollection;
        var itunesListCollection;
        var type = '';

        var ListView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('iTunes', 'itunes-audio-list')),
            className : "audio-list-content vbox",
            initialize : function () {
                ListView.__super__.initialize.apply(this, arguments);

                if (type === CONFIG.enums.ITUNES_IMPORT_PLAYLIST) {
                    this.template = doT.template(TemplateFactory.get('iTunes', 'itunes-play-list'));
                }
            },
            render : function () {
                this.$el.html(this.template({}));
                var itemView = AudioListItemView.getClass();
                var collection = itunesCollection;

                if (type === CONFIG.enums.ITUNES_IMPORT_PLAYLIST) {
                    collection = itunesListCollection;
                    itemView = PlayListItemView.getClass();
                }

                this.audioList = new SmartList({
                    itemView : itemView,
                    dataSet : [{
                        name : 'default',
                        getter : collection.getAll
                    }],
                    $observer : this.$('.check-select-all'),
                    enableContextMenu : false,
                    $header : this.$('.w-smart-list-header'),
                    keepSelect : false,
                    itemHeight : 30,
                    listenToCollection : collection,
                    loading : collection.loading || collection.syncing
                });

                this.audioList.listenTo(collection, 'refresh', function () {
                    this.switchSet('default', collection.getAll);
                });

                var changeHandler;
                if (type === CONFIG.enums.ITUNES_IMPORT_PLAYLIST) {
                    changeHandler = function (ids) {
                        var tracks_count = 0;
                        var size = 0;
                        var models = [];

                        _.each(ids, function (id) {
                            var model = collection.get(id);

                            models.push(model);
                            size += parseInt(model.get('size'), 10);
                            tracks_count += parseInt(model.get('tracks_count'), 10);
                        });

                        this.trigger('__SELECT_CHANGE', {
                            ids : ids,
                            lists : ids.length,
                            models : models,
                            size : size,
                            tracks_count : tracks_count,
                            text : StringUtil.readableSize(size)
                        });

                    }.bind(this);
                } else {
                    changeHandler = function (ids) {
                        var size = 0;

                        _.each(ids, function (id) {
                            size += collection.get(id).get('size');
                        });

                        this.trigger('__SELECT_CHANGE', {
                            ids : ids,
                            size : size,
                            tracks_count : ids.length,
                            text : StringUtil.readableSize(size)
                        });
                    }.bind(this);
                }
                this.audioList.on('select:change', changeHandler);
                this.$('.w-smart-list-header').after(this.audioList.render().$el);

                collection.trigger('update');
                return this;
            },
            remove : function () {
                this.audioList.remove();
                ListView.__super__.remove.apply(this, arguments);
            }
        });

        var AudioListBodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('iTunes', 'audio-list')),
            initialize : function () {
                AudioListBodyView.__super__.initialize.call(this, arguments);

                if (type === CONFIG.enums.ITUNES_IMPORT_PLAYLIST) {
                    this.template = doT.template(TemplateFactory.get('iTunes', 'play-list'));
                }

                this.listView = new ListView();
                this.listenTo(this.listView, '__SELECT_CHANGE', function (data) {
                    var html;
                    if (type === CONFIG.enums.ITUNES_IMPORT_PLAYLIST) {
                        html = StringUtil.format(
                            i18n.music.SELECT_PLAYLIST_COUNT_TEXT,
                            data.lists,
                            data.tracks_count,
                            data.text
                        );
                    } else {
                        html = StringUtil.format(
                            i18n.music.SELECT_AUDIOS_COUNT_TEXT,
                            data.tracks_count,
                            data.text
                        );
                    }
                    this.$('.select-count-wrap').html(html);

                    this.trigger('__SELECT_CHANGE', data);

                }.bind(this));
            },
            render : function () {
                this.$el.html(this.template({}));
                this.$el.append(this.listView.render().$el);

                var warp = $('<div>').addClass('select-count-wrap');
                this.$el.append(warp);

                return this;
            },
            remove : function () {
                AudioListBodyView.__super__.remove.call(this, arguments);
                this.listView.remove();
            }
        });

        var AudioListView = Panel.extend({
            className : Panel.prototype.className + ' w-iTunes-audio-list-panel',
            initialize : function () {
                AudioListView.__super__.initialize.call(this, arguments);

                var ids = [];
                var needCapacity = 0;
                var models = [];
                Object.defineProperties(this, {
                    ids : {
                        set : function (value) {
                            ids = value;
                        },
                        get : function () {
                            return ids;
                        }
                    },
                    models : {
                        set : function (value) {
                            models = value;
                        },
                        get : function () {
                            return models;
                        }
                    },
                    needCapacity : {
                        set : function (value) {
                            needCapacity = value;
                        },
                        get : function () {
                            return needCapacity;
                        }
                    }
                });

                this.on(UIHelper.EventsMapping.SHOW, function () {
                    if (type === CONFIG.enums.ITUNES_IMPORT_PLAYLIST) {
                        itunesListCollection = ITunesListCollection.getInstance();
                    } else {
                        itunesCollection = ITunesCollection.getInstance();
                    }

                    this.bodyView = new AudioListBodyView();
                    this.$bodyContent = this.bodyView.render().$el;

                    this.listenTo(this.bodyView, '__SELECT_CHANGE', function (data) {

                        if (CONFIG.enums.ITUNES_IMPORT_PLAYLIST) {
                            this.models = data.models;
                        }

                        this.ids = data.ids;
                        this.needCapacity = data.size;

                        this.disableNextStep(!data.tracks_count);
                    }.bind(this));

                    this.once('remove', function () {

                        this.bodyView.remove();
                        itunesListCollection = undefined;
                        itunesCollection = undefined;
                    });
                });

                this.buttons = [{
                    $button : $('<button/>').html(i18n.ui.PREV).addClass('button-pre')
                }, {
                    $button : $('<button/>').addClass('primary next-step button-next').html(i18n.ui.NEXT)
                }, {
                    $button : $('<button/>').html(i18n.ui.CANCEL).addClass('button-cancel')
                }];
            },
            setType : function (t) {
                type = t;
            },
            disableNextStep : function (isDisable) {
                $('.next-step', this.$el).prop('disabled', !!isDisable);
            },
            clickButtonPre : function () {
                this.trigger('_PRE_STEP');
                this.close();
            },
            clickButtonNext : function () {
                var data;
                if (type === CONFIG.enums.ITUNES_IMPORT_PLAYLIST) {
                    data = {
                        iTunesIds   : [],
                        playlistIds : this.ids,
                        sourceType  : CONFIG.enums.ITUNES_IMPORT_PLAYLIST,
                        capacity : this.needCapacity
                    };
                    _.each(this.models, function (model) {
                        data.iTunesIds = data.iTunesIds.concat(model.get('tracks_id'));
                    });
                } else {
                    data = {
                        iTunesIds  : this.ids,
                        sourceType : CONFIG.enums.ITUNES_IMPORT_AUDIOS,
                        capacity : this.needCapacity
                    };
                }

                this.trigger('_NEXT_STEP', data);
                this.close();
            },
            clickButtonCancel : function () {
                this.trigger('_CANCEL');
                this.close();
            },
            events : {
                'click .button-pre' : 'clickButtonPre',
                'click .button-next' : 'clickButtonNext',
                'click .button-cancel' : 'clickButtonCancel'
            }
        });

        var audioListView;
        var factory = _.extend({
            getInstance : function () {
                if (!audioListView) {
                    audioListView = new AudioListView({
                        title : i18n.music.ITUNES_IMPORT,
                        width : 600,
                        height : 410,
                        draggable : true,
                        disableX : true
                    });
                }
                return audioListView;
            }
        });

        return factory;
    });
}(this));
