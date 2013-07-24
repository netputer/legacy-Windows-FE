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
        'Internationalization'
    ], function (
        Backbone,
        _,
        doT,
        $,
        TemplateFactory,
        BaseListItem,
        AlertWindow,
        UIHelper,
        i18n
    ) {

        console.log('PlayListItem - File loaded');


        var PlayListItemView = BaseListItem.extend({
            template : doT.template(TemplateFactory.get('iTunes', 'itunes-play-list-item')),
            tagName : 'li',
            className : 'itunes-play-list-item hbox',
            initialize : function () {
                PlayListItemView.__super__.initialize.apply(this, arguments);
            },
            render : function () {
                this.$el.html(this.template(this.model.toJSON()));
                return this;
            },
            remove : function () {
                PlayListItemView.__super__.remove.call(this, arguments);
            }
        });

        var factory = _.extend({
            getInstance : function () {
                return new PlayListItemView();
            },
            getClass : function () {
                return PlayListItemView;
            }
        });

        return factory;

    });
}(this));

