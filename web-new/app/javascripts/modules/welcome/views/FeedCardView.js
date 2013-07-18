/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore'
    ], function (
        Backbone,
        _
    ) {
        var FeedCardView = Backbone.View.extend({
            className : 'w-welcome-feed-card hbox',
            tagName : 'li',
            remove : function () {
                FeedCardView.__super__.remove.call(this);
                this.options.parentView.initLayout();
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new FeedCardView(args);
            },
            getClass :  function () {
                return FeedCardView;
            }
        });

        return factory;
    });
}(this));
