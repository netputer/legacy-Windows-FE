/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'Configuration',
        'Internationalization',
        'Device',
        'Log',
        'FunctionSwitch',
        'ui/TemplateFactory',
        'ui/AlertWindow',
        'welcome/views/FeedCardView',
        'backuprestore/BackupController',
        'sync/SyncService'
    ], function (
        Backbone,
        _,
        doT,
        CONFIG,
        i18n,
        Device,
        log,
        FunctionSwitch,
        TemplateFactory,
        AlertWindow,
        FeedCardView,
        BackupController,
        SyncService
    ) {
        var alert = window.alert;

        var BackupCardView = FeedCardView.getClass().extend({
            template : doT.template(TemplateFactory.get('welcome', 'backup')),
            className : FeedCardView.getClass().prototype.className + ' backup hide',
            render : function () {
                this.$el.html(this.template({}));

                SyncService.getLastBackupDayAsync().done(function (resp) {
                    if (parseInt(resp.body.value, 10) >= 10) {
                        this.removeClass('hide');
                        this.options.parentView.initLayout();

                        log({
                            'event' : 'ui.show.welcome_card',
                            'type' : this.model.get('type')
                        });
                    }
                }.bind(this));
                return this;
            },
            clickButtonAction : function () {
                if (!FunctionSwitch.ENABLE_CLOUD_BACKUP_RESTORE && !Device.get('isUSB')) {
                    alert(i18n.backup_restore.TIP_IN_WIFI);
                    return;
                }

                BackupController.start();
                this.remove();

                log({
                    'event' : 'ui.click.welcome_card_action',
                    'type' : this.model.get('type'),
                    'index' : this.getIndex(),
                    'action' : 'backup'
                });
            },
            clickButtonIgnore : function () {
                this.remove();
            },
            events : {
                'click .button-action' : 'clickButtonAction',
                'click .button-ignore' : 'clickButtonIgnore'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new BackupCardView(args);
            }
        });

        return factory;
    });
}(this));
