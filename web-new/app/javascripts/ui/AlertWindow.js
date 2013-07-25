/*global define*/
(function (window) {
    define([
        'jquery',
        'ui/UIHelper',
        'ui/Panel',
        'Internationalization',
        'ui/behavior/Behaviors',
        'ui/behavior/ButtonSetMixin'
    ], function (
        $,
        UIHelper,
        Panel,
        i18n,
        Behaviors,
        ButtonSetMixin
    ) {
        console.log('AlertWindow - File loaded.');

        var defaultTitle = i18n.ui.TIP;

        var AlertWindow = Panel.extend({
            className : Panel.prototype.className + ' w-ui-alert-window',
            initialize : function () {
                AlertWindow.__super__.initialize.apply(this, arguments);

                Behaviors.AutoCloseMixin.mixin(this);

                var options = this.options || {};
                if (options.hasOwnProperty('title')) {
                    this.title = options.title;
                } else {
                    this.title = defaultTitle;
                }
                if (options.hasOwnProperty('width')) {
                    this.width = options.width;
                }
            }
        });

        var alertWindow = new AlertWindow({
            buttons : [{
                $button : $('<button>').html(i18n.ui.CONFIRM),
                eventName : 'button_yes'
            }],
            disableX : true,
            draggable : true,
            width : 360
        });

        var alert = function (content, callback, context) {
            alertWindow.$bodyContent = content;

            var handler = function () {
                if (callback !== undefined) {
                    callback.call(context || window);
                }
            };

            alertWindow.on(UIHelper.EventsMapping.BUTTON_YES, handler);

            var removeHandler = function () {
                alertWindow.off(UIHelper.EventsMapping.BUTTON_YES, handler);
                alertWindow.off(UIHelper.EventsMapping.REMOVE, removeHandler);
            };

            alertWindow.on(UIHelper.EventsMapping.REMOVE, removeHandler);

            alertWindow.show();
        };

        window.alert = alert;

        var confirmWindow = new AlertWindow({
            buttonSet : ButtonSetMixin.BUTTON_SET.YES_NO,
            draggable : true,
            width : 360
        });

        var confirm = function (content, yesCallback, cancelCallback, context) {
            confirmWindow.$bodyContent = content;

            if (typeof cancelCallback !== 'function') {
                context = cancelCallback;
                cancelCallback = undefined;
            }

            var yesHandler = function () {
                if (yesCallback !== undefined) {
                    yesCallback.call(context || window);
                }
            };
            var cancelHandler = function () {
                if (cancelCallback !== undefined) {
                    cancelCallback.call(context || window);
                }
            };

            confirmWindow.on(UIHelper.EventsMapping.BUTTON_YES, yesHandler);
            confirmWindow.on(UIHelper.EventsMapping.BUTTON_CANCEL, cancelHandler);

            var removeHandler = function () {
                confirmWindow.off(UIHelper.EventsMapping.BUTTON_YES, yesHandler);
                confirmWindow.off(UIHelper.EventsMapping.BUTTON_CANCEL, cancelHandler);
                confirmWindow.off(UIHelper.EventsMapping.REMOVE, removeHandler);
            };

            confirmWindow.on(UIHelper.EventsMapping.REMOVE, removeHandler);

            confirmWindow.show();
        };

        window.confirm = confirm;

        AlertWindow.alert = alert;
        AlertWindow.confirm = confirm;

        return AlertWindow;
    });
}(this));
