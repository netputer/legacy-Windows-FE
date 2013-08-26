/*global define*/
(function (window, document) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'Device',
        'Internationalization',
        'Configuration',
        'ui/Panel',
        'ui/PopupPanel',
        'ui/UIHelper',
        'ui/TemplateFactory',
        'ui/AlertWindow',
        'FunctionSwitch',
        'utilities/StringUtil',
        'backuprestore/BackupRestoreService',
        'backuprestore/models/RestoreContextModel'
    ], function (
        Backbone,
        _,
        doT,
        $,
        Device,
        i18n,
        CONFIG,
        Panel,
        PopupPanel,
        UIHelper,
        TemplateFactory,
        AlertWindow,
        FunctionSwitch,
        StringUtil,
        BackupRestoreService,
        RestoreContextModel
    ) {
        console.log('RestoreRemoteListSnapshotView - File loaded. ');

        var alert = window.alert;

        var RestoreRemoteListSnapshotBodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('restore', 'choose-restore-date')),
            className : 'w-restore-choose-date',
            render : function () {
                this.$el.html(this.template({}));

                this.$('.load-more-ctn').hide();

                var list = RestoreContextModel.get('snapshotList');
                if (list.length === 0) {
                    this.$('.loading').show();
                    this.listSnapshot();
                } else {
                    this.$('.loading').hide();
                    this.appendItemList(list);
                    this.trigger('loaded');
                }

                return this;
            },
            createFragmentByDataList : function (dataList) {
                var fragment = document.createDocumentFragment();

                _.each(dataList, function (item) {
                    var $li = $(fragment.appendChild(document.createElement('li')));
                    var newItem = doT.template(TemplateFactory.get('restore', 'choose-restore-date-item'))({
                        item : item
                    });
                    $li.html(newItem);
                    fragment.appendChild($li[0]);
                });

                return fragment;
            },
            listSnapshot : function () {
                var oldList = RestoreContextModel.get('snapshotList');
                var lastEntity = oldList[oldList.length - 1];
                BackupRestoreService.remoteSnapshotListAutoAsync(lastEntity).done(function (resp) {
                    var newList = JSON.parse(resp.body.value);
                    var concatedList = oldList.concat(newList);
                    RestoreContextModel.set('snapshotList', concatedList);

                    if (newList.length < BackupRestoreService.CONSTS.DefaultSnapshot.Size) {
                        RestoreContextModel.set('sanpshotListLoadFinish', true);
                    }
                    this.appendItemList(newList);

                    this.listLoaded();
                }.bind(this)).fail(function (resp) {
                    this.remove();
                    var alertContext = (resp.state_code === 747) ?
                        i18n.backup_restore.CUSTOM_RESOURCE_LOCKED : i18n.backup_restore.RESTORE_LIST_SNAPHOST_FAILED;
                    var eventName = (resp.state_code === 747) ? 'locked' : 'loadFailed';
                    alert(alertContext, function () {
                        this.trigger(eventName);
                    }.bind(this));
                    BackupRestoreService.logRestoreContextModel(RestoreContextModel, false);
                }.bind(this));
            },
            appendItemList : function (list) {
                // create elements for the new list and insert it to DOM
                var formattedFullList = BackupRestoreService.FormatRestoreSnapshotList(list);
                var fragment = this.createFragmentByDataList(formattedFullList);
                this.$('.load-more-ctn').before(fragment);
                this.readSnapshotInfo(formattedFullList);

                // select the one last time user selected, or the first one
                var value = RestoreContextModel.get('remoteVersion') || '0';
                var $selectedItem = this.$(StringUtil.format('input[value="{1}"]', value));
                if ($selectedItem.length > 0) {
                    $selectedItem[0].checked = true;
                } else {
                    var $firstItem = this.$('input')[0];
                    if ($firstItem !== undefined) {
                        $firstItem.checked = true;
                    }
                }

                // load more button
                this.$('.load-more-ctn').toggle(!RestoreContextModel.get('sanpshotListLoadFinish'));
                this.$('.button-load-more').text(i18n.misc.LOAD_MORE).addClass('link');
            },
            listLoaded : function () {
                if (RestoreContextModel.get('snapshotList').length === 0) {
                    this.trigger('empty');
                    return;
                }

                this.$('.loading').hide();
                this.trigger('loaded');
            },
            readSinlgeFileInfo : function (version, udid) {
                BackupRestoreService.remoteSnapshotInfoAllTypesAsync(version, udid).done(function (resp) {
                    var info = {};
                    _.each(JSON.parse(resp.body.value), function (item) {
                        var brType = BackupRestoreService.getServerTypeFromBRType(item.type);
                        info[brType] = item.count;
                    });

                    RestoreContextModel.get('snapshotInfoDict')[version] = info;
                    this.fillItemInfo(version, info);
                }.bind(this));
            },
            readSnapshotInfo : function (formattedList) {
                _.each(formattedList, function (item) {
                    var version = item.version;
                    var info = RestoreContextModel.get('snapshotInfoDict')[version];
                    if (info === undefined) {
                        this.readSinlgeFileInfo(version, item.udid);
                    } else {
                        this.fillItemInfo(version, info);
                    }
                }.bind(this));
            },
            fillItemInfo : function (version, info) {
                var pattern = StringUtil.format('label[data-version={1}]', version);
                var $item = this.$(pattern);
                $item.find('.contact-number').html(info[CONFIG.enums.BR_TYPE_CONTACT] || '0');
                $item.find('.sms-number').html(info[CONFIG.enums.BR_TYPE_SMS] || '0');
                $item.find('.app-number').html(info[CONFIG.enums.BR_TYPE_APP] || '0');
            },
            setBackupDate : function () {
                var $checkedRadio = this.$('input[name="date"]:checked');
                RestoreContextModel.set({
                    remoteVersion : $checkedRadio.attr('value'),
                    udid : $checkedRadio.data('udid')
                });
            },
            clickButtonLoadMore : function () {
                this.$('.button-load-more').text(i18n.misc.LOADING).removeClass('link');
                this.setBackupDate();
                this.listSnapshot();
            },
            events : {
                'click .button-load-more' : 'clickButtonLoadMore'
            }
        });

        var bodyView;

        var RestoreRemoteListSnapshotView = Panel.extend({
            initialize : function () {
                RestoreRemoteListSnapshotView.__super__.initialize.apply(this, arguments);

                this.on(UIHelper.EventsMapping.SHOW, function () {
                    bodyView = new RestoreRemoteListSnapshotBodyView();

                    bodyView.on('loaded', function () {
                        this.$('.button-next').prop({
                            disabled : false
                        });
                    }, this);

                    bodyView.on('empty', function () {
                        this.trigger('_EMPTY_LIST');
                    }, this);

                    bodyView.on('loadFailed', function () {
                        this.trigger('_LAST_STEP');
                    }, this);

                    bodyView.on('locked', function () {
                        this.trigger('_LOCKED');
                    }, this);

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
            render : function () {
                _.extend(this.events, RestoreRemoteListSnapshotView.__super__.events);
                this.delegateEvents();
                RestoreRemoteListSnapshotView.__super__.render.apply(this, arguments);

                if (FunctionSwitch.ENABLE_CLOUD_BACKUP_RESTORE) {
                    var $buttonLast = $('<button>').html(i18n.ui.PREV).addClass('button-last');
                    this.$('.w-ui-window-footer-monitor').append($buttonLast);
                }

                this.$('.button-next').prop({
                    disabled : true
                });

                return this;
            },
            clickButtonLast : function () {
                bodyView.setBackupDate();
                this.trigger('_LAST_STEP');
            },
            clickButtonNext : function () {
                bodyView.setBackupDate();
                this.trigger('_NEXT_STEP');
            },
            events : {
                'click .button-last' : 'clickButtonLast',
                'click .button-next' : 'clickButtonNext'
            }
        });

        var restoreRemoteListSnapshotView;

        var factory = _.extend({
            getInstance : function () {
                if (!restoreRemoteListSnapshotView) {
                    restoreRemoteListSnapshotView = new RestoreRemoteListSnapshotView({
                        title : i18n.backup_restore.RESTORE_TITLE_REMOTE,
                        disableX : true,
                        height : BackupRestoreService.CONSTS.ViewHeight,
                        width : BackupRestoreService.CONSTS.ViewWidth
                    });
                }
                return restoreRemoteListSnapshotView;
            }
        });

        return factory;
    });
}(this, this.document));
