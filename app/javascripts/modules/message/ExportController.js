/*global define*/
(function (window) {
    define([
        'backbone',
        'message/views/ExportSelectView',
        'message/views/ExportProgressView',
        'message/models/ExportContextModel',
        'Internationalization'
    ], function (
        Backbone,
        ExportSelectView,
        ExportProgressView,
        ExportContextModel,
        i18n
    ) {

        console.log('Messgae ExportController - File loaded');

        var exportController;
        var exportSelectView;
        var exportProgressView;

        var len;
        var select;
        var all;
        var ids;

        var ExportController = Backbone.View.extend({
            start : function () {

                ids = ExportContextModel.get('ids');
                len = ids.length;
                select = ExportContextModel.get('selectSmsCount');
                all =  ExportContextModel.get('allSms');

                exportSelectView = ExportSelectView.getInstance();
                exportProgressView = ExportProgressView.getInstance();

                exportSelectView.show();
                exportSelectView.update(len, select, all);

                exportProgressView.initState();
                exportSelectView.initState();
                this.buildEvents();
            },
            buildEvents : function () {
                exportSelectView.off('_NEXT_BTN');
                exportProgressView.off('_EXPORT_SMS_CANCEL');

                exportSelectView.on('_NEXT_BTN', function (type) {
                    this.showNextAndRemoveCurrent(exportSelectView, exportProgressView);
                    exportProgressView.exportConversations(type, ids);
                }, this);

                exportProgressView.on('_EXPORT_SMS_CANCEL', function () {
                    this.showNextAndRemoveCurrent(exportProgressView, exportSelectView);
                    exportSelectView.update(len, select, all);
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
