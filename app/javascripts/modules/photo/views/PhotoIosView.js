/*global define*/
(function (window) {
    define([
        'underscore',
        'backbone',
        'doT',
        'jquery',
        'Settings',
        'IO',
        'ui/TemplateFactory',
        'ui/Notification',
        'Internationalization',
        'Log',
        'Configuration'
    ], function (
        _,
        Backbone,
        doT,
        $,
        Settings,
        IO,
        TemplateFactory,
        Notification,
        i18n,
        log,
        CONFIG
    ) {
        console.log('PhotoIosView - File loaded. ');

        var PhotoIosView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('photo', 'ios-banner')),
            className : 'w-photo-ios-banner-ctn',
            render : function () {
                this.$el.html(this.template({}));
                return this;
            },
            clickBtnSms : function () {

                Settings.set('ios.banner.isclosed', true);
                var notification = new Notification({
                    type : 'html',
                    url : CONFIG.BASE_PATH + 'modules/sync/ios_advertisement.html?panel=send',
                    title : i18n.sync.IOS_ADVERTISMENT,
                    onclose : function () {

                        Settings.set('ios.banner.isclosed', true);
                        log({
                            event: 'ui.click.ios_download_close',
                            from : 'notification'
                        });
                    }
                });
                notification.show();

                log({
                    event : 'ui.click.ios_download_sms',
                    from : 'banner'
                });

            },
            clickBtnClose : function () {

                Settings.set('ios.banner.isclosed', true);
                this.$el.remove();
                this.trigger('ios.banner.close');

                log({
                    event : 'ui.click.ios_download_close',
                    from : 'banner'
                });
            },
            clickBtnDownload : function () {
                Settings.set('ios.banner.isclosed', true);

                log({
                    event : 'ui.click.ios_download_link',
                    from : 'banner'
                });
            },
            events : {
                'click .button-close' : 'clickBtnClose',
                'click .button-sms' : 'clickBtnSms',
                'click .button-download' : 'clickBtnDownload'
            }
        });

        var photoIosView;

        var factory = _.extend({
            getInstance : function (args) {
                if (!photoIosView) {
                    photoIosView = new PhotoIosView(args);
                }
                return photoIosView;
            }
        });

        return factory;

    });
}(this));
