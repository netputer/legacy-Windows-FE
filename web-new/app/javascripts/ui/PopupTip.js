/*global define, console*/
(function (window) {
    define([
        'underscore',
        'jquery',
        'ui/TipPanel',
        'ui/UIHelper'
    ], function (
        _,
        $,
        TipPanel,
        UIHelper
    ) {
        console.log('PopupTip - File loaded.');

        var setTimeout = window.setTimeout;

        var EventsMapping = UIHelper.EventsMapping;

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
