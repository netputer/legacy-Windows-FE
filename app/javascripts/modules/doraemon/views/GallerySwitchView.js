/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'Device',
        'Log',
        'IO',
        'ui/TemplateFactory',
        'Internationalization',
        'Account',
        'Configuration'
    ], function (
        Backbone,
        _,
        doT,
        Device,
        log,
        IO,
        TemplateFactory,
        i18n,
        Account,
        CONFIG
    ) {
        console.log('GallerySwitchView - File loaded.');

        var GallerySwitchView = Backbone.View.extend({
            tagName : 'li',
            className : 'title hbox gallery',
            template : doT.template(TemplateFactory.get('doraemon', 'gallery-switch')),
            initialize : function () {
                Backbone.on('switchModule', function (data) {
                    this.$el.toggleClass('selected highlight', data.module === 'gallery');
                }, this);
            },
            render : function () {
                this.$el.html(this.template({
                    name : i18n.misc.NAV_SHOW_GALLERY,
                    cateid : 'gallery'
                }));

                return this;
            },
            clickButtonManagement : function (evt) {
                evt.stopPropagation();
                evt.preventDefault();

                if (!Account.get('isLogin')) {
                    Account.openRegDialog(i18n.misc.LOGIN_TO_MANAGE, 'gallery-manage');
                } else {
                    Backbone.trigger('switchModule', {
                        module : 'doraemon'
                    });
                }

                log({
                    'event' : 'ui.click.dora.button_manage',
                    'isLogin' : Account.get('isLogin')
                });
            },
            clickItem : function () {
                Backbone.trigger('switchModule', {
                    module : 'gallery'
                });

                log({
                    'event' : 'ui.click.dora_more_button',
                    'source' : 'sidebar',
                    'connected' : Device.get('isConnected')
                });
            },
            events : {
                'click' : 'clickItem',
                'click .button-management' : 'clickButtonManagement'
            }
        });

        var gallerySwitchView;

        var factory = _.extend({
            getInstance : function (args) {
                if (!gallerySwitchView) {
                    gallerySwitchView = new GallerySwitchView();
                }
                return gallerySwitchView;
            }
        });

        IO.Backend.Device.onmessage({
            'data.channel' : CONFIG.events.SIDEBAR_GALLERY
        }, function (data) {
            Backbone.trigger('switchModule', {
                module : 'gallery'
            });
        });

        return factory;
    });
}(this));
