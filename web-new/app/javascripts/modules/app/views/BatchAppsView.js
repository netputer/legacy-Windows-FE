/*global define*/
(function (window, undefined) {
    define([
        'backbone',
        'doT',
        'jquery',
        'underscore',
        'Internationalization',
        'Device',
        'Log',
        'ui/TemplateFactory',
        'ui/SmartList',
        'utilities/StringUtil',
        'app/collections/AppsCollection',
        'app/collections/WebAppsCollection',
        'app/views/AppItemView',
        'app/views/AppListView',
        'app/AppService'
    ], function (
        Backbone,
        doT,
        $,
        _,
        i18n,
        Device,
        log,
        TemplateFactory,
        SmartList,
        StringUtil,
        AppsCollection,
        WebAppsCollection,
        AppItemView,
        AppListView,
        AppService
    ) {
        console.log('BatchAppsView - File loaded.');

        var CLASS_MAPPING = {
            APP_LIST_CTN : '.w-app-batch-list-ctn'
        };

        var appList;
        var appsCollection;
        var webAppsCollection;

        var BatchAppsView = Backbone.View.extend({
            className : 'w-app-batch vbox',
            template : doT.template(TemplateFactory.get('app', 'batch-apps')),
            initialize : function () {
                appsCollection = appsCollection || AppsCollection.getInstance();
                webAppsCollection = webAppsCollection || WebAppsCollection.getInstance();
            },
            render : function () {
                this.$el.html(this.template({}));
                return this;
            },
            update : function (ids) {
                this.$('.title .count').html(StringUtil.format(i18n.app.BATCH_APP_TITLE, ids.length));

                if (!appList) {
                    appList = new SmartList({
                        itemView : AppItemView.getClass(),
                        dataSet : [{
                            name : 'default',
                            getter : function () {
                                return _.map(ids, function (id) {
                                    return appsCollection.get(id);
                                });
                            }
                        }],
                        keepSelect : false,
                        itemHeight : 45,
                        selectable : false,
                        listenToCollection : appsCollection
                    });
                    this.$(CLASS_MAPPING.APP_LIST_CTN).append(appList.render().$el);
                } else {
                    appList.switchSet('default', function () {
                        return _.map(ids, function (id) {
                            return appsCollection.get(id);
                        });
                    });
                }
            },
            clickButtonDeselect : function () {
                AppListView.getInstance().list.deselectAll();
            },
            clickItemButtonClose : function (evt) {
                var id = $(evt.currentTarget).data('id').toString();
                AppListView.getInstance().list.removeSelect(id);
            },
            events : {
                'click .button-deselect' :　'clickButtonDeselect',
                'click .w-app-list-item .button-close' : 'clickItemButtonClose'
            }
        });

        var batchAppsView;

        var factory = _.extend({
            getInstance : function () {
                if (!batchAppsView) {
                    batchAppsView = new BatchAppsView();
                }
                return batchAppsView;
            }
        });

        return factory;
    });
}(this));
