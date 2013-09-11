/*global define*/
(function (window) {
    define([
        'jquery',
        'underscore',
        'ui/PopupPanel',
        'IO',
        'Configuration',
        'Log',
        'Device',
        'Internationalization',
        'new_backuprestore/models/BackupContextModel',
        'new_backuprestore/BackupRestoreService'
    ], function (
        $,
        _,
        PopupPanel,
        IO,
        CONFIG,
        log,
        Device,
        i18n,
        BackupContextModel,
        BackupRestoreService
    ) {
        console.log('BackupRestoreNotifierPanelView - File loaded. ');

        var NotifierPanelView = PopupPanel.extend({
            className: 'w-ui-popup-panel w-layout-hide w-backuprestore-popup',
            initialize : function () {
                NotifierPanelView.__super__.initialize.apply(this, arguments);
                this.destoryBlurToHideMixin();
            },
            show : function (type) {

                this.$content = this.getContent(type);

                setTimeout(function () {
                    this.hide();
                }.bind(this), 5000);

                NotifierPanelView.__super__.show.call(this);
            },
            render : function () {
                NotifierPanelView.__super__.render.apply(this, arguments);
                this.delegateEvents();
            },
            destory : function () {
                this.hide();
                this.stopListening();
            },
            getContent : function (type) {

                var $content;
                switch (type) {
                case 'LOCAL_BACKUP_COMPLETE':
                    $content = $('<div>').html(i18n.new_backuprestore.LOCAL_BACKUP_COMPLETE);
                    break;
                case 'LOCAL_RESTORE_COMPLETE':
                    $content = $('<div>').html(i18n.new_backuprestore.LOCAL_RESTORE_COMPLETE);
                    break;
                case 'REMOTE_BACKUP_COMPLETE':
                    $content = $('<div>').html(i18n.new_backuprestore.REMOTE_BACKUP_COMPLETE);
                    break;
                case 'REMORE_RESTORE_COMPLETE':
                    $content = $('<div>').html(i18n.new_backuprestore.REMORE_RESTORE_COMPLETE);
                    break;
                }

                return $content;
            },
            clickBtnShowfile : function () {
                var fileName = BackupContextModel.fileFullName;
                BackupRestoreService.showFileAsync(fileName);
            },
            events : {
                'click .show-file' : 'clickBtnShowfile'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new NotifierPanelView(args);
            }
        });

        return factory;
    });
}(this));
