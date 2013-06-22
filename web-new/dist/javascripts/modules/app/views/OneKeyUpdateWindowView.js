/*global define*/
(function (window, undefined) {
    'use strict';

    define([
        'backbone',
        'doT',
        'jquery',
        'underscore',
        'Internationalization',
        'ui/Panel',
        'ui/UIHelper',
        'ui/behavior/ButtonSetMixin',
        'ui/TemplateFactory',
        'ui/SmartList',
        'utilities/StringUtil',
        'Configuration',
        'FunctionSwitch',
        'app/collections/AppsCollection',
        'app/views/AppItemView',
        'task/TaskService',
        'social/SocialService',
        'Account',
        'Settings'
    ], function (
        Backbone,
        doT,
        $,
        _,
        i18n,
        Panel,
        UIHelper,
        ButtonSetMixin,
        TemplateFactory,
        SmartList,
        StringUtil,
        CONFIG,
        FunctionSwitch,
        AppsCollection,
        AppItemView,
        TaskService,
        SocialService,
        Account,
        Settings
    ) {
        console.log('OneKeyUpdateWindowView - File loaded.');

        var EventsMapping = UIHelper.EventsMapping;

        var appList;
        var appsCollection;

        var BodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('app', 'one-key-update-body')),
            className : 'w-app-one-key-update vbox',
            initialize : function () {
                appsCollection = appsCollection || AppsCollection.getInstance();

                this.listenTo(appsCollection, 'refresh', function (appsCollection) {
                    if (appList !== undefined) {
                        appList.switchSet('default', appsCollection.getUpdatableApps);
                    }
                });
            },
            render : function () {
                this.$el.html(this.template({}));

                appList = new SmartList({
                    itemView : AppItemView.getClass(),
                    dataSet : [{
                        name : 'default',
                        getter : appsCollection.getUpdatableApps
                    }],
                    keepSelect : false,
                    $observer : this.$('.check-select-all'),
                    $header : this.$('header'),
                    itemHeight : 45,
                    listenToCollection : appsCollection
                });

                this.listenTo(appList, 'select:change', this.refreshMonitor);

                this.$('.w-smart-list-header').after(appList.render().$el);

                this.refreshMonitor();

                appList.selectAll();

                return this;
            },
            refreshMonitor : function () {
                this.$('.w-smart-list-footer').html(StringUtil.format(i18n.misc.SELECTOR_DESCRIPTION_TEXT, appList.selected.length, appList.currentModels.length));
            },
            remove : function () {
                appList.remove();
                BodyView.__super__.remove.call(this);
            }
        });

        var OneKeyUpdateWindowView = Panel.extend({
            initialize : function () {
                OneKeyUpdateWindowView.__super__.initialize.apply(this, arguments);

                Object.defineProperties(this, {
                    selected : {
                        get : function () {
                            return appList.selected;
                        }
                    }
                });

                this.on(EventsMapping.SHOW, function () {
                    var bodyView = new BodyView();

                    this.$bodyContent = bodyView.render().$el;
                    this.center();

                    this.once('remove', bodyView.remove, bodyView);
                }, this);

                this.on(EventsMapping.BUTTON_YES, this.updateAllApps, this);
            },
            render : function () {
                _.extend(this.events, OneKeyUpdateWindowView.__super__.events);

                this.delegateEvents();

                OneKeyUpdateWindowView.__super__.render.call(this);

                if (FunctionSwitch.ENABLE_SHARE_ONE_KEY_UPDATE) {
                    this.$('.w-ui-window-footer-monitor').prepend('<label><input class="check-share" type="checkbox"/>' + i18n.common.SHARE_ONE_KEY_UPDATE_SYNC + '</label>');
                    if (Account.get('isLogin')) {
                        this.$('.check-share').prop('checked', Settings.get('social.share_one_key_update.sync') === 'on');
                    }
                }
            },
            updateAllApps : function () {
                var updateApps = [];

                var apps = _.map(appList.selected, function (id) {
                    var model = appsCollection.get(id);

                    model.set({
                        isUpdating : true
                    });

                    model.unignoreUpdateAsync();

                    updateApps.push(model.get('base_info').package_name);
                    var updateModel = model.updateInfo.clone();
                    return {
                        downloadUrl : updateModel.get('downloadUrl'),
                        title : updateModel.get('title'),
                        iconSrc : updateModel.get('iconPath'),
                        versionName : updateModel.get('versionName'),
                        versionCode : updateModel.get('versionCode'),
                        size : updateModel.get('size'),
                        packageName : updateModel.get('packageName')
                    };
                }, this);

                TaskService.batchDownloadAsync(apps, 'one-key-update');

                if (updateApps.length > 0 && this.$('.check-share').prop('checked')) {
                    var data = {
                        textUrl : StringUtil.format(CONFIG.enums.SOCIAL_TEXT_PREVIEW_POST_URL, CONFIG.enums.SOCIAL_ONE_KEY_UPDATE),
                        textData : {
                            content : updateApps.join()
                        },
                        hasPreview : false,
                        shareData : {
                            need_shell : 0,
                            rotation : 0
                        },
                        extraData : {
                            apps : updateApps
                        },
                        type : CONFIG.enums.SOCIAL_ONE_KEY_UPDATE
                    };

                    SocialService.setContent(data);
                    SocialService.show();
                }
            },
            clickCheckShare : function (evt) {
                if (Account.get('isLogin')) {
                    if ($(evt.target).prop('checked')) {
                        Settings.set('social.share_one_key_update.sync', 'on');
                    } else {
                        Settings.set('social.share_one_key_update.sync', 'off');
                    }
                } else {
                    evt.preventDefault();
                    Account.loginAsync();
                }
            },
            events : {
                'click .check-share' : 'clickCheckShare'
            }
        });

        var oneKeyUpdateWindowView;

        var factory = _.extend({
            getInstance : function () {
                if (!oneKeyUpdateWindowView) {
                    oneKeyUpdateWindowView = new OneKeyUpdateWindowView({
                        buttonSet : ButtonSetMixin.BUTTON_SET.YES_CANCEL,
                        title : i18n.app.ONE_KEY_UPDATE_TITLE,
                        width : 630,
                        draggable : true
                    });
                }
                return oneKeyUpdateWindowView;
            }
        });

        return factory;
    });
}(this));
