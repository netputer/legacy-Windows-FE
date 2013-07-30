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
        var FeedCardView = Backbone.View.extend({
            className : 'w-welcome-feed-card hbox',
            tagName : 'li',
            remove : function () {
                FeedCardView.__super__.remove.call(this);
                this.options.parentView.initLayout();
            },
            getIndex : function () {
                var index = -1;
                var $items = $('.w-welcome-feed-card:visible');
                var i;
                for (i = 0; i < $items.length; i++) {
                    if ($items[i] === this.$el[0]) {
                        index = i;
                        break;
                    }
                }

                return index;
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
