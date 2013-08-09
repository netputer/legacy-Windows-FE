/*global define*/
(function (window, document) {
    define(['underscore', 'ui/EventsMapping'], function (_, EventsMapping) {
        console.log('ClickToHideMixin - File loaded');

        var setTimeout = window.setTimeout;

        var ClickToHideMixin = {};

        ClickToHideMixin.initClickToHideMixin = function () {
            this.clickToHideMixinOnShowHandler = function () {
                this.clickHandler = function (evt) {
                    if (!this.$el[0].contains(evt.target)) {
                        this.hide();
                        document.removeEventListener('click', this.clickHandler);
                    }
                }.bind(this);

                setTimeout(function () {
                    document.addEventListener('click', this.clickHandler, true);
                }.bind(this), 0);
            };

            this.on(EventsMapping.SHOW, this.clickToHideMixinOnShowHandler, this);
        };

        ClickToHideMixin.uninstallClickToHideMixin = function () {
            this.off(EventsMapping.SHOW, this.clickToHideMixinOnShowHandler);

            document.removeEventListener('click', this.clickHandler);
        };

        return {
            mixin : function (that) {
                _.extend(that, ClickToHideMixin);

                ClickToHideMixin.initClickToHideMixin.call(that);
            }
        };
    });
}(this, this.document));
