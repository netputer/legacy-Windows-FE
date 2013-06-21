/*global define*/
(function (window, undefined) {
    define([
        'backuprestore/models/BackupContextModel',
        'backuprestore/BackupController',
        'backuprestore/RestoreController',
        'backuprestore/BackupRestoreService',
        'IOBackendDevice'
    ], function (
        BackupContextModel,
        BackupController,
        RestoreController,
        BackupRestoreService,
        IO
    ) {

        var BackupRestore = {
            BackupContextModel : BackupContextModel,
            BackupController : BackupController,
            RestoreController : RestoreController,
            BackupRestoreService : BackupRestoreService
        };

        IO.Backend.Device.onmessage({
            'data.channel' : 'backup.guide.start'
        }, function (data) {
            BackupController.start();
        }, this);

        return BackupRestore;
    });
}(this));
