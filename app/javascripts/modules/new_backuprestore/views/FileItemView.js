/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'ui/TemplateFactory',
        'ui/BaseListItem'
    ], function (
        Backbone,
        _,
        doT,
        $,
        TemplateFactory,
        BaseListItem
    ) {

        var FileItemView = BaseListItem.extend({
            template : doT.template(TemplateFactory.get('new_backuprestore', 'restore-file-list-item')),
            className : 'w-backuprestore-file-item hbox',
            render : function () {
                this.$el.html(this.template(this.model.toJSON()));
                return this;
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new FileItemView(args);
            },
            getClass : function () {
                return FileItemView;
            }
        });

        return factory;
    });
}(this));