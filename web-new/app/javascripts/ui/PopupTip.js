/*global define, console*/
(function (window) {
    define([
        'underscore',
        'jquery',
        'ui/TipPanel'
    ], function (
        _,
        $,
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
            beforeRender : function () {
                this.$content = this.$host.data('title');
            }
        });

        return PopupTip;
    });
}(this));
