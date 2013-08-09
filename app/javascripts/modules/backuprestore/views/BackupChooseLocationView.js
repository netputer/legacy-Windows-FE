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
        'ui/AlertWindow',
        'ui/Panel',
        'ui/UIHelper',
        'ui/TemplateFactory',
        'utilities/StringUtil',
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
        AlertWindow,
        Panel,
        UIHelper,
        TemplateFactory,
        StringUtil,
        BackupRestoreService,
        BackupContextModel
    ) {
        console.log('BackupChooseLocationView - File loaded. ');

        var alert = window.alert;

        var BackupChooseLocationBodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('backup', 'choose-backup-location')),
            className : 'w-backup-choose-location',
            invalidPattern : '[/\\\\:?*"<>|]',
            render : function () {
                this.$el.html(this.template({}));

                this.getFilePath();
                this.getFileName();

                return this;
            },
            showAndRecordError : function (msg, type) {
                alert(msg);
                log({
                    'event' : 'debug.backup.file_path.error',
                    'type' : type
                });
            },
            getFilePath : function () {
                BackupContextModel.set('filePath', '');

                BackupRestoreService.getSettingPathAsync().done(function (resp) {
                    var path = resp.body.value;
                    BackupContextModel.set('filePath', path);
                    this.$('.file-path').text(path);

                    this.trigger('loaded');
                }.bind(this)).fail(function () {
                    this.showAndRecordError(i18n.backup_restore.GET_FILE_PATH_FAILED, 0);
                }.bind(this));
            },
            getFileName : function () {
                BackupContextModel.set('fileName', '');

                BackupRestoreService.getDeviceTitleAsync().done(function (resp) {
                    // format file name
                    var name =  resp.body.value;
                    if (name !== undefined && name.length > 0) {
                        name = name.replace(/ /g, '_').replace(new RegExp(this.invalidPattern, "g"), '_');
                    }
                    var curDate = StringUtil.formatDate('yyyy-MM-dd-HH-mm-', new Date().valueOf());
                    name = curDate + name;

                    BackupContextModel.set('fileName', name);
                    this.$('.file-name').val(name);

                    this.trigger('loaded');
                }.bind(this)).fail(function () {
                    this.showAndRecordError(i18n.backup_restore.GET_FILE_NAME_FAILED, 1);

                    var name = i18n.backup_restore.DEFAULT_FILE_NAME;
                    BackupContextModel.set('fileName', name);
                    this.$('.file-name').val(name);

                    this.trigger('loaded');
                }.bind(this));
            },
            setFileName : function () {
                var name = this.$('.file-name').val().trim();
                BackupContextModel.set('fileName', name);
            },
            isFileNameLegal : function () {
                var name = this.$('.file-name').val().trim();
                return name && name !== '' && !new RegExp(this.invalidPattern).test(name);
            },
            clickButtonSetLocation : function () {
                BackupRestoreService.setSettingPathAsync(false).done(function (resp) {
                    // user canceled
                    if (resp.state_code === 402) {
                        return;
                    }

                    var path = resp.body.value;
                    BackupContextModel.set('filePath', path);
                    this.$('.file-path').text(path);
                    this.trigger('loaded');
                }.bind(this)).fail(function () {
                    this.showAndRecordError(i18n.backup_restore.SET_FILE_PATH_FAILED, 2);
                }.bind(this));
            },
            events : {
                'click .button-set-location' : 'clickButtonSetLocation'
            }
        });

        var bodyView;

        var BackupChooseLocationView = Panel.extend({
            initialize : function () {
                BackupChooseLocationView.__super__.initialize.apply(this, arguments);

                this.on(UIHelper.EventsMapping.SHOW, function () {
                    bodyView = new BackupChooseLocationBodyView();
                    this.$bodyContent = bodyView.render().$el;
                    this.center();

                    bodyView.on('loaded', this.updateButtonEnableState.bind(this));
                }, this);

                this.buttons = [{
                    $button : $('<button>').html(i18n.backup_restore.START_BACKUP).addClass('button-next primary'),
                    eventName : 'button_next'
                }, {
                    $button : $('<button>').html(i18n.ui.CANCEL),
                    eventName : 'button_cancel'
                }];
            },
            render : function () {
                _.extend(this.events, BackupChooseLocationView.__super__.events);
                this.delegateEvents();
                BackupChooseLocationView.__super__.render.apply(this, arguments);

                var $buttonLast = $('<button>').html(i18n.ui.PREV);
                $buttonLast.addClass('button-last');
                this.$('.w-ui-window-footer-monitor').append($buttonLast);

                this.$('.button-next').prop({
                    disabled : true
                });

                return this;
            },
            updateButtonEnableState : function () {
                this.$('.button-next').prop({
                    disabled : !BackupContextModel.IsFileNameReady
                });
            },
            clickButtonLast : function () {
                this.trigger('_LAST_STEP');
            },
            clickButtonNext : function () {
                if (!bodyView.isFileNameLegal()) {
                    alert(i18n.backup_restore.FILE_NAME_UNLEGAL);
                    return;
                }

                bodyView.setFileName();
                this.trigger('_NEXT_STEP');
            },
            events : {
                'click .button-last' : 'clickButtonLast',
                'click .button-next' : 'clickButtonNext'
            }
        });

        var backupChooseLocationView;

        var factory = _.extend({
            getInstance : function () {
                if (!backupChooseLocationView) {
                    backupChooseLocationView = new BackupChooseLocationView({
                        title : i18n.backup_restore.BACKUP_TITLE_LOCAL,
                        disableX : true,
                        height : BackupRestoreService.CONSTS.ViewHeight,
                        width : BackupRestoreService.CONSTS.ViewWidth
                    });
                }
                return backupChooseLocationView;
            }
        });

        return factory;
    });
}(this));
