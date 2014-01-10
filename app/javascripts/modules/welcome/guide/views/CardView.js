/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'jquery'
    ], function (
        Backbone,
        _,
        $
    ) {
        var CardView = Backbone.View.extend({
            className : 'w-guide-card vbox',
            checkAsync : function () {
                var deferred = $.Deferred();

                setTimeout(deferred.resolve);

                return deferred.promise();
            },
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
                this.trigger('next');
            },
            events : {
                'click .button-skip' : 'clickButtonSkip',
                'click .button-action' : 'clickButtonAction'
            }
        });

        var factory = _.extend({
            getInstance : function () {
                return new CardView();
            },
            getClass : function () {
                return CardView;
            }
        });

        return factory;
    });
}(this));
