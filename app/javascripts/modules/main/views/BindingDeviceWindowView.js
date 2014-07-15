/*global define*/
(function (window) {
    define([
        'underscore',
        'jquery',
        'doT',
        'ui/TemplateFactory',
        'ui/Panel',
        'Configuration',
        'Log',
        'IO',
        'Device',
        'Internationalization',
        'Environment'
    ], function (
        _,
        $,
        doT,
        TemplateFactory,
        Panel,
        CONFIG,
        log,
        IO,
        Device,
        i18n,
        Environment
    ) {
        console.log('BindingDeviceWindowView - File loaded. ');

        var BindingDeviceWindowView = Panel.extend({
            initialize : function () {
                BindingDeviceWindowView.__super__.initialize.apply(this, arguments);

                this.once('show', function () {
                    log({
                        'event' : 'offline.window.show'
                    });
                });

                this.once('remove', function () {
                    this.trigger('closed');
                }, this);

                this.on('button-unbind', this.clickButtonUnbinding, this);
                this.on('button-bind', this.clickButtonBinding, this);
            },
            clickButtonBinding : function () {
                IO.requestAsync(CONFIG.actions.WINDOW_DEVICE_BIND);

                this.remove();

                log({
                    'event' : 'offline.window.yes'
                });
            },
            clickButtonUnbinding : function () {
                IO.requestAsync(CONFIG.actions.WINDOW_DEVICE_UNBIND);

                this.remove();

                log({
                    'event' : 'offline.window.no'
                });
            },
            render : function () {
                BindingDeviceWindowView.__super__.render.apply(this, arguments);

                if (navigator.language !== CONFIG.enums.LOCALE_ZH_CN) {
                    this.$bodyContent = $(doT.template(TemplateFactory.get('misc', 'binding-devie-i18n'))({}));

                } else {
                    this.$bodyContent = $(doT.template(TemplateFactory.get('misc', 'binding-devie-cloud'))({}));
                }

                this.$('.w-ui-window-footer-monitor').append($('<span>').html(i18n.misc.BINDING_WARNING).addClass('text-secondary'));
                return this;
            },
            checkAsync : function () {
                var deferred = $.Deferred();

                var check = function (Device) {
                    if (!Device.get('isFastADB') && Device.get('isConnected')) {
                        IO.requestAsync(CONFIG.actions.WINDOW_DEVICE_NEED_BIND).done(function (resp) {
                            if (!resp.body.value) {
                                this.trigger('closed');
                            } else {
                                this.show();
                            }
                            deferred.resolve(resp);
                        }.bind(this)).fail(deferred.reject);
                        Device.off('change', check);
                    }
                };

                if (Environment.get('deviceId') !== 'Default') {
                    if (!Device.get('isFastADB') && Device.get('isConnected')) {
                        check.call(this, Device);
                    } else {
                        Device.on('change', check, this);
                    }
                }

                return deferred.promise();
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new BindingDeviceWindowView({
                    title : i18n.misc.BINDING_DEVICE,
                    buttons : [{
                        $button : $('<button>').html(i18n.misc.BIND).addClass('primary'),
                        eventName : 'button-bind'
                    }, {
                        $button : $('<button>').html(i18n.misc.UNBIND),
                        eventName : 'button-unbind'
                    }]
                });
            }
        });

        return factory;
    });
}(this));
