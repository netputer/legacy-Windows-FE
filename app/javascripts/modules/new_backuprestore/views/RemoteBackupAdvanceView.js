/*global define*/
(function (window) {
    define([
        'jquery',
        'backbone',
        'underscore',
        'doT',
        'Device',
        'Log',
        'Configuration',
        'Internationalization',
        'ui/TemplateFactory',
        'ui/UIHelper',
        'ui/Panel',
        'new_backuprestore/BackupRestoreService',
        'new_backuprestore/models/BackupContextModel'
    ], function (
        $,
        Backbone,
        _,
        doT,
        Device,
        log,
        CONFIG,
        i18n,
        TemplateFactory,
        UIHelper,
        Panel,
        BackupRestoreService,
        BackupContextModel
    ) {

        console.log('BackupLocalAdvanceView - File loaded');

        var BodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('new_backuprestore', 'remote-backup-advance')),
            className : "w-backuprestore-remote-backup-advance hbox",
            render : function () {

                this.$el.html(this.template({}));

                setTimeout(function () {
                    this.initState();
                }.bind(this), 0);

                return this;
            },
            initState : function () {
                _.map(BackupContextModel.get('dataIDList'), function (item) {
                    $('input[type=checkbox][value=' + item +  ']').prop('checked', true);
                });
            }
        });

        var RemoteBackupAdvanceView = Panel.extend({
            initialize : function () {
                RemoteBackupAdvanceView.__super__.initialize.apply(this, arguments);

                this.buttons = [{
                    $button : $('<button>').html(i18n.ui.CONFIRM).addClass('primary button_yes'),
                    eventName: 'button_yes'
                }, {
                    $button : $('<button>').html(i18n.ui.CANCEL).addClass('button_cancel'),
                    eventName : 'button_cancel'
                }];

                this.on(UIHelper.EventsMapping.SHOW, function () {
                    this.bodyView = new BodyView();
                    this.$bodyContent = this.bodyView.render().$el;
                    this.center();

                    this.once('remove', function () {
                        this.bodyView.remove();
                        this.bodyView = undefined;
                    }, this);
                });
            },
            clickButtonYes : function () {
                var list = [];
                _.map(this.$('input[type=checkbox]:checked'), function (input) {
                    list.push(parseInt(input.value, 10));
                });
                BackupContextModel.set('dataIDList', list);
            },
            events: {
                'click .button_yes' : 'clickButtonYes'
            }
        });

        var remoteBackupAdvanceView;
        var factory = _.extend({
            getInstance : function () {
                if (!remoteBackupAdvanceView) {
                    remoteBackupAdvanceView = new RemoteBackupAdvanceView({
                        title : i18n.new_backuprestore.BACKUP_ADVANCE_TITLE,
                        disableX: true,
                        width : '350px',
                        height : '130px'

                    });
                }

                return remoteBackupAdvanceView;
            }
        });

        return factory;
    });
}(this));
