/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'jquery',
        'Log',
        'IO'
    ], function (
        Backbone,
        _,
        $,
        log,
        IO
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
            },
            log : function (data, evt) {

                log(_.extend({
                    'event' : 'ui.click.welcome_card_action',
                    'name' : this.model ? this.model.get('feedName') : '',
                    'index' : this.getIndex(),
                    'element' : evt.currentTarget.nodeName
                }, data));
            },
            openUrl : function (url){
                IO.requestAsync({
                    url : CONFIG.actions.OPEN_URL,
                    data : {
                        url : url
                    }
                });
            },
            openDoraemon : function (id) {
                IO.sendCustomEventsAsync(CONFIG.events.WEB_NAVIGATE, {
                    type : CONFIG.enums.NAVIGATE_TYPE_DORAEMON,
                    id : id
                });
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
