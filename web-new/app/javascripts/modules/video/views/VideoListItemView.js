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
        console.log('VideoListItemView - File loaded. ');

        var VideoListItemView = BaseListItem.extend({
            template : doT.template(TemplateFactory.get('video', 'video-list-item')),
            className : 'w-video-list-item hbox',
            render : function () {
                this.$el.html(this.template(this.model.toJSON()));
                return this;
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new VideoListItemView(args);
            },
            getClass : function () {
                return VideoListItemView;
            }
        });

        return factory;
    });
}(this));
