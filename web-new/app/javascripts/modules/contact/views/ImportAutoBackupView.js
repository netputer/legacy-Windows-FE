/*global define*/
(function (window) {
    define([
        'backbone',
        'doT',
        'jquery',
        'underscore',
        'Internationalization',
        'Configuration',
        'ui/UIHelper',
        'ui/TemplateFactory',
        'ui/Panel',
        'utilities/StringUtil',
        'contact/ContactService',
        'contact/models/ImportContextModel',
        'Device'
    ], function (
        Backbone,
        doT,
        $,
        _,
        i18n,
        Config,
        UIHelper,
        TemplateFactory,
        Panel,
        StringUtil,
        ContactService,
        ImportContextModel,
        Device
    ) {
        console.log('Contact - ImportAutoBackupView - File loaded.');

        var ImportAutoBackupBodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('contact', 'import-backup')),
            className : 'w-import-autobackup-body-ctn',
            initialize : function () {
                var backList = [];
                var loading = false;
                Object.defineProperties(this, {
                    backList : {
                        set : function (value) {
                            if (value instanceof Array) {
                                backList = value;
                            }
                        },
                        get : function () {
                            return backList;
                        }
                    },
                    loading : {
                        set : function (value) {
                            loading = Boolean(value);
                            this.$('.loading').toggle(loading);
                        },
                        get : function () {
                            return loading;
                        }
                    }
                });
            },
            render : function () {
                this.$el.html(this.template({
                    loading : this.loading,
                    list : this.backList
                }));

                this.$('ul li input').first().prop({
                    checked : true
                });

                return this;
            },
            loadSmsBackupData : function () {
                this.loading = true;

                ContactService.loadContactBackupAsync().done(function (resp) {
                    this.backList = resp.body.file;
                    this.render();
                    this.loading = false;
                }.bind(this));
            }
        });

        var ImportAutoBackupView = Panel.extend({
            initialize : function () {
                ImportAutoBackupView.__super__.initialize.call(this, arguments);

                var serviceCenter;
                Object.defineProperties(this, {
                    serviceCenter : {
                        set : function (value) {
                            serviceCenter = value;
                        },
                        get : function () {
                            return serviceCenter;
                        }
                    }
                });

                Device.on('channel:isConnected', function (Device, isConnected) {
                    this.setNextBtnDisable(!isConnected);
                }, this);

                this.on(UIHelper.EventsMapping.SHOW, function () {
                    var bodyView = new ImportAutoBackupBodyView();
                    this.$bodyContent = bodyView.render().$el;
                    bodyView.loadSmsBackupData();

                    this.center();

                    this.once('remove', bodyView.remove, bodyView);
                }, this);

                this.buttons = [{
                    $button : $('<button>').html(i18n.ui.NEXT).addClass('button-next primary'),
                    eventName : 'button-next'
                }, {
                    $button : $('<button>').html(i18n.ui.CANCEL),
                    eventName : UIHelper.EventsMapping.BUTTON_CANCEL
                }];
            },
            setNextBtnDisable : function (disable) {
                this.$('.button-next').prop('disabled', disable);
            },
            render : function () {
                _.extend(this.events, ImportAutoBackupView.__super__.events);
                this.delegateEvents();
                ImportAutoBackupView.__super__.render.apply(this, arguments);

                var $buttonSwitch = $('<button>').html(i18n.misc.IMPORT_FROM_FILE).addClass('button-switch');
                this.$('.w-ui-window-footer-monitor').append($buttonSwitch);

                return this;
            },
            clickButtonNext : function () {
                var file = this.$('.file-radio:checked').val();
                ImportContextModel.set('files', file);
                this.trigger('_NEXT_STEP');
            },
            clickButtonSwitch : function () {
                this.trigger('_SWITCH_BUTTON');
            },
            events : {
                'click .button-next' : 'clickButtonNext',
                'click .button-switch' : 'clickButtonSwitch'
            }
        });

        var importAutoBackupView;

        var factory = _.extend({
            getInstance : function () {
                if (!importAutoBackupView) {
                    importAutoBackupView = new ImportAutoBackupView({
                        draggable : true,
                        disableX : true,
                        title : i18n.contact.WINDOW_IMPORT_TITLE,
                        width : 450
                    });
                }
                return importAutoBackupView;
            },
            getClass : function () {
                return importAutoBackupView;
            }
        });

        return factory;
    });
}(this));
