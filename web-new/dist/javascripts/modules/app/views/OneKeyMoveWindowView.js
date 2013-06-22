/*global define*/
(function (window, undefined) {
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
        'app/AppService'
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
        AppService
    ) {
        console.log('OneKeyMoveWindowView - File loaded.');

        var EventsMapping = UIHelper.EventsMapping;

        var appList;
        var appsCollection;

        var BodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('app', 'one-key-move-body')),
            className : 'w-app-one-key-move vbox',
            initialize : function () {
                appsCollection = appsCollection || AppsCollection.getInstance();

                this.listenTo(appsCollection, 'refresh', function (appsCollection) {
                    if (appList !== undefined) {
                        appList.switchSet('default', appsCollection.getSuggestMoveApps);
                    }
                });
            },
            render : function () {
                this.$el.html(this.template({}));

                appList = new SmartList({
                    itemView : AppItemView.getClass(),
                    dataSet : [{
                        name : 'default',
                        getter : appsCollection.getSuggestMoveApps
                    }],
                    keepSelect : false,
                    $observer : this.$('.check-select-all'),
                    $header : this.$('header'),
                    itemHeight : 45,
                    listenToCollection : appsCollection
                });

                this.listenTo(appList, 'select:change', this.refreshMonitor);

                appList.selectAll();

                this.$('.w-smart-list-header').after(appList.render().$el);

                this.refreshMonitor();

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

        var OneKeyMoveWindowView = Panel.extend({
            initialize : function () {
                OneKeyMoveWindowView.__super__.initialize.apply(this, arguments);

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

                this.on(EventsMapping.BUTTON_YES, this.moveAllApps, this);
            },
            moveAllApps : function () {
                if (appList.selected.length > 0) {
                    AppService.batchMoveToSDCardAsync(appList.selected);
                }
            }
        });

        var oneKeyMoveWindowView;

        var factory = _.extend({
            getInstance : function () {
                if (!oneKeyMoveWindowView) {
                    oneKeyMoveWindowView = new OneKeyMoveWindowView({
                        buttonSet : ButtonSetMixin.BUTTON_SET.YES_CANCEL,
                        title : i18n.app.ONE_KEY_TRANSFER_TITLE,
                        width : 630,
                        draggable : true
                    });
                }
                return oneKeyMoveWindowView;
            }
        });

        return factory;
    });
}(this));
