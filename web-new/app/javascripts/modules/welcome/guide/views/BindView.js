/*global define*/
(function (window) {
    define([
        'jquery',
        'underscore',
        'doT',
        'Configuration',
        'Environment',
        'Internationalization',
        'IO',
        'Device',
        'Log',
        'utilities/StringUtil',
        'ui/TemplateFactory',
        'guide/views/CardView'
    ], function (
        $,
        _,
        doT,
        CONFIG,
        Environment,
        i18n,
        IO,
        Device,
        log,
        StringUtil,
        TemplateFactory,
        CardView
    ) {
        var BindView = CardView.getClass().extend({
            className : CardView.getClass().prototype.className + ' w-guide-bind vbox',
            template : doT.template(TemplateFactory.get('guide', 'bind')),
            initialize : function () {
                this.listenTo(Device, 'change:deviceName', function (Device, deviceName) {
                    this.$('.stage .success p').html(StringUtil.format(i18n.welcome.GUIDE_BIND_DESC, Device.get('deviceName')));
                });
            },
            checkAsync : function () {
                var deferred = $.Deferred();

                var check = function (Device) {
                    if (Device.get('isConnected')) {
                        IO.requestAsync(CONFIG.actions.WINDOW_DEVICE_NEED_BIND).done(function (resp) {
                            if (resp.body.value) {
                                deferred.resolve(resp);
                            } else {
                                deferred.reject(resp);
                            }
                        }.bind(this)).fail(deferred.reject);
                    }
                };

                var checkAndOff = function () {
                    Device.off('change', check);
                    check.call(this, Device);
                };

                if (Device.get('isConnected')) {
                    check.call(this, Device);
                } else {
                    Device.on('change:isConnected', checkAndOff, this);
                }

                setTimeout(function () {
                    deferred.resolve();
                });

                return deferred.promise();
            },
            clickButtonAction : function () {
                IO.requestAsync(CONFIG.actions.WINDOW_DEVICE_BIND);

                this.$('.stage .desc').remove();
                this.$('.stage .success').css({
                    display : '-webkit-box'
                });

                this.$('.button-action').prop('disabled', true);

                window.setTimeout(function () {
                    this.trigger('next');
                }.bind(this), 3000);

                log({
                    'event' : 'ui.click.guide_bind_view_action'
                });
            }
        });

        var factory = _.extend({
            getInstance : function () {
                return new BindView({
                    action : i18n.welcome.GUIDE_BIND_NOW
                });
            }
        });

        return factory;
    });
}(this));
