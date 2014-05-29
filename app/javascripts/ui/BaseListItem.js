/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore'
    ], function (
        Backbone,
        _
    ) {
        console.log('BaseListItem - File loaded. ');

        var BaseListItem = Backbone.View.extend({
            tagName : 'li',
            className : 'base-list-item',
            initialize : function () {
                this.render = _.wrap(this.render, function (renderFunc) {
                    var $checker = this.$('.item-checker');
                    if ($checker.length > 0) {
                        var checked = $checker.prop('checked');
                        renderFunc.call(this);
                        this.$('.item-checker').prop('checked', checked);
                    } else {
                        renderFunc.call(this);
                    }

                    return this;
                }.bind(this));
            },
            toggleSelect : function (select) {
                select = select !== undefined ? select : !this.$('.item-checker').prop('checked');
                this.$el.toggleClass('highlight', select);
                this.$('.item-checker').prop({
                    checked : select
                });
            },
            setup : function () {
                this.listenTo(this.model, 'change', this.render);
            },
            decouple : function () {
                this.stopListening(this.model, 'change', this.render);
            }
        });

        return BaseListItem;
    });
}(this));
