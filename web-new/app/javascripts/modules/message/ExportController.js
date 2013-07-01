/*global define*/
(function (window, undefined) {
    define([
        'backbone',
        'message/views/ExportSelectView',
        'message/views/ExportProgressView',
        'Internationalization'
    ], function (
        Backbone,
        ExportSelectView,
        ExportProgressView,
        i18n
    ) {

        console.log('Messgae ExportController - File loaded');

        var exportController;
        var exportSelectView;
        var exportProgressView;
        var ExportController = Backbone.View.extend({
            start : function (selectedConversationCount, selectSmsCount, allSms) {
                exportSelectView = ExportSelectView.getInstance();
                exportProgressView = ExportProgressView.getInstance();

                exportSelectView.show();
                exportSelectView.update(selectedConversationCount, selectSmsCount, allSms);
                exportProgressView.initState();
                this.buildEvents();
            },
            buildEvents : function () {
                exportSelectView.off('_NEXT_BTN');
                exportProgressView.off('_EXPORT_SMS_CANCEL');

                exportSelectView.on('_NEXT_BTN', function (type) {
                    this.showNextAndRemoveCurrent(exportSelectView, exportProgressView);
                    exportProgressView.exportConversations(type);
                }, this);

                exportProgressView.on('_EXPORT_SMS_CANCEL', function () {
                    this.showNextAndRemoveCurrent(exportProgressView, exportSelectView);
                }, this);
            },
            showNextAndRemoveCurrent : function (currentView, targetView) {
                var hideHandler = function () {
                    targetView.show();
                    currentView.off('hide', hideHandler);
                };

                currentView.on('hide', hideHandler, this);
                currentView.remove();
            }
        });

        exportController = new ExportController();
        return exportController;
    });
}(this));
