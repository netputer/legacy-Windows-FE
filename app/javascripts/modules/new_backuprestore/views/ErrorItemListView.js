/*global define, console*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'Internationalization',
        'ui/Panel',
        'ui/UIHelper',
        'ui/TemplateFactory',
        'utilities/StringUtil',
        'Configuration',
        'new_backuprestore/BackupRestoreService',
        'new_backuprestore/models/BackupContextModel',
        'new_backuprestore/models/RestoreContextModel'
    ], function (
        Backbone,
        _,
        doT,
        $,
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

        var ErrorItemListBodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('backup', 'error-item-list')),
            className : 'w-backup-error-item-list',
            initialize : function () {
                var itemList = [];
                var loading = false;
                var titleStr = '';

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
                    },
                    titleStr : {
                        set : function (value) {
                            titleStr = value;
                        },
                        get : function () {
                            return titleStr;
                        }
                    }
                });
            },
            render : function () {
                this.$el.html(this.template({
                    loading : this.loading,
                    list : this.itemList
                }));
                this.$('.title').text(this.titleStr);
                return this;
            },
            fillItemListWithApps : function () {
                var list = BackupContextModel.get('appErrorList');
                this.titleStr = StringUtil.format(i18n.new_backuprestore.APP_ERROR_LIST_TITLE, list.length);
                this.$('.title').text(this.titleStr);
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
                this.titleStr = StringUtil.format(i18n.new_backuprestore.APP_DATA_ERROR_LIST_TITLE, list.length);
                this.$('.title').text(this.titleStr);
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

        var ErrorItemTipBodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('backup', 'error-item-tip')),
            className : 'w-backup-error-item-tip',
            initialize : function () {
                ErrorItemTipBodyView.__super__.initialize.apply(this, arguments);
                var typeName  = '';
                var errorNumber = 0;
                var isAllFailed = false;

                Object.defineProperties(this, {
                    typeName : {
                        set : function (value) {
                            typeName = value;
                        },
                        get : function () {
                            return typeName;
                        }
                    },
                    errorNumber : {
                        set : function (value) {
                            errorNumber = value;
                        },
                        get : function () {
                            return errorNumber;
                        }
                    },
                    isAllFailed : {
                        set : function (value) {
                            isAllFailed = value;
                        },
                        get : function () {
                            return isAllFailed;
                        }
                    }
                });
            },
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
            selectItemInfoByType : function (spec, type) {
                _.each(spec.item, function (item) {
                    if (item.type === type) {
                        return item;
                    }
                });
                return null;
            },
            fillItemListWithContacts : function () {
                var itemInfo = this.selectItemInfoByType(RestoreContextModel.brSpec, CONFIG.enums.BR_TYPE_CONTACT);
                var list = RestoreContextModel.get('errorItemList');

                this.typeName = i18n.new_backuprestore.CONTACT;
                this.errorNumber = list.length;
                this.isAllFailed = (itemInfo !== null) && (itemInfo.count === list.length);

                this.render();
            },
            fillItemListWithSms : function () {
                var itemInfo = this.selectItemInfoByType(RestoreContextModel.brSpec, CONFIG.enums.BR_TYPE_SMS);
                var list = RestoreContextModel.get('errorItemList');

                this.typeName = i18n.new_backuprestore.SMS;
                this.errorNumber = list.length;
                this.isAllFailed = (itemInfo !== null) && (itemInfo.count === list.length);

                this.render();
            }
        });

        var ErrorItemListView = Panel.extend({
            itemType : -1,
            initialize : function () {
                ErrorItemListView.__super__.initialize.apply(this, arguments);

                var itemType;
                Object.defineProperties(this, {
                    itemType : {
                        set : function (value) {
                            itemType = value;
                        },
                        get : function () {
                            return itemType;
                        }
                    }
                });

                this.on(UIHelper.EventsMapping.SHOW, function () {
                    switch (this.itemType) {
                    case CONFIG.enums.BR_TYPE_CONTACT:
                        this.bodyView = new ErrorItemTipBodyView();
                        this.$bodyContent = this.bodyView.render().$el;
                        this.bodyView.fillItemListWithContacts();
                        break;
                    case CONFIG.enums.BR_TYPE_SMS:
                        this.bodyView = new ErrorItemTipBodyView();
                        this.$bodyContent = this.bodyView.render().$el;
                        this.bodyView.fillItemListWithSms();
                        break;
                    case CONFIG.enums.BR_TYPE_APP:
                        this.bodyView = new ErrorItemListBodyView();
                        this.$bodyContent = this.bodyView.render().$el;
                        this.bodyView.fillItemListWithApps();
                        break;
                    case CONFIG.enums.BR_TYPE_APP_DATA:
                        this.bodyView = new ErrorItemListBodyView();
                        this.$bodyContent = this.bodyView.render().$el;
                        this.bodyView.fillItemListWithAppData();
                        break;
                    default:
                        break;
                    }
                    this.center();

                    this.once('remove', function () {
                        this.bodyView.remove();
                        this.bodyView = undefined;
                    });
                }, this);

                this.buttons = [{
                    $button : $('<button>').html(i18n.ui.RETRY).addClass('button-retry')
                }, {
                    $button : $('<button>').html(i18n.ui.IGNORE).addClass('button-ignore primary')
                }];
            },
            render : function () {
                _.extend(this.events, ErrorItemListView.__super__.events);
                this.delegateEvents();
                ErrorItemListView.__super__.render.apply(this, arguments);

                return this;
            },
            clickBtnRetry : function () {
                this.remove();
                this.trigger('__RETRY');
            },
            clickBtnIgnore : function () {
                this.remove();
                this.trigger('__IGNORE');
            },
            events : {
                'click .button-retry' : 'clickBtnRetry',
                'click .button-ignore' : 'clickBtnIgnore'
            }
        });

        var factory = _.extend({
            getInstance : function () {
                return new ErrorItemListView({
                    title : i18n.new_backuprestore.BACKUP_TITLE,
                    disableX : true,
                    height : 275,
                    width : BackupRestoreService.CONSTS.ViewWidthTip
                });
            }
        });

        return factory;
    });
}(this));
