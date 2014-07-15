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
        'Log',
        'WindowController',
        'utilities/StringUtil'
    ], function (
        _,
        Backbone,
        doT,
        TemplateFactory,
        IO,
        CONFIG,
        Device,
        log,
        WindowController,
        StringUtil
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
                this.listenTo(Device, 'change:pc_ip change:device_ip', _.debounce(function (Device) {
                    this.$('.client-ip').html(StringUtil.format(i18n.misc.CLIENT_IP, Device.get('pc_ip')));
                    this.$('.device-ip').html(StringUtil.format(i18n.misc.DEVICE_IP, Device.get('device_ip')));
                }.bind(this), 500));
            },
            render : function () {
                this.$el.html(this.template({
                    'clientIp' : Device.get('pc_ip'),
                    'deviceIp' : Device.get('device_ip')
                }));
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
            clickButtonCheck : function () {
                 WindowController.ShowErrorWizard();
            },
            clickButtonHelp : function () {
                IO.requestAsync({
                    url : CONFIG.actions.OPEN_URL,
                    data : {
                        url : ''
                    }
                });

                log({
                    'event' : 'ui.click.pim_mask_help'
                });
            },
            events : {
                'click .button-action' : 'clickButtonAction',
                'click .button-check' : 'clickButtonCheck',
                'click .button-help' : 'clickButtonHelp'
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
