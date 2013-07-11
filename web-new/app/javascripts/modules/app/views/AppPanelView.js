/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'ui/TemplateFactory',
        'utilities/StringUtil',
        'app/views/DefaultPanelView',
        'app/views/DetailPanelView',
        'app/views/BatchAppsView',
        'app/views/AppListView'
    ], function (
        Backbone,
        _,
        TemplateFactory,
        StringUtil,
        DefaultPanelView,
        DetailPanelView,
        BatchAppsView,
        AppListView
    ) {
        console.log('AppPanelView - File loaded.');

        var ClassMapping = {
            DEFAULT_PANEL : '.w-app-default-panel',
            DETAIL_PANEL : '.w-app-detail-panel',
            BATCH_PANEL : '.w-app-batch'
        };

        var detailPanelView;
        var defaultPanelView;
        var batchAppsView;

        var AppPanelView = Backbone.View.extend({
            className : 'w-app-panel',
            initialize : function () {
                AppListView.getInstance().on('select:change', function (selected) {
                    if (selected.length !== 0) {
                        if (selected.length > 1) {
                            this.switchTo('batch', selected);
                        } else {
                            this.switchTo('detail', selected[0]);
                        }
                    } else {
                        this.switchTo('default');
                    }
                }, this);
            },
            render : function () {
                defaultPanelView = DefaultPanelView.getInstance();
                this.$el.append(defaultPanelView.render().$el);
                return this;
            },
            switchTo : function (state, ids) {
                this.$([ClassMapping.DEFAULT_PANEL, ClassMapping.DETAIL_PANEL, ClassMapping.BATCH_PANEL].join(',')).hide();
                switch (state) {
                case 'default':
                    this.$(ClassMapping.DEFAULT_PANEL).show();
                    break;
                case 'detail':
                    if (!detailPanelView) {
                        detailPanelView = DetailPanelView.getInstance();
                        detailPanelView.update(ids);
                        this.$el.append(detailPanelView.$el);
                        detailPanelView.on('hide', function () {
                            this.switchTo('default');
                        }, this);
                    } else {
                        detailPanelView.update(ids);
                        this.$(ClassMapping.DETAIL_PANEL).show();
                    }
                    break;
                case 'batch':
                    if (!batchAppsView) {
                        batchAppsView = BatchAppsView.getInstance();
                        this.$el.append(batchAppsView.render().$el);
                        batchAppsView.update(ids);
                        batchAppsView.on('hide', function () {
                            this.switchTo('default');
                        }, this);
                    } else {
                        this.$(ClassMapping.BATCH_PANEL).show();
                        batchAppsView.update(ids);
                    }
                    break;
                }
            }
        });

        var appPanelView;

        var factory = _.extend({
            getInstance : function () {
                if (!appPanelView) {
                    appPanelView = new AppPanelView();
                }
                return appPanelView;
            }
        });

        return factory;
    });
}(this));
