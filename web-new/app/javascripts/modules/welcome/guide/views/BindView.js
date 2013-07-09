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
        'Settings',
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
        Settings,
        StringUtil,
        TemplateFactory,
        CardView
    ) {
        var BindView = CardView.getClass().extend({
            className : CardView.getClass().prototype.className + ' w-guide-bind',
            template : doT.template(TemplateFactory.get('guide', 'bind')),
            initialize : function () {
                this.listenTo(Device, 'change:deviceName', function (Device, deviceName) {
                    this.$('.stage .success p').html(StringUtil.format(i18n.welcome.GUIDE_BIND_DESC, Device.get('deviceName')));
                });

                this.on('next', function () {
                    Settings.set('user_guide_shown_bind', true, true);
                });
            },
            checkAsync : function () {
                var deferred = $.Deferred();

                var check = function (Device) {
                    IO.requestAsync(CONFIG.actions.WINDOW_DEVICE_NEED_BIND).done(function (resp) {
                        if (resp.body.value) {
                            deferred.resolve(resp);

                            log({
                                'event' : 'debug.guide_bind_show'
                            });
                        } else {
                            deferred.reject(resp);
                        }
                    }.bind(this)).fail(deferred.reject);
                };

                if (Settings.get('user_guide_shown_bind')) {
                    setTimeout(deferred.reject);
                } else {
                    if (Device.get('isConnected')) {
                        check.call(this, Device);
                    } else {
                        this.listenToOnce(Device, 'change:isConnected', check);
                    }
                }

                return deferred.promise();
            },
            clickButtonSkip : function () {
                BindView.__super__.clickButtonSkip.call(this);
                log({
                    'event' : 'ui.click.guide_bind_skip'
                });
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
