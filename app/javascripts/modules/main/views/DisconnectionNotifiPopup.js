/*global define*/
(function (window) {
    define([
        'doT',
        'ui/TipPanel',
        'ui/TemplateFactory'
    ], function (
        doT,
        TipPanel,
        TemplateFactory
    ) {

        var DisconnectionNotifiPopup = TipPanel.extend({
            className : 'w-ui-popup-tip w-layout-hide w-ui-popup-tip-white',
            initialize : function () {
                DisconnectionNotifiPopup.__super__.initialize.apply(this, arguments);
                this.$content = doT.template(TemplateFactory.get('misc', 'disconnection-notifi'))();
                this.once('show', function () {
                    setTimeout(this.destory.bind(this), 30000);
                }, this);
            },
            show : function () {
                DisconnectionNotifiPopup.__super__.show.apply(this, arguments);
                this.$('div.arrow').css('left', '49.5px');
            },
            render : function () {
                DisconnectionNotifiPopup.__super__.render.apply(this, arguments);
                this.delegateEvents();
            },
            clickButtonClose : function () {
                this.destory();
            },
            destory : function () {
                this.hide();
                this.stopListening();
                this.trigger('remove');
            },
            events : {
                'click .button-close' : 'clickButtonClose'
            }
        });

        return DisconnectionNotifiPopup;
    });
}(this));
