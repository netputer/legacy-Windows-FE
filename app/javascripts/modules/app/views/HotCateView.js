/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'ui/TemplateFactory',
        'Configuration',
        'IO'
    ], function (
        Backbone,
        _,
        doT,
        $,
        TemplateFactory,
        CONFIG,
        IO
    ) {
        console.log('HotCateView - File loaded.');

        var HotCateView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('app', 'hot-cate')),
            getSpecialAsync : function () {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.APP_SPECIAL,
                    data : {
                        opt_fields : ['alias', 'thumbnails.*'].join(','),
                        sortType : 'MODIFICATION',
                        max : 1
                    },
                    success : function (resp) {
                        deferred.resolve(resp);
                    },
                    error : function () {
                        deferred.reject();
                    }
                });

                return deferred.promise();
            },
            render : function () {
                this.$el.html(this.template({}));

                this.getSpecialAsync().done(function (resp) {
                    this.$el.html(this.template({

                    }));
                }.bind(this));
                return this;
            }
        });

        var hotCateView;

        var factory = _.extend({
            getInstance : function () {
                if (!hotCateView) {
                    hotCateView = new HotCateView();
                }
                return hotCateView;
            }
        });

        return factory;
    });
}(this));
