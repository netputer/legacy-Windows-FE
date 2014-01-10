/*global console, define*/
(function (window) {
    define([
        'underscore',
        'jquery',
        'ui/UIHelper',
        'Internationalization',
        'utilities/StringUtil'
    ], function (_, $, UIHelper, i18n, StringUtil) {

        var setInterval = window.setInterval;
        var clearInterval = window.clearInterval;

        var EventsMapping = UIHelper.EventsMapping;

        var clearCountdown = function (countdown) {
            clearInterval(countdown);
            this.off(EventsMapping.REMOVE, clearCountdown);
        };

        var AutoCloseMixin = {};

        AutoCloseMixin.initAutoClose = function () {
            var $countDown = $('<span>').addClass('countdown text-thirdly').html(StringUtil.format(i18n.ui.AUTO_CLOSE, Math.round(this.delay / 1000)));
            this.$('.w-ui-window-footer-monitor').empty().append($countDown);
        };

        AutoCloseMixin.countDown = function () {
            var $countdown = this.$('.w-ui-window-footer-monitor .countdown');

            var flag = 0;
            var countdown = setInterval(function () {
                flag++;
                var currentTime = Math.round(this.delay / 1000) - flag;
                $countdown.html(StringUtil.format(i18n.ui.AUTO_CLOSE, currentTime));
                if (currentTime === 0) {
                    clearCountdown.call(this, countdown);
                    this.remove();
                }
            }.bind(this), 1000);

            this.once(EventsMapping.REMOVE, clearCountdown);
        };

        return {
            mixin : function (that) {
                _.extend(that, AutoCloseMixin);

                var autoClose = false;
                var delay = 0;
                Object.defineProperties(that, {
                    delay : {
                        set : function (value) {
                            delay = parseInt(value, 10);
                        },
                        get : function () {
                            return delay;
                        }
                    }
                });

                var options = that.options || {};
                if (options.hasOwnProperty('autoClose')) {
                    var value = parseInt(options.autoClose, 10);
                    if (!_.isNaN(value)) {
                        autoClose = true;
                        delay = value;
                    } else {
                        console.warn('AutoCloseMixin - Parameter \'autoClose\' is not a number.');
                    }
                }

                if (autoClose) {
                    that.once(EventsMapping.RENDERED, AutoCloseMixin.initAutoClose, that);
                    that.once(EventsMapping.SHOW, AutoCloseMixin.countDown, that);
                }
            }
        };
    });
}(this));
