/*global define*/
(function (window) {
    define([
        'underscore',
        'backbone',
        'doT',
        'jquery',
        'IO',
        'Internationalization',
        'Configuration',
        'ui/UIHelper',
        'ui/TemplateFactory',
        'ui/Panel',
        'utilities/StringUtil',
        'message/models/ImportContextModel',
        'Device'
    ], function (
        _,
        Backbone,
        doT,
        $,
        IO,
        i18n,
        Config,
        UIHelper,
        TemplateFactory,
        Panel,
        StringUtil,
        ImportContextModel,
        Device
    ) {
        console.log('Message - ImportAutoBackupView - File loaded.');

        var ImportAutoBackupBodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('message', 'import-backup')),
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

                var first = this.$('ul li input').first()[0];
                if (first !== undefined) {
                    first.checked = true;
                }
                return this;
            },
            loadSmsBackupData : function () {
                this.loading = true;

                this.loadSmsBackupAsync().done(function (resp) {
                    this.backList = resp.body.file;
                    this.render();
                    this.loading = false;
                }.bind(this));
            },
            loadSmsBackupAsync : function () {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : Config.actions.SMS_LOAD_BACKUP,
                    success : function (resp) {
                        if (resp.state_line === 200) {
                            deferred.resolve(resp);
                        } else {
                            deferred.reject(resp);
                        }
                    }
                });

                return deferred.promise();
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

                Device.on('change:isConnected', function (Device, isConnected) {
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
                    $button : $('<button>').html(i18n.misc.NEXT_STEP).addClass('button-next primary'),
                    eventName : 'button-next'
                }, {
                    $button : $('<button>').html(i18n.ui.CANCEL),
                    eventName : UIHelper.EventsMapping.BUTTON_CANCEL
                }];
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
                this.trigger('_NEXT_BUTTON');
            },
            clickButtonSwitch : function () {
                this.trigger('_SWITCH_BUTTON');
            },
            events : {
                'click .button-next' : 'clickButtonNext',
                'click .button-switch' : 'clickButtonSwitch'
            },
            setNextBtnDisable : function (disable) {
                this.$('.button-next').prop('disabled', disable);
            }
        });

        var importAutoBackupView;

        var factory = _.extend(function () {}, {
            getInstance : function () {
                if (!importAutoBackupView) {
                    importAutoBackupView = new ImportAutoBackupView({
                        draggable : true,
                        disableX : true,
                        title : i18n.message.WINDOW_IMPORT_TITLE,
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
