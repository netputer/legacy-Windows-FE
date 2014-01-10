/*global define*/
(function (window) {
    'use strict';

    define([
        'backbone',
        'doT',
        'underscore',
        'Internationalization',
        'ui/Panel',
        'ui/UIHelper',
        'ui/behavior/ButtonSetMixin',
        'ui/TemplateFactory',
        'ui/SmartList',
        'utilities/StringUtil',
        'Configuration',
        'app/collections/AppsCollection',
        'app/views/AppItemView',
        'task/TaskService'
    ], function (
        Backbone,
        doT,
        _,
        i18n,
        Panel,
        UIHelper,
        ButtonSetMixin,
        TemplateFactory,
        SmartList,
        StringUtil,
        CONFIG,
        AppsCollection,
        AppItemView,
        TaskService
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
                        appList.switchSet('default', appsCollection.getUpdatableAppsWithoutNotRecommended);
                    }
                });
            },
            render : function () {
                this.$el.html(this.template({}));

                appList = new SmartList({
                    itemView : AppItemView.getClass(),
                    dataSet : [{
                        name : 'default',
                        getter : appsCollection.getUpdatableAppsWithoutNotRecommended
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
            updateAllApps : function () {
                var apps = _.map(appList.selected, function (id) {
                    var model = appsCollection.get(id);

                    model.set({
                        isUpdating : true
                    }).unignoreUpdateAsync();

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
            }
        });

        var oneKeyUpdateWindowView;

        var factory = _.extend({
            getInstance : function () {
                if (!oneKeyUpdateWindowView) {
                    oneKeyUpdateWindowView = new OneKeyUpdateWindowView({
                        buttonSet : ButtonSetMixin.BUTTON_SET.YES_CANCEL,
                        title : i18n.app.UPDATE_ALL,
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
