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
        console.log('BackupRestoreAlertWindow - File loaded.');


        var alertWindow = new AlertWindow({
            buttons : [{
                $button : $('<button>').html(i18n.ui.CONFIRM),
                eventName : 'button_yes'
            }],
            disableX : true,
            draggable : true,
            width : 360
        });

        var alert = function (content, showQQ, yesCallback, context) {
            alertWindow.$bodyContent = content;

            if (typeof yesCallback !== 'function') {
                context = yesCallback;
                yesCallback = undefined;
            }

            var yesHandler = function () {
                if (yesCallback !== undefined) {
                    yesCallback.call(context || window);
                }
            };

            alertWindow.on(UIHelper.EventsMapping.BUTTON_YES, yesHandler);

            var removeHandler = function () {
                alertWindow.off(UIHelper.EventsMapping.BUTTON_YES, yesHandler);
                alertWindow.off(UIHelper.EventsMapping.REMOVE, removeHandler);
            };

            alertWindow.on(UIHelper.EventsMapping.REMOVE, removeHandler);
            alertWindow.show();

            if (showQQ) {
                alertWindow.$('.w-ui-window-footer-monitor').empty().append(i18n.new_backuprestore.QQ);
            } else {
                alertWindow.$('.w-ui-window-footer-monitor').empty();
            }
        };

        return {alert : alert};
    });
}(this));
