/*global define, console*/
(function (window) {
    define([
        'ui/TipPanel'
    ], function (
        TipPanel
    ) {
        console.log('PopupTip - File loaded.');

        var PopupTip = TipPanel.extend({
            className : 'w-ui-popup-tip w-layout-hide',
            initialize : function () {
                PopupTip.__super__.initialize.apply(this, arguments);
                this.alignToHost = false;
                this.ignoreSelf = true;
                this.directionDown = false;
            },
            render : function () {
                this.$content = this.$host.data('title');
                if (this.$content) {
                    return PopupTip.__super__.render.call(this);
                }
                return this;
            }
        });

        return PopupTip;
    });
}(this));
