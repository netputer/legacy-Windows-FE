/*global define*/
(function (window) {
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
        'IO',
        'contact/models/ImportContextModel',
        'contact/ContactService'
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
        IO,
        ImportContextModel,
        ContactService
    ) {

        console.log('ImportSelectFile - File loaded');

        var vcfCsvReg = /\.(vcf|csv)$/i;
        var onlyCsvReg = /\.(csv)$/i;
        var delimiter = '|';
        var alert = window.alert;

        var $browserBtn = $('<button>').html(i18n.misc.EXPLORE).addClass('button-browser').addClass('primary');
        var ImportSelectFileBodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('contact', 'import-file-select')),
            className : 'w-contact-import-selectfile-body-ctn',
            initialize : function () {
                ImportSelectFileBodyView.__super__.initialize.apply(this, arguments);

                this.listenTo(Device, 'change:isConnected', function (Device, isConnected) {
                    $browserBtn.prop('disabled', !isConnected);
                    this.$('input[name=file]').prop('disabled', isConnected);
                });
            },
            render : function () {
                this.$el.html(this.template({}));
                this.$('.browser').append($browserBtn);
                return this;
            },
            clickBrowserBtn : function () {

                IO.requestAsync(CONFIG.actions.CONTACT_SELECT_CONTACT_FILE).done(function (resp) {
                    if (resp.state_code === 200) {
                        var fileArray = resp.body.value, files = fileArray.join(delimiter);

                        this.setFilePath(files);
                        this.checkFile(files);
                    }
                }.bind(this));
            },
            setFilePath : function (files) {
                this.$('input[name=file]').val(files);
            },
            getFilePath : function () {
                return this.$('input[name=file]').val().trim();
            },
            checkFile : function (files) {
                var item;
                var fileArray = files.split(delimiter);
                var invalidEl = this.$('.invalid');
                var i = 0;
                var len = fileArray.length;

                var yesHandle = function () {
                    this.setFilePath('');
                    this.trigger('__SET_NEXT_BUTTON', true);
                    invalidEl.hide();
                };

                function backendCheckFilePath(files) {
                    IO.requestAsync({
                        url : CONFIG.actions.CHECK_FILE_PATH,
                        data : {
                            file_path : files
                        }
                    }).done(function (resp) {
                        if (resp.body.value !== '2') {
                            invalidEl.show();
                            this.trigger('__SET_NEXT_BUTTON', true);
                        } else {
                            this.trigger('__SET_NEXT_BUTTON', false);
                        }
                    }.bind(this));
                }

                if (fileArray.length > 1) {
                    for (i, len; i < len; i++) {
                        item = fileArray[i];
                        if (onlyCsvReg.test(item)) {
                            alert(i18n.contact.ALERT_SELECT_MORE_CSV_FILE, yesHandle, this);
                            break;
                        } else if (!vcfCsvReg.test(item)) {
                            this.trigger('__SET_NEXT_BUTTON', true);
                            invalidEl.show();
                            break;
                        } else {
                            backendCheckFilePath.call(this, item);
                        }
                    }
                } else {
                    if (vcfCsvReg.test(files)) {
                        backendCheckFilePath.call(this, files);
                    } else {
                        if (!files) {
                            invalidEl.hide();
                        } else {
                            invalidEl.show();
                        }
                        this.trigger('__SET_NEXT_BUTTON', true);
                    }
                }
            },
            events : {
                'click .button-browser' : 'clickBrowserBtn'
            }
        });

        var importSelectFileBodyView;
        var importSelectFileView;
        var $switchBtn = $('<button>').html(i18n.contact.IMPORT_FROM_BACKUP).addClass('button-switch');

        var ImportSelectFileView = Panel.extend({
            initialize : function () {
                ImportSelectFileView.__super__.initialize.apply(this, arguments);

                this.on(UIHelper.EventsMapping.SHOW, function () {
                    importSelectFileBodyView = new ImportSelectFileBodyView();

                    importSelectFileBodyView.on('__SET_NEXT_BUTTON', function (isDisable) {
                        this.setNextBtnDisable(isDisable);
                    }, this);

                    this.$bodyContent = importSelectFileBodyView.render().$el;
                    this.center();
                    this.refreshSwitchBtn();

                    this.setNextBtnDisable(true);

                    this.once('remove', importSelectFileBodyView.remove, importSelectFileBodyView);
                });

                Device.on('change:isConnected', function (Device, isConnected) {
                    if (!isConnected) {
                        this.setNextBtnDisable(true);
                    } else {
                        this.setNextBtnDisable(!importSelectFileBodyView.getFilePath());
                    }
                }, this);

                this.buttons = [{
                    $button : $('<button>').html(i18n.ui.NEXT).addClass('button-next primary'),
                    eventName : 'button_next'
                }, {
                    $button : $('<button>').html(i18n.ui.CANCEL),
                    eventName : 'button_cancel'
                }];
            },
            render : function () {
                _.extend(this.events, ImportSelectFileView.__super__.events);
                this.delegateEvents();
                ImportSelectFileView.__super__.render.apply(this, arguments);

                this.$('.w-ui-window-footer-monitor').append($switchBtn);
            },
            refreshSwitchBtn : function () {
                ContactService.getContactHasBackupAsync().done(function (resp) {
                    $switchBtn.toggle(resp.body.value);
                }.bind(this));
            },
            setNextBtnDisable : function (disable) {
                this.$('.button-next').prop('disabled', disable);
            },
            clickSwitchBtn : function () {
                this.trigger('_SWITCH_BUTTON');
            },
            clickNextBtn : function () {
                ImportContextModel.set('files', importSelectFileBodyView.getFilePath());
                this.trigger('_NEXT_STEP');
            },
            events : {
                'click .button-switch' : 'clickSwitchBtn',
                'click .button-next' : 'clickNextBtn'
            }
        });

        var factory = {
            getInstance : function () {
                if (!importSelectFileView) {
                    importSelectFileView = new ImportSelectFileView({
                        title : i18n.contact.WINDOW_IMPORT_TITLE,
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
