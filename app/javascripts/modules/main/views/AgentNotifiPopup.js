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

        var AgentNotifiPopup = TipPanel.extend({
            className : 'w-ui-popup-tip w-layout-hide',
            initialize : function () {
                AgentNotifiPopup.__super__.initialize.apply(this, arguments);

                this.alignToHost = true;

                this.$content = doT.template(TemplateFactory.get('misc', 'agent-notifi'))();

                this.once('show', function () {
                    setTimeout(this.destory.bind(this), 5000);
                }, this);
            },
            render : function () {
                AgentNotifiPopup.__super__.render.apply(this, arguments);
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

        return AgentNotifiPopup;
    });
}(this));
