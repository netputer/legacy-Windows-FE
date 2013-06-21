/*global define, console*/
(function (window, undefined) {
    define([
        'backbone',
        'doT',
        'jquery',
        'underscore',
        'Device',
        'Internationalization',
        'Configuration',
        'ui/Panel',
        'ui/UIHelper',
        'ui/AlertWindow',
        'ui/TemplateFactory',
        'contact/ContactService',
        'IO',
        'message/models/ImportContextModel',
        'message/MessageService'
    ], function (
        Backbone,
        doT,
        $,
        _,
        Device,
        i18n,
        CONFIG,
        Panel,
        UIHelper,
        AlertWindow,
        TemplateFactory,
        ContactService,
        IO,
        ImportContextModel,
        MessageService
    ) {

        console.log('Message ImportSelectFileView - File Loaded');

        var csvReg = /\.csv$/;

        var $browserBtn = $('<button>').html(i18n.misc.EXPLORE).addClass('button_browser').addClass('primary');
        var ImportSelectFileBodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('message', 'import-file-select')),
            className : 'w-message-import-selectfile-body-ctn',
            initialize : function () {
                ImportSelectFileBodyView.__super__.initialize.apply(this, arguments);
                this.listenTo(Device, 'change:isConnected', function (Device, isConnected) {
                    this.$('input[file=name]').prop('disabled', !isConnected);
                    $browserBtn.prop('disabled', !isConnected);
                });
            },
            render : function () {
                this.$el.html(this.template({}));
                this.$('.browser').append($browserBtn);
                this.$('input[name=file]').on('keyup', function () {
                    var file = this.getFilePath();
                    this.checkFile(file);
                }.bind(this));
                return this;
            },
            clickBrowserBtn : function () {
                IO.requestAsync(CONFIG.actions.SMS_SELECT_SMS_FILE).done(function (resp) {
                    if (resp.state_code === 200) {
                        this.setFilePath(resp.body.value);
                        this.checkFile(resp.body.value);
                    }
                }.bind(this));
            },
            getFilePath : function () {
                return this.$('input[name=file]').val().trim();
            },
            setFilePath : function (file) {
                this.$('input[name=file]').val(file);
            },
            checkFile : function (file) {
                IO.requestAsync({
                    url : CONFIG.actions.CHECK_FILE_PATH,
                    data : {
                        file_path : file
                    }
                }).done(function (resp) {
                    if (resp.body.value === '2' && csvReg.test(file)) {
                        this.trigger('_CHECK_FILE', false);
                        this.$('.invalid').hide();
                    } else {
                        this.trigger('_CHECK_FILE', true);
                        this.$('.invalid').show();
                    }
                }.bind(this));
            },
            events: {
                'click .button_browser' : 'clickBrowserBtn'
            }
        });

        var $bodyView;
        var $switchBtn = $('<button>').html(i18n.contact.IMPORT_FROM_BACKUP).addClass('button_switch');
        var importSelectFileView;
        var ImportSelectFileView = Panel.extend({
            initialize : function () {
                ImportSelectFileView.__super__.initialize.apply(this, arguments);

                var fileValid = false;
                Object.defineProperties(this, {
                    fileValid : {
                        set : function (value) {
                            fileValid = value;
                        },
                        get : function () {
                            return fileValid;
                        }
                    }
                });

                this.on(UIHelper.EventsMapping.SHOW, function () {
                    $bodyView = new ImportSelectFileBodyView();
                    $bodyView.on('_CHECK_FILE', function (disable) {
                        this.fileValid = !disable;
                        this.setConfirmBtnDisable(disable);
                    }, this);

                    this.$bodyContent = $bodyView.render().$el;
                    this.center();
                    this.once('remove', $bodyView.remove, $bodyView);

                    this.setConfirmBtnDisable(true);
                }, this);

                this.listenTo(Device, 'change:isConnected', function (Device, isConnected) {
                    if (!isConnected) {
                        this.setConfirmBtnDisable(true);
                    } else {
                        this.setConfirmBtnDisable(!$bodyView.getFilePath());
                    }
                });

                this.buttons = [{
                    $button : $('<button>').html(i18n.ui.CONFIRM).addClass('button_confirm primary'),
                    eventName: 'button_confirm'
                }, {
                    $button : $('<button>').html(i18n.ui.CANCEL),
                    eventName : 'button_cancel'
                }];
            },
            setConfirmBtnDisable : function (disable) {
                this.$('.button_confirm').prop('disabled', disable);
            },
            clickCancelBtn : function () {
                this.remove();
            },
            clickConfirmBtn : function () {

                if (!this.fileValid) {
                    return;
                }

                ImportContextModel.set('files', $bodyView.getFilePath());
                this.trigger('_CONFIRM_BUTTON');
            },
            clickSwitchBtn : function () {
                this.trigger('_SWITCH_BUTTON');
            },
            render : function () {
                _.extend(this.events, ImportSelectFileView.__super__.events);
                this.delegateEvents();
                ImportSelectFileView.__super__.render.apply(this, arguments);

                this.$('.w-ui-window-footer-monitor').append($switchBtn);
            },
            refreshSwitchBtn : function () {
                MessageService.getSmsHasBackupAsync().done(function (resp) {
                    $switchBtn.toggle(resp.body.value);
                });
            },
            events : {
                'click .button_confirm' : 'clickConfirmBtn',
                'click .button_cancel' : 'clickCancelBtn',
                'click .button_switch' : 'clickSwitchBtn'
            }
        });

        var factory = {
            getInstance : function () {
                if (!importSelectFileView) {
                    importSelectFileView = new ImportSelectFileView({
                        title : i18n.message.WINDOW_IMPORT_TITLE,
                        disableX : true,
                        height : 260,
                        width : 450
                    });
                }

                return importSelectFileView;
            }
        };

        return factory;
    });
}(this));
