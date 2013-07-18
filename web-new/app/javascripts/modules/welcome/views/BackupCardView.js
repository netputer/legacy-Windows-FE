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
        'backuprestore/BackupController'
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
        BackupController
    ) {
        var alert = window.alert;

        var BackupCardView = FeedCardView.getClass().extend({
            template : doT.template(TemplateFactory.get('welcome', 'backup')),
            className : FeedCardView.getClass().prototype.className + ' backup',
            render : function () {
                this.$el.html(this.template({}));
                return this;
            },
            clickButtonAction : function () {
                if (!FunctionSwitch.ENABLE_CLOUD_BACKUP_RESTORE && !Device.get('isUSB')) {
                    alert(i18n.backup_restore.TIP_IN_WIFI);
                    return;
                }

                BackupController.start();
                this.remove();
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
