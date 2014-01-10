/*global define*/
(function (window) {
    define([
        'ui/TipPanel'
    ], function (
        TipPanel
    ) {
        console.log('PopupPanel - File loaded.');

        var PopupPanel = TipPanel.extend({
            className : 'w-ui-popup-panel w-layout-hide',
            initialize : function () {
                PopupPanel.__super__.initialize.apply(this, arguments);

                this.alignToHost = true;

                this.blurDelay = 300;

                var options = this.options || {};
                var key;
                for (key in options) {
                    if (options.hasOwnProperty(key)) {
                        this[key] = options[key];
                    }
                }
            }
        });

        return PopupPanel;
    });
}(this));
