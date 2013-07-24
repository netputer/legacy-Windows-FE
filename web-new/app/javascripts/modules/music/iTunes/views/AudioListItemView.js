/*global define*/
(function (window) {
    define([
        'underscore',
        'doT',
        'ui/TemplateFactory',
        'ui/BaseListItem',
        'ui/AlertWindow',
        'Internationalization'
    ], function (
        _,
        doT,
        TemplateFactory,
        BaseListItem,
        AlertWindow,
        i18n
    ) {

        console.log('AudioListItem - File loaded');

        var AudioListItemView = BaseListItem.extend({
            template : doT.template(TemplateFactory.get('iTunes', 'itunes-audio-list-item')),
            tagName : 'li',
            className : 'itunes-audio-list-item hbox',
            initialize : function () {
                AudioListItemView.__super__.initialize.apply(this, arguments);
            },
            render : function () {
                this.$el.html(this.template(this.model.toJSON()));
                return this;
            },
            remove : function () {
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

