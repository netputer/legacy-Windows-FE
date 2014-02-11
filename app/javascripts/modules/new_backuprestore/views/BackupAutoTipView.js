/*global define, console*/
(function (window) {
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
        'new_backuprestore/BackupRestoreService'
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
        BackupRestoreService
    ) {
        console.log('BackupAutoTipView - File loaded. ');

        var BackupAutoTipBodyLocalView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('new_backuprestore', 'backup-local-auto-tip')),
            className : 'w-backup-auto-tip hbox',
            render : function () {
                this.$el.html(this.template({}));
                return this;
            }
        });

        var BackupAutoTipBodyRemoteView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('new_backuprestore', 'backup-remote-auto-tip')),
            className : 'w-backup-auto-tip hbox',
            render : function () {
                this.$el.html(this.template({}));
                return this;
            }
        });

        var BackupAutoTipView = Panel.extend({
            initialize : function () {
                BackupAutoTipView.__super__.initialize.apply(this, arguments);

                this.on(UIHelper.EventsMapping.SHOW, function () {
                    this.bodyView = this.options.isLocal ? new BackupAutoTipBodyLocalView() : new BackupAutoTipBodyRemoteView();
                    this.$bodyContent = this.bodyView.render().$el;
                    this.center();

                    this.once('remove', function () {
                        this.bodyView.remove();
                        this.bodyView = undefined;
                    });

                    log({
                        'event' : 'debug.autobackup.tip.show',
                        'is_local' : this.options.isLocal
                    });
                });

                var yesText = this.options.isLocal ? i18n.new_backuprestore.AUTO_BACKUP_YES : i18n.misc.CLOUD_BACKUP_OPEN;
                this.buttons = [{
                    $button : $('<button>').html(yesText).addClass('button-yes primary'),
                    eventName : 'button_yes'
                }, {
                    $button : $('<button>').html(i18n.new_backuprestore.AUTO_BACKUP_NO),
                    eventName : 'button_cancel'
                }];
            },
            clickButtonYes : function () {

                this.trigger('__YES');

                log({
                    'event' : 'ui.click.autobackup.tip.yes',
                    'is_local' : this.options.isLocal
                });
            },
            events : {
                'click .button-yes' : 'clickButtonYes'
            }
        });

        var backupAutoTipLocalView;
        var backupAutoTipRemoteView;

        var factory = _.extend({
            getLocalInstance : function () {
                if (!backupAutoTipLocalView) {
                    backupAutoTipLocalView = new BackupAutoTipView({
                        title : i18n.new_backuprestore.BACKUP_TITLE_LOCAL,
                        disableX : true,
                        isLocal : true
                    });
                }
                return backupAutoTipLocalView;
            },
            getRemoteInstance : function () {
                if (!backupAutoTipRemoteView) {
                    backupAutoTipRemoteView = new BackupAutoTipView({
                        title : i18n.new_backuprestore.BACKUP_TITLE_REMOTE,
                        disableX : true,
                        isLocal : false
                    });
                }
                return backupAutoTipRemoteView;
            }
        });

        return factory;
    });
}(this));
