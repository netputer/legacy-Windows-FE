/*global console, Backbone, _, define, doT, $*/
(function (window) {
    define([
        'backbone',
        'doT',
        'jquery',
        'underscore',
        'contact/models/ExportContextModel',
        'contact/views/ExportSelectTypeView',
        'contact/views/ExportTipWindowView',
        'contact/views/ExportSelectNumberView',
        'contact/views/ExportProgressView'
    ], function (
        Backbone,
        doT,
        $,
        _,
        ExportContextModel,
        ExportSelectTypeView,
        ExportTipWindowView,
        ExportSelectNumberView,
        ExportProgressView
    ) {
        console.log('ExportController - File loaded. ');

        var exportSelectTypeView;
        var exportTipWindowView;
        var exportSelectNumberView;
        var exportProgressView;

        var ExportController = Backbone.View.extend({
            buildEvents : function () {
                exportSelectTypeView.off('_NEXT_STEP');
                exportTipWindowView.off('_NEXT_STEP');
                exportSelectNumberView.off('_NEXT_STEP');
                exportProgressView.off('_LAST_VIEW');
                exportProgressView.off('_CANCEL');

                exportSelectTypeView.on('_NEXT_STEP', function () {
                    var isVCard = (ExportContextModel.get('fileType') === 0);
                    var targetView = isVCard ? exportSelectNumberView : exportTipWindowView;
                    this.showNextAndRemoveCurrent(exportSelectTypeView, targetView);
                }, this);

                exportTipWindowView.on('_NEXT_STEP', function () {
                    this.showNextAndRemoveCurrent(exportTipWindowView, exportSelectNumberView);
                }, this);

                exportSelectNumberView.on('_NEXT_STEP', function () {
                    this.showNextAndRemoveCurrent(exportSelectNumberView, exportProgressView);
                    exportProgressView.exportContacts();
                }, this);

                exportProgressView.on('_LAST_VIEW', function () {
                    this.showNextAndRemoveCurrent(exportProgressView, exportSelectNumberView);
                }, this);

                exportProgressView.on('_CANCEL', function () {
                    exportProgressView.remove();
                }, this);
            },
            showNextAndRemoveCurrent : function (currentView, targetView) {
                var hideHandler = function () {
                    targetView.show();
                    currentView.off('hide', hideHandler);
                };

                currentView.on('hide', hideHandler, this);
                currentView.remove();
            },
            start : function () {
                exportSelectTypeView = exportSelectTypeView || ExportSelectTypeView.getInstance();
                exportTipWindowView = exportTipWindowView || ExportTipWindowView.getInstance();
                exportSelectNumberView = exportSelectNumberView || ExportSelectNumberView.getInstance();
                exportProgressView = exportProgressView || ExportProgressView.getInstance();

                this.buildEvents();
                exportSelectTypeView.show();
            }
        });

        var exportController = new ExportController();
        return exportController;
    });
}(this));
