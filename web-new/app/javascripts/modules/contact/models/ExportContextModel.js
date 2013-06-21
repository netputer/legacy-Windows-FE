/*global console, define*/
(function (window, undefined) {
    define(['backbone'], function (Backbone) {
        console.log('ExportContextModel - File loaded.');

        var ExportContextModel = Backbone.Model.extend({
            defaults : {
                fileType : 0,

                selectNumber : 0,
                allNumber : 0,
                hasPhoneNumber : 0,

                selectedIdList : [],
                hasPhoneIdList : [],

                dataType : 0,

                exportFilePath : '',

                selectGroup : '',
                selectAccount : ''
            }
        });

        var exportContextModel = new ExportContextModel();

        return exportContextModel;
    });
}(this));