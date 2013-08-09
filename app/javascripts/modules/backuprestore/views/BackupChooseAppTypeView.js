/*global define, console*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'Device',
        'Internationalization',
        'ui/Panel',
        'ui/UIHelper',
        'ui/TemplateFactory',
        'backuprestore/BackupRestoreService',
        'backuprestore/models/BackupContextModel'
    ], function (
        Backbone,
        _,
        doT,
        $,
        Device,
        i18n,
        Panel,
        UIHelper,
        TemplateFactory,
        BackupRestoreService,
        BackupContextModel
    ) {
        console.log('BackupChooseAppTypeView - File loaded. ');

        var BackupChooseAppTypeBodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('backup', 'choose-app-type')),
            className : 'w-backup-choose-app-type',
            initialize : function () {
                Device.on('change:isUSB', this.render, this);
            },
            render : function () {
                this.$el.html(this.template({}));

                // support full backup for app only in USB connect
                if (!Device.get('isUSB')) {
                    this.$('input[value=0]').prop({
                        disabled : true
                    });
                    this.$('.apk-desc').text(i18n.backup_restore.APP_TYPE_APK_CONTENT_WIFI);
                    this.$('.apk-title').removeClass('desc-title').addClass('text-secondary');
                }

                return this;
            },
            setBackupAppType : function () {
                var $checkedRadio = this.$('input[name="app_type"]:checked');
                BackupContextModel.set({
                    appType : parseInt($checkedRadio.attr('value'), 10)
                });
            }
        });

        var bodyView;

        var BackupChooseAppTypeView = Panel.extend({
            initialize : function () {
                BackupChooseAppTypeView.__super__.initialize.apply(this, arguments);

                this.on(UIHelper.EventsMapping.SHOW, function () {
                    bodyView = new BackupChooseAppTypeBodyView();
                    this.$bodyContent = bodyView.render().$el;
                    this.center();
                }, this);

                this.buttons = [{
                    $button : $('<button>').html(i18n.ui.NEXT).addClass('button-next primary'),
                    eventName : 'button_next'
                }, {
                    $button : $('<button>').html(i18n.ui.CANCEL),
                    eventName : 'button_cancel'
                }];
            },
            clickButtonNext : function () {
                bodyView.setBackupAppType();
                this.trigger('_NEXT_STEP');
            },
            events : {
                'click .button-next' : 'clickButtonNext'
            }
        });

        var backupChooseAppTypeView;

        var factory = _.extend({
            getInstance : function () {
                if (!backupChooseAppTypeView) {
                    backupChooseAppTypeView = new BackupChooseAppTypeView({
                        title : i18n.backup_restore.BACKUP_TITLE_LOCAL,
                        disableX : true,
                        height : 275,
                        width : BackupRestoreService.CONSTS.ViewWidthTip
                    });
                }
                return backupChooseAppTypeView;
            }
        });

        return factory;
    });
}(this));
