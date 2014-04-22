/*global define*/
(function (window) {
    define([
        'underscore',
        'backbone',
        'doT',
        'ui/TemplateFactory',
        'IO',
        'Configuration'
    ], function (
        _,
        Backbone,
        doT,
        TemplateFactory,
        IO,
        CONFIG
    ) {
        console.log('PimMaskView - File loaded. ');

        var PimMaskView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('misc', 'pim-mask')),
            className : 'w-main-pim-mask module-main vbox',
            initialize : function () {
                var isShow = false;
                Object.defineProperties(this, {
                    isShow : {
                        get : function () {
                            return isShow;
                        },
                        set : function (value) {
                            isShow = value;
                        }
                    }
                });
            },
            render : function () {
                this.$el.html(this.template({}));
                return this;
            },
            show : function () {
                if (this.isShow) {
                    return;
                }

                this.$el.show();
                this.isShow = true;
            },
            hide : function () {

                if (!this.isShow) {
                    return;
                }

                var transitionEndHandler = function () {
                    this.$el.hide().removeClass('hide');
                }.bind(this);

                this.$el.one('webkitTransitionEnd', transitionEndHandler);
                this.$el.addClass('hide');

                this.isShow = false;
            },
            clickButtonAction : function () {
                IO.requestAsync(CONFIG.actions.CONNET_PHONE);
            },
            events : {
                'click .action' : 'clickButtonAction'
            }
        });

        var factory = _.extend({
            getInstance : function () {
                return new PimMaskView();
            }
        });

        return factory;
    });
}(this));
