/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'ui/TemplateFactory',
        'ui/BaseListItem',
        'new_backuprestore/BackupRestoreService'
    ], function (
        Backbone,
        _,
        doT,
        $,
        TemplateFactory,
        BaseListItem,
        BackupRestoreService
    ) {

        var RemoteFileItemView = BaseListItem.extend({
            template : doT.template(TemplateFactory.get('new_backuprestore', 'restore-remote-file-list-item')),
            className : 'w-backuprestore-file-item hbox',
            render : function () {

                var info = this.model.toJSON();
                info.time = BackupRestoreService.FormatRestoreSnapshotList(info.timestamp);

                this.$el.html(this.template(info));
                return this;
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new RemoteFileItemView(args);
            },
            getClass : function () {
                return RemoteFileItemView;
            }
        });

        return factory;
    });
}(this));