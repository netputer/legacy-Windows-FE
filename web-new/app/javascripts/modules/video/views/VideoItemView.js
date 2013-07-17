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
        console.log('VideoItemView - File loaded. ');

        var VideoItemView = BaseListItem.extend({
            template : doT.template(TemplateFactory.get('video', 'video-item')),
            className : 'w-video-list-item hbox',
            render : function () {
                this.$el.html(this.template(this.model.toJSON()));
                return this;
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new VideoItemView(args);
            },
            getClass : function () {
                return VideoItemView;
            }
        });

        return factory;
    });
}(this));
