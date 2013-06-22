/*global define*/
(function (window, undefined) {
    define([
        'backbone',
        'underscore',
        'doT',
        'Device',
        'Log',
        'ui/TemplateFactory',
        'Internationalization'
    ], function (
        Backbone,
        _,
        doT,
        Device,
        log,
        TemplateFactory,
        i18n
    ) {
        console.log('GallerySwitchView - File loaded.');

        var GallerySwitchView = Backbone.View.extend({
            tagName : 'li',
            className : 'root',
            template : doT.template(TemplateFactory.get('doraemon', 'menu-item')),
            initialize : function () {
                Backbone.on('switchModule', function (data) {
                    this.$el.toggleClass('selected highlight', data.module === 'gallery');
                }, this);
            },
            render : function () {
                this.$el.html(this.template({
                    name : i18n.misc.NAV_SHOW_GALLERY,
                    cateid : 'gallery',
                    displayCategory : 'gallery'
                }));

                return this;
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
                'click' : 'clickItem'
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

        return factory;
    });
}(this));
