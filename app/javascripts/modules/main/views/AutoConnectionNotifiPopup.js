/*global define*/
(function (window) {
    define([
        'doT',
        'Configuration',
        'IOBackendDevice',
        'ui/TipPanel',
        'ui/TemplateFactory'
    ], function (
        doT,
        CONFIG,
        IO,
        TipPanel,
        TemplateFactory
    ) {

        var AutoConnectionNotifiPopup = TipPanel.extend({
            className : 'w-ui-popup-tip w-layout-hide w-ui-popup-tip-white',
            initialize : function () {
                AutoConnectionNotifiPopup.__super__.initialize.apply(this, arguments);

                if (this.options.type === 'connection') {
                     this.$content = doT.template(TemplateFactory.get('misc', 'auto-connection-notifi'))();
                } else {
                    this.$content = doT.template(TemplateFactory.get('misc', 'disconnection-notifi'))();
                }

                this.once('show', function () {
                    setTimeout(this.destory.bind(this), 30000);
                }, this);
            },
            render : function () {
                AutoConnectionNotifiPopup.__super__.render.apply(this, arguments);
                this.delegateEvents();
            },
            show : function () {
                AutoConnectionNotifiPopup.__super__.show.apply(this, arguments);
                this.$('div.arrow').css('left', '49.5px');
            },
            clickButtonClose : function () {
                this.destory();
            },
            destory : function () {
                this.hide();
                this.stopListening();
                this.trigger('remove');
            },
            clickButtonAction : function () {
                this.destory();
                IO.sendCustomEventsAsync(CONFIG.events.WEB_NAVIGATE, {
                    type : CONFIG.enums.NAVIGATE_TYPE_DORAEMON,
                    id : '256-wdj-extension://__MSG_@@extension_id__/index.html?guide=1'
                });
            },
            events : {
                'click .button-close' : 'clickButtonClose',
                'click .button-action' : 'clickButtonAction'
            }
        });

        return AutoConnectionNotifiPopup;
    });
}(this));
