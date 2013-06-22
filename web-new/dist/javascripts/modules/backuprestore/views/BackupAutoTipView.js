/*global define, console*/
(function (window, undefined) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'Device',
        'Internationalization',
        'Log',
        'ui/Panel',
        'ui/UIHelper',
        'ui/TemplateFactory',
        'welcome/WelcomeService',
        'backuprestore/BackupRestoreService',
        'backuprestore/models/BackupContextModel'
    ], function (
        Backbone,
        _,
        doT,
        $,
        Device,
        i18n,
        log,
        Panel,
        UIHelper,
        TemplateFactory,
        WelcomeService,
        BackupRestoreService,
        BackupContextModel
    ) {
        console.log('BackupAutoTipView - File loaded. ');

        var BackupAutoTipBodyLocalView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('backup', 'backup-local-auto-tip')),
            className : 'w-backup-auto-tip hbox',
            initialize : function () {
            },
            render : function () {
                this.$el.html(this.template({}));

                return this;
            }
        });

        var BackupAutoTipBodyRemoteView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('backup', 'backup-remote-auto-tip')),
            className : 'w-backup-auto-tip hbox',
            initialize : function () {
            },
            render : function () {
                this.$el.html(this.template({}));

                return this;
            }
        });

        var bodyView;

        var BackupAutoTipView = Panel.extend({
            initialize : function () {
                BackupAutoTipView.__super__.initialize.apply(this, arguments);

                this.on(UIHelper.EventsMapping.SHOW, function () {
                    bodyView = this.options.isLocal ? new BackupAutoTipBodyLocalView() : new BackupAutoTipBodyRemoteView();
                    this.$bodyContent = bodyView.render().$el;
                    this.center();

                    log({
                        'event' : 'debug.autobackup.tip.show',
                        'is_local' : this.options.isLocal
                    });
                }, this);

                var yesText = this.options.isLocal ? i18n.backup_restore.AUTO_BACKUP_YES : i18n.backup_restore.AUTO_BACKUP_REMOTE_YES;
                this.buttons = [{
                    $button : $('<button>').html(yesText).addClass('button-next primary'),
                    eventName : 'button_next'
                }, {
                    $button : $('<button>').html(i18n.backup_restore.AUTO_BACKUP_NO),
                    eventName : 'button_cancel'
                }];
            },
            clickButtonNext : function () {
                this.trigger('_NEXT_STEP');

                log({
                    'event' : 'ui.click.autobackup.tip.yes',
                    'is_local' : this.options.isLocal
                });
            },
            events : {
                'click .button-next' : 'clickButtonNext'
            }
        });

        var backupAutoTipLocalView;
        var backupAutoTipRemoteView;

        var factory = _.extend({
            getLocalInstance : function () {
                if (!backupAutoTipLocalView) {
                    backupAutoTipLocalView = new BackupAutoTipView({
                        title : i18n.backup_restore.BACKUP_TITLE_LOCAL,
                        disableX : true,
                        width : BackupRestoreService.CONSTS.ViewWidth,
                        height : BackupRestoreService.CONSTS.ViewHeight,
                        isLocal : true
                    });
                }
                return backupAutoTipLocalView;
            },
            getRemoteInstance : function () {
                if (!backupAutoTipRemoteView) {
                    backupAutoTipRemoteView = new BackupAutoTipView({
                        title : i18n.backup_restore.BACKUP_TITLE_REMOTE,
                        disableX : true,
                        width : BackupRestoreService.CONSTS.ViewWidth,
                        height : BackupRestoreService.CONSTS.ViewHeight,
                        isLocal : false
                    });
                }
                return backupAutoTipRemoteView;
            }
        });

        return factory;
    });
}(this));