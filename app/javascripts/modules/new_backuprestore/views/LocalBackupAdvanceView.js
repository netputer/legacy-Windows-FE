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
        'utilities/StringUtil',
        'ui/TemplateFactory',
        'ui/UIHelper',
        'ui/AlertWindow',
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
        StringUtil,
        TemplateFactory,
        UIHelper,
        AlertWindow,
        Panel,
        BackupRestoreService,
        BackupContextModel
    ) {

        console.log('BackupLocalAdvanceView - File loaded');

        var alert = window.alert;
        var BodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('new_backuprestore', 'local-backup-advance')),
            className : "w-backuprestore-local-backup-advance hbox",
            invalidPattern : '[/\\\\:?*"<>|]',
            initialize : function () {
                BodyView.__super__.initialize.apply(this, arguments);

                var selectAppData = false;
                Object.defineProperties(this, {
                    selectAppData : {
                        set: function (value) {
                            selectAppData = value;
                        },
                        get: function () {
                            return selectAppData;
                        }
                    }
                });

                this.listenTo(Device, 'change:isUSB', function () {
                    var input = this.$('input[name=appdata]');
                    var isUSB = Device.get('isUSB');
                    var state = {
                        disabled : !isUSB,
                        checked : this.selectAppData
                    };

                    var list;
                    if (!isUSB) {
                        state.checked = false;

                        list = BackupContextModel.get('dataIDList');
                        _.filter(list, function (type) {
                            return type !== CONFIG.enums.BR_TYPE_APP_DATA;
                        });
                    } else if (this.selectAppData) {
                        list = BackupContextModel.get('dataIDList');
                        list.push(CONFIG.enums.BR_TYPE_APP_DATA);
                    }

                    input.prop(state);
                    BackupContextModel.set('dataIDList', list);
                });
            },
            render : function () {

                this.$el.html(this.template({
                    fileName : BackupContextModel.get('fileName'),
                    filePath : BackupContextModel.get('filePath')
                }));

                return this;
            },
            initState : function () {

                BackupRestoreService.getAppDataCountAsync().done(function (resp) {

                    this.$('input[type=checkbox][value=10]').prop('disabled', false);
                    BackupContextModel.get('dataNumList')[CONFIG.enums.BR_TYPE_APP_DATA] = parseInt(resp.body.value, 10);

                }.bind(this)).fail(function (resp) {

                    this.$('input[type=checkbox][value=10]').prop('disabled', true);
                    BackupContextModel.get('dataNumList')[CONFIG.enums.BR_TYPE_APP_DATA] = -1;

                }.bind(this));

                var defaultBackupType = BackupContextModel.get('appType');
                this.$('input[type=radio][value=' + defaultBackupType + ']').prop('checked', true);

                BackupRestoreService.getIsWdapkReadyAsync().done(function (resp) {
                    this.$('input[type=radio][value=2]').prop('disabled', !resp.body.value);
                }.bind(this));

                _.each(BackupContextModel.get('dataIDList'), function (item) {
                    this.$('input[type=checkbox][value=' + item +  ']').prop('checked', true);
                });
                var checked = this.$('input[type=checkbox]:checked');
                this.trigger('__ENABLE_CONFIRM', checked.length > 0);

                this.$('input[type=radio][value=' + BackupContextModel.get('appType') +  ']').prop('checked', true);
            },
            clickSetFilePath : function () {
                BackupRestoreService.setSettingPathAsync(false).done(function (resp) {

                    if (resp.state_code === 402) {
                        return;
                    }

                    var path = resp.body.value;
                    BackupContextModel.set('filePath', path);
                    this.$('.file-path').text(path);

                }.bind(this)).fail(function () {
                    BackupRestoreService.showAndRecordError(i18n.new_backuprestore.SET_FILE_PATH_FAILED, 2);
                }.bind(this));
            },
            isFileNameLegal : function () {
                var name = this.$('.file-name').val().trim();
                return name && name !== '' && !new RegExp(this.invalidPattern).test(name);
            },
            getFileName : function () {
                return this.$('.file-name').val().trim();
            },
            clickAppData: function (evt) {

                var checked = evt.target.checked;
                this.selectAppData = checked;

                if (checked) {
                    this.$('input[type=checkbox][name=app]').prop('checked', checked);
                }
            },
            clickApp : function (evt) {
                var checked = evt.target.checked;
                this.$('input[type=checkbox][name=appdata]').prop('checked', checked && this.selectAppData);
            },
            clickBackupContent : function () {
                var checked = this.$('input[type=checkbox]:checked');
                this.trigger('__ENABLE_CONFIRM', checked.length > 0);
            },
            events : {
                'click .change-backup-path' : 'clickSetFilePath',
                'click input[type=checkbox][name=appdata]' : 'clickAppData',
                'click input[type=checkbox][name=app]' : 'clickApp',
                'click input[type=checkbox]' : 'clickBackupContent'
            }
        });

        var LocalBackupAdvanceView = Panel.extend({
            initialize : function () {
                LocalBackupAdvanceView.__super__.initialize.apply(this, arguments);

                this.buttons = [{
                    $button : $('<button>').html(i18n.ui.CONFIRM).addClass('primary button_yes')
                }, {
                    $button : $('<button>').html(i18n.ui.CANCEL).addClass('button_cancel'),
                    eventName : 'button_cancel'
                }];

                this.on(UIHelper.EventsMapping.SHOW, function () {
                    this.bodyView = new BodyView();
                    this.$bodyContent = this.bodyView.render().$el;

                    this.listenTo(this.bodyView, '__ENABLE_CONFIRM', function (enable) {
                        this.$('.button_yes').prop('disabled', !enable);
                    });

                    this.bodyView.initState();
                    this.center();

                    this.once('remove', function () {
                        this.bodyView.remove();
                        this.bodyView = undefined;
                    }, this);
                });
            },
            clickButtonYes : function () {

                if (!this.bodyView.isFileNameLegal()) {
                    alert(i18n.new_backuprestore.FILE_NAME_UNLEGAL);
                    return;
                }

                BackupRestoreService.checkFileAsync(BackupContextModel.fileFullPath).done(function (resp) {
                    var status_code = parseInt(resp.body.value, 10);
                    if (status_code === 1) {
                        confirm(i18n.new_backuprestore.OVERWIRTE_EXISTS_FILE_TIP, function () {
                            BackupContextModel.set('fileName', this.bodyView.getFileName());
                            this.trigger('button_yes');
                        }, this);
                        return;
                    }

                    BackupContextModel.set('fileName', this.bodyView.getFileName());
                    this.trigger('button_yes');
                }.bind(this)).fail(function () {
                    alert(i18n.new_backuprestore.FILE_PATH_INVALID);
                });

                var list = [];
                _.each(this.$('input[type=checkbox]:checked'), function (input) {
                    list.push(parseInt(input.value, 10));
                });

                BackupContextModel.set('dataIDList', list);
                BackupContextModel.set('appType', $('input[type=radio]:checked').val());

            },
            events: {
                'click .button_yes' : 'clickButtonYes'
            }
        });

        var localBackupAdvanceView;
        var factory = _.extend({
            getInstance : function () {
                if (!localBackupAdvanceView) {
                    localBackupAdvanceView = new LocalBackupAdvanceView({
                        title : i18n.new_backuprestore.BACKUP_ADVANCE_TITLE,
                        disableX: true,
                        width : '450px',
                        height : '350px'

                    });
                }

                return localBackupAdvanceView;
            }
        });

        return factory;
    });
}(this));