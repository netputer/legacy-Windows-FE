/*global define, console*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'ui/TemplateFactory',
        'Configuration',
        'Device',
        'IO',
        'Internationalization',
        'Log'
    ], function (
        Backbone,
        _,
        doT,
        TemplateFactory,
        CONFIG,
        Device,
        IO,
        i18n,
        log
    ) {
        var ScreenControlView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('welcome', 'device-tools')),
            className : 'w-welcome-screen-control-ctn',
            render : function () {
                this.$el.html(this.template({}));

                return this;
            },
            clickButtonFullscreen : function () {
                IO.requestAsync(CONFIG.actions.FULL_SCREEN);

                log({
                    'event' : 'ui.click.welcome.fullscreen'
                });
            },
            clickButtonRefresh : function () {
                this.options.deviceView.showScreenshotAsync();

                log({
                    'event' : 'ui.click.welcome.refresh'
                });
            },
            clickButtonPlay : function () {
                this.$('.button-play')
                    .removeClass('button-play')
                    .addClass('button-pause')
                    .find('span')
                    .removeClass('play')
                    .addClass('stop');

                this.$('.button-pause .label').html(i18n.misc.PAUSE);

                this.options.deviceView.play();

                log({
                    'event' : 'ui.click.welcome.play'
                });
            },
            clickButtonPause : function () {
                this.$('.button-pause')
                    .removeClass('button-pause')
                    .addClass('play-black')
                    .addClass('button-play')
                    .find('span')
                    .removeClass('stop')
                    .addClass('play');

                this.$('.button-play .label').html(i18n.misc.PLAY);

                this.options.deviceView.stop();

                log({
                    'event' : 'ui.click.welcome.pause'
                });
            },
            events : {
                'click .button-fullscreen' : 'clickButtonFullscreen',
                'click .button-refresh' : 'clickButtonRefresh',
                'click .button-play' : 'clickButtonPlay',
                'click .button-pause' : 'clickButtonPause'
            }
        });

        var screenControlView;

        var factory = _.extend({
            getInstance : function (args) {
                if (!screenControlView) {
                    screenControlView = new ScreenControlView(args);
                }
                return screenControlView;
            }
        });

        return factory;
    });
}(this));

