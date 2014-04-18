/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'Configuration',
        'Internationalization',
        'Device',
        'FunctionSwitch',
        'ui/TemplateFactory',
        'ui/AlertWindow',
        'welcome/views/FeedCardView',
        'sync/SyncService'
    ], function (
        Backbone,
        _,
        doT,
        CONFIG,
        i18n,
        Device,
        FunctionSwitch,
        TemplateFactory,
        AlertWindow,
        FeedCardView,
        SyncService
    ) {
        var alert = window.alert;

        var BackupCardView = FeedCardView.getClass().extend({
            template : doT.template(TemplateFactory.get('welcome', 'backup')),
            className : FeedCardView.getClass().prototype.className + ' vbox backup hide',
            render : function () {
                this.$el.html(this.template({}));

                SyncService.getLastBackupDayAsync().done(function (resp) {
                    if (parseInt(resp.body.value, 10) >= 10) {
                        this.$el.removeClass('hide');
                        this.options.parentView.initLayout();
                    }
                }.bind(this));
                return this;
            },
            setSetting : function () {
                Settings.set('welcome-card-backup-show', Date.now(), true);
            },
            clickButtonAction : function () {

                if (!FunctionSwitch.ENABLE_CLOUD_BACKUP_RESTORE && !Device.get('isUSB')) {
                    alert(i18n.new_backuprestore.TIP_IN_WIFI);
                    return;
                }

                Backbone.trigger('switchModule', {
                    module : 'backup-restore'
                });

                this.setSetting();

                this.log({
                    action : 'backup'
                });

                this.remove();
            },
            clickButtonIgnore : function () {

                this.log({
                    action : 'ignore'
                });

                this.setSetting();
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
