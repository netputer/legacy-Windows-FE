/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore'
    ], function (
        Backbone,
        _
    ) {
        var GuideView = Backbone.View.extend({
            className : 'w-guide-card',
            render : function () {
                this.$el.html(this.template({
                    action : this.options.action
                }));

                return this;
            },
            clickButtonSkip : function () {
                this.trigger('next');
            },
            clickButtonAction : function () {
                this.trigger('action');
            },
            events : {
                'click .button-skip' : 'clickButtonSkip',
                'click .button-action' : 'clickButtonAction'
            }
        });

        var factory = _.extend({
            getInstance : function () {
                return new GuideView();
            },
            getClass : function () {
                return GuideView;
            }
        });

        return factory;
    });
}(this));
