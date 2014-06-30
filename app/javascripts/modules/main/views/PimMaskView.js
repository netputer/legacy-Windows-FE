/*global define*/
(function (window) {
    define([
        'underscore',
        'backbone',
        'doT',
        'ui/TemplateFactory',
        'IO',
        'Configuration',
        'Device',
        'Log'
    ], function (
        _,
        Backbone,
        doT,
        TemplateFactory,
        IO,
        CONFIG,
        Device,
        log
    ) {
        console.log('PimMaskView - File loaded. ');

        var PimMaskView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('misc', 'pim-mask')),
            className : 'w-main-pim-mask module-main vbox',
            initialize : function () {
                var isShow = false;
                var transitionEndHandler = function () {
                    this.$el.hide().removeClass('hide');
                }.bind(this);

                Object.defineProperties(this, {
                    isShow : {
                        get : function () {
                            return isShow;
                        },
                        set : function (value) {
                            isShow = value;
                        }
                    },
                    transitionEndHandler : {
                        get : function () {
                            return transitionEndHandler;
                        }
                    }
                });

                this.listenTo(Device, 'change:isConnected change:isUSB change:isWifi change:connectionState', _.debounce(this.render, 500));
            },
            render : function () {
                this.$el.html(this.template({}));
                return this;
            },
            show : function () {
                if (this.isShow) {
                    return;
                }

                this.$el.off('webkitTransitionEnd', this.transitionEndHandler).removeClass('hide').show();
                this.isShow = true;
            },
            hide : function () {

                if (!this.isShow) {
                    return;
                }

                this.$el.one('webkitTransitionEnd', this.transitionEndHandler);
                this.$el.addClass('hide');

                this.isShow = false;
            },
            clickButtonAction : function () {
                IO.requestAsync({
                    url : CONFIG.actions.CONNET_PHONE,
                    data : {
                        from : SnapPea.CurrentModule
                    }
                });
            },
            events : {
                'click .button-action' : 'clickButtonAction'
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
