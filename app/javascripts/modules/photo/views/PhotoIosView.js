/*global define*/
(function (window) {
    define([
        'underscore',
        'backbone',
        'doT',
        'jquery',
        'Settings',
        'IOBackendDevice',
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
            initilaize : function () {
                PhotoIosView.__super__.initilaize.apply(this, arguments);
            },
            render : function () {
                this.$el.html(this.template({}));
                return this;
            },
            clickBtnSms : function () {
                log({
                    event : 'ui.click.ios_download_sms',
                    from : 'banner'
                });

                Settings.set('ios.banner.isclosed', true);
                var notification = new Notification({
                    type : 'html',
                    url : CONFIG.BASE_PATH + 'modules/sync/ios_advertisement.html?panel=send',
                    title : i18n.sync.IOS_ADVERTISMENT,
                    onclose : function () {
                        log({
                            event: 'ui.click.ios_download_close',
                            from : 'notification'
                        });
                        Settings.set('ios.banner.isclosed', true);
                    }
                });
                notification.show();
            },
            clickBtnClose : function () {

                log({
                    event : 'ui.click.ios_download_close',
                    from : 'banner'
                });

                Settings.set('ios.banner.isclosed', true);
                this.$el.remove();
                this.trigger('ios.banner.close');
            },
            clickBtnDownload : function () {
                log({
                    event : 'ui.click.ios_download_link',
                    from : 'banner'
                });
                Settings.set('ios.banner.isclosed', true);
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
