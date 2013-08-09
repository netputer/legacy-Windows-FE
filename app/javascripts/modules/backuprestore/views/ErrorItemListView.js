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
        'utilities/StringUtil',
        'Configuration',
        'backuprestore/BackupRestoreService',
        'backuprestore/models/BackupContextModel',
        'backuprestore/models/RestoreContextModel'
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
        StringUtil,
        CONFIG,
        BackupRestoreService,
        BackupContextModel,
        RestoreContextModel
    ) {
        console.log('ErrorItemListView - File loaded. ');

        // ------------------------ item list body view -----------------------

        var ErrorItemListBodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('backup', 'error-item-list')),
            className : 'w-backup-error-item-list',
            title_str : '',
            initialize : function () {
                var itemList = [];
                var loading = false;

                Object.defineProperties(this, {
                    itemList : {
                        set : function (value) {
                            if (value instanceof Array) {
                                itemList = value;
                            }
                        },
                        get : function () {
                            return itemList;
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
                    list : this.itemList
                }));
                this.$('.title').text(this.title_str);
                return this;
            },
            resetContent : function () {
                this.$('.title').text('');
                this.loading = true;
                this.itemList = [];
                this.render();
            },
            fillItemListWithApps : function () {
                var list = BackupContextModel.get('appErrorList');
                this.title_str = StringUtil.format(i18n.backup_restore.APP_ERROR_LIST_TITLE, list.length);
                this.$('.title').text(this.title_str);
                this.loading = true;

                BackupRestoreService.loadAppListAsync(list).done(function (resp) {
                    this.itemList = resp.body.app || [];
                    this.render();
                    this.loading = false;
                }.bind(this)).fail(function (resp) {
                    this.$('.loading').text(i18n.misc.LOAD_FAILD);
                }.bind(this));
            },
            fillItemListWithAppData : function () {
                var list = BackupContextModel.get('appDataErrorList');
                this.title_str = StringUtil.format(i18n.backup_restore.APP_DATA_ERROR_LIST_TITLE, list.length);
                this.$('.title').text(this.title_str);
                this.loading = true;

                BackupRestoreService.loadAppListAsync(list).done(function (resp) {
                    this.itemList = resp.body.app || [];
                    this.render();
                    this.loading = false;
                }.bind(this)).fail(function (resp) {
                    this.$('.loading').text(i18n.misc.LOAD_FAILD);
                }.bind(this));
            }
        });

        // ------------------------ item tip body view ------------------------

        var ErrorItemTipBodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('backup', 'error-item-tip')),
            className : 'w-backup-error-item-tip',
            typeName : '',
            errorNumber : 0,
            isAllFailed : false,
            render : function () {
                this.$el.html(this.template({
                    type_name : this.typeName,
                    error_number : this.errorNumber
                }));

                this.$('.all-non-app-failed, .part-non-app-failed').hide();
                if (this.isAllFailed) {
                    this.$('.all-non-app-failed').show();
                } else {
                    this.$('.part-non-app-failed').show();
                }

                return this;
            },
            resetContent : function () {
                return;
            },
            selectItemInfoByType : function (spec, type) {
                var i;
                var item;
                for (i in spec.item) {
                    if (spec.item.hasOwnProperty(i)) {
                        item = spec.item[i];
                        if (item.type === type) {
                            return item;
                        }
                    }
                }
                return null;
            },
            fillItemListWithContacts : function () {
                var itemInfo = this.selectItemInfoByType(RestoreContextModel.GetBRSpec, CONFIG.enums.BR_TYPE_CONTACT);
                var list = RestoreContextModel.get('errorItemList');

                this.typeName = i18n.backup_restore.CONTACT;
                this.errorNumber = list.length;
                this.isAllFailed = (itemInfo !== null) && (itemInfo.count === list.length);

                this.render();
            },
            fillItemListWithSms : function () {
                var itemInfo = this.selectItemInfoByType(RestoreContextModel.GetBRSpec, CONFIG.enums.BR_TYPE_SMS);
                var list = RestoreContextModel.get('errorItemList');

                this.typeName = i18n.backup_restore.SMS;
                this.errorNumber = list.length;
                this.isAllFailed = (itemInfo !== null) && (itemInfo.count === list.length);

                this.render();
            }
        });

        // ------------------------ error item list view ----------------------

        var bodyView;

        var ErrorItemListView = Panel.extend({
            itemType : -1,
            initialize : function () {
                ErrorItemListView.__super__.initialize.apply(this, arguments);

                this.on(UIHelper.EventsMapping.SHOW, function () {
                    switch (this.itemType) {
                    case CONFIG.enums.BR_TYPE_CONTACT:
                        bodyView = new ErrorItemTipBodyView();
                        this.$bodyContent = bodyView.render().$el;
                        bodyView.fillItemListWithContacts();
                        break;
                    case CONFIG.enums.BR_TYPE_SMS:
                        bodyView = new ErrorItemTipBodyView();
                        this.$bodyContent = bodyView.render().$el;
                        bodyView.fillItemListWithSms();
                        break;
                    case CONFIG.enums.BR_TYPE_APP:
                        bodyView = new ErrorItemListBodyView();
                        this.$bodyContent = bodyView.render().$el;
                        bodyView.fillItemListWithApps();
                        break;
                    case CONFIG.enums.BR_TYPE_APP_DATA:
                        bodyView = new ErrorItemListBodyView();
                        this.$bodyContent = bodyView.render().$el;
                        bodyView.fillItemListWithAppData();
                        break;
                    default:
                        break;
                    }

                    this.center();
                }, this);

                this.buttons = [{
                    $button : $('<button>').html(i18n.ui.RETRY).addClass('button-retry'),
                    eventName : 'button_retry'
                }, {
                    $button : $('<button>').html(i18n.ui.IGNORE).addClass('button-ignore primary'),
                    eventName : 'button_ignore'
                }];
            },
            render : function () {
                _.extend(this.events, ErrorItemListView.__super__.events);
                this.delegateEvents();
                ErrorItemListView.__super__.render.apply(this, arguments);

                if (bodyView !== undefined) {
                    bodyView.resetContent();
                }

                return this;
            },
            setItemType : function (type) {
                this.itemType = type;
            },
            clickButtonRetry : function () {
                this.trigger('_RETYR');
            },
            clickButtonIgnore : function () {
                this.trigger('_IGNORE');
            },
            events : {
                'click .button-retry' : 'clickButtonRetry',
                'click .button-ignore' : 'clickButtonIgnore'
            }
        });

        var factory = _.extend({
            getInstance : function () {
                var errorItemListView = new ErrorItemListView({
                    title : i18n.backup_restore.BACKUP_TITLE,
                    disableX : true,
                    height : 275,
                    width : BackupRestoreService.CONSTS.ViewWidthTip
                });
                return errorItemListView;
            }
        });

        return factory;
    });
}(this));
