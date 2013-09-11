/*global define*/
(function (window) {
    define([
        'jquery',
        'Internationalization',
        'ui/UIHelper',
        'ui/AlertWindow'
    ], function (
        $,
        i18n,
        UIHelper,
        AlertWindow
    ) {
        console.log('BackupRestoreConfirmtWindow - File loaded.');


        var confirmWindow = new AlertWindow({
            buttons : [{
                $button : $('<button>').html(i18n.ui.YES).addClass('primary'),
                eventName : 'button_yes'
            }, {
                $button : $('<button>').html(i18n.ui.NO),
                eventName : 'button_yes'
            }],
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

        return {confirm : confirm};
    });
}(this));
