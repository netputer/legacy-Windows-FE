/*global define*/
(function (window) {
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
        Account,
        Settings
    ) {
        console.log('IgnoredAppsWindowView - File loaded.');

        var EventsMapping = UIHelper.EventsMapping;

        var appList;
        var appsCollection;

        var BodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('app', 'one-key-update-body')),
            className : 'w-app-ignored-apps vbox',
            initialize : function () {
                appsCollection = appsCollection || AppsCollection.getInstance();

                this.listenTo(appsCollection, 'refresh', function (appsCollection) {
                    appList.switchSet('default', appsCollection.getIgnoredApps);
                });
            },
            render : function () {
                this.$el.html(this.template({}));

                appList = new SmartList({
                    itemView : AppItemView.getClass(),
                    dataSet : [{
                        name : 'default',
                        getter : appsCollection.getIgnoredApps
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

        var IgnoredAppsWindowView = Panel.extend({
            initialize : function () {
                IgnoredAppsWindowView.__super__.initialize.apply(this, arguments);

                Object.defineProperties(this, {
                    selected : {
                        get : function () {
                            return appList.selected;
                        }
                    }
                });

                this.on(EventsMapping.SHOW, function () {
                    var bodyView = new BodyView({});

                    this.$bodyContent = bodyView.render().$el;
                    this.center();

                    this.once('remove', bodyView.remove);
                }, this);

                this.on(EventsMapping.BUTTON_YES, this.ignoreAllApps, this);
            },
            ignoreAllApps : function () {
                var appIds = appList.selected;
                _.each(appIds, function (id) {
                    appsCollection.get(id).unignoreUpdateAsync();
                });
            }
        });

        var ignoredAppsWindowView;

        var factory = _.extend({
            getInstance : function () {
                if (!ignoredAppsWindowView) {
                    ignoredAppsWindowView = new IgnoredAppsWindowView({
                        buttons : [{
                            $button : $('<button>').addClass('primary').html(i18n.app.APPS_CANCEL_IGNORE_TEXT),
                            eventName : 'button_yes'
                        }, {
                            $button : $('<button>').html(i18n.ui.CANCEL),
                            eventName : 'button_cancel'
                        }],
                        title : i18n.app.IGNORED_TITLE,
                        width : 630,
                        draggable : true
                    });
                }
                return ignoredAppsWindowView;
            }
        });

        return factory;
    });
}(this));
