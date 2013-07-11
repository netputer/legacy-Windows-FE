/*global define*/
(function (window) {
    define([
        'underscore',
        'doT',
        'ui/TemplateFactory',
        'ui/BaseListItem'
    ], function (
        _,
        doT,
        TemplateFactory,
        BaseListItem
    ) {
        console.log('PhotoListItemView - File loaded. ');

        var PhotoListItemView = BaseListItem.extend({
            template : doT.template(TemplateFactory.get('photo', 'photo-list-item')),
            className : 'w-photo-list-item hbox',
            render : function () {
                this.$el.html(this.template(this.model.toJSON()));
                return this;
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new PhotoListItemView(args);
            },
            getClass : function () {
                return PhotoListItemView;
            }
        });

        return factory;
    });
}(this));
