/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'ui/TemplateFactory',
        'ui/BaseListItem',
        'ui/AlertWindow',
        'ui/UIHelper',
        'Internationalization',
        'music/iTunes/collections/iTunesCollection'
    ], function (
        Backbone,
        _,
        doT,
        $,
        TemplateFactory,
        BaseListItem,
        AlertWindow,
        UIHelper,
        i18n,
        iTunesCollection
    ) {

        console.log('AudioListItem - File loaded');

        var itunesCollection;

        var AudioListItemView = BaseListItem.extend({
            template : doT.template(TemplateFactory.get('iTunes', 'itunes-audio-list-item')),
            tagName : 'li',
            className : 'itunes-audio-list-item hbox',
            initialize : function () {
                AudioListItemView.__super__.initialize.apply(this, arguments);
                itunesCollection = iTunesCollection.getInstance();
            },
            render : function () {
                this.$el.html(this.template(this.model.toJSON()));
                return this;
            },
            remove : function () {
                itunesCollection = undefined;
                AudioListItemView.__super__.remove.call(this, arguments);
            }
        });

        var factory = _.extend({
            getInstance : function () {
                return new AudioListItemView();
            },
            getClass : function () {
                return AudioListItemView;
            }
        });

        return factory;

    });
}(this));

