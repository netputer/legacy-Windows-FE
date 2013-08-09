/*global define*/
(function (window) {
    define([
        'underscore',
        'backbone',
        'doT',
        'ui/TemplateFactory'
    ], function (
        _,
        Backbone,
        doT,
        TemplateFactory
    ) {
        console.log('MonitorItemView - File loaded.');

        var MonitorItemView = Backbone.View.extend({
            tagName : 'li',
            className : 'w-message-contact-selector-monitor-item',
            template : doT.template(TemplateFactory.get('message', 'monitor-item-sender')),
            render : function () {
                this.$el.html(this.template(this.model.toJSON()));
                return this;
            },
            clickButtonDelete : function (evt) {
                this.$el.remove();
                this.trigger('delete', this.model);
            },
            events : {
                'click .button-delete' : 'clickButtonDelete'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new MonitorItemView(args);
            }
        });

        return factory;
    });
}(this));
