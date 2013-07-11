/*global define*/
(function (window) {
    define([
        'underscore',
        'doT',
        'jquery',
        'ui/Panel',
        'ui/TemplateFactory',
        'utilities/FormatDate',
        'Internationalization',
        'music/iTunes/iTunesData'
    ], function (
        _,
        doT,
        $,
        Panel,
        TemplateFactory,
        FormatDate,
        Internationalization,
        iTunesData
    ) {
        console.log('selectLibraryView file loaded');

        var localeText = Internationalization.music;
        var commonText = Internationalization.common;

        var SelectLibraryView = Panel.extend({
            className : Panel.prototype.className + ' w-iTunes-select-library-panel',

            initialize : function () {
                SelectLibraryView.__super__.initialize.call(this);

                var buttons = [{
                    $button : $('<button/>').addClass('primary').html(commonText.NEXT_STEP),
                    eventName : 'NEXT_STEP'
                }, {
                    $button : $('<button/>').html(commonText.CANCEL),
                    eventName : 'CANCEL'
                }];

                this.title  = localeText.ITUNES_IMPORT;
                this.width  = 430;
                this.height = 270;
                this.draggable = true;
                this.disableX  = true;
                this.buttons   = buttons;

                this.off('NEXT_STEP');
                this.off('CANCEL');

                this.on('NEXT_STEP', function () {
                    this.trigger('_NEXT_STEP', this.data[this.selectedIndex]);
                    this.close();
                }, this);

                this.on('CANCEL', function () {
                    this.trigger('_CANCEL');
                    this.close();
                }, this);
            },

            render : function () {
                _.extend(this.events, SelectLibraryView.__super__.events);
                this.delegateEvents();

                SelectLibraryView.__super__.render.call(this);
            },

            show : function (data) {
                SelectLibraryView.__super__.show.call(this);

                this.data = data;

                this.recovery();
                this.createContent(data);
            },

            recovery : function () {
                this.selectedIndex = 0;
                $('input:first', this.$el).prop('checked', 'checked');
            },

            createContent : function (data) {
                var tpl = doT.template(TemplateFactory.get('iTunes', 'select-library-content'));

                _.each(data, function (item) {
                    item.time = FormatDate('yyyy-MM-dd' ,item.create_time);
                });

                this.$bodyContent = tpl(data);
            },
            clickInput : function (evt) {
                this.selectedIndex = parseInt(evt.target.value, 10);
            },
            events : {
                'click input' : 'clickInput'
            }
        });

        var selectLibraryView;
        var factory = _.extend({
            getInstance : function () {
                if (!selectLibraryView) {
                    selectLibraryView = new SelectLibraryView();
                }

                return selectLibraryView;
            }
        });
        return factory;
    });
}(this));
