/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'app/wash/views/IntroView',
        'app/wash/views/ScanningView',
        'app/wash/views/ScanResultView',
        'app/wash/views/ScanFinishView',
        'app/wash/views/ErrorView',
        'main/collections/PIMCollection'
    ], function (
        Backbone,
        _,
        IntroView,
        ScanningView,
        ScanResultView,
        ScanFinishView,
        ErrorView,
        PIMCollection
    ) {
        console.log('AppWashModuleView - File loaded.');

        var AppWashModuleView = Backbone.View.extend({
            className : 'w-app-wash-module-main module-main',
            initialize : function () {
                var rendered = false;
                Object.defineProperties(this, {
                    rendered : {
                        set : function (value) {
                            rendered = value;
                        },
                        get : function () {
                            return rendered;
                        }
                    }
                });
            },
            render : function () {
                this.introView  = IntroView.getInstance();
                this.listenTo(this.introView, 'next', this.renderScanningView);
                this.$el.prepend(this.introView.render().$el);

                this.rendered = true;
                return this;
            },
            renderScanningView : function () {
                if (this.introView) {
                    this.introView.remove();
                    this.stopListening(this.introView, 'next');
                    delete this.introView;
                }

                this.scanningView  = ScanningView.getInstance();
                this.listenTo(this.scanningView, 'next', this.renderScanResultView);
                this.listenTo(this.scanningView, 'error', this.renderErrorView);
                this.$el.prepend(this.scanningView.render().$el);
                this.scanningView.startQueryMD5();
            },
            renderErrorView : function () {
                if (this.scanningView) {
                    this.scanningView.remove();
                    this.stopListening(this.scanningView, 'next error');
                    delete this.scanningView;
                }

                this.errorView = ErrorView.getInstance().render();
                this.listenTo(this.errorView, 'next', this.reset);
                this.$el.prepend(this.errorView.$el);
            },
            renderScanResultView : function (result) {
                if (this.scanningView) {
                    this.scanningView.remove();
                    this.stopListening(this.scanningView, 'next error');
                    delete this.scanningView;
                }

                if (result.length > 0) {
                    this.scanResultView = ScanResultView.getInstance();
                    this.scanResultView.renderItems(result);
                    this.listenTo(this.scanResultView, 'next', this.renderScanFinishView);
                    this.$el.prepend(this.scanResultView.$el);
                } else {
                    this.renderScanFinishView();
                }
            },
            renderScanFinishView : function () {
                if (this.scanResultView) {
                    this.scanResultView.remove();
                    this.stopListening(this.scanResultView, 'next');
                    delete this.scanResultView;
                }

                this.scanFinishView = ScanFinishView.getInstance();
                this.scanFinishView.switchToEmptyView();
                this.listenTo(this.scanFinishView, 'next', this.reset);
                this.$el.prepend(this.scanFinishView.$el);
            },
            deleteAllSubView : function () {
                if (this.introView) {
                    this.introView.remove();
                    this.stopListening(this.introView, 'next');
                    delete this.introView;
                }
                if (this.scanningView) {
                    this.scanningView.remove();
                    this.stopListening(this.scanningView, 'next error');
                    delete this.scanningView;
                }
                if (this.scanResultView) {
                    this.scanResultView.remove();
                    this.stopListening(this.scanResultView, 'next');
                    delete this.scanResultView;
                }
                if (this.scanFinishView) {
                    this.scanFinishView.remove();
                    this.stopListening(this.scanFinishView, 'next');
                    delete this.scanFinishView;
                }
                if (this.errorView) {
                    this.errorView.remove();
                    this.stopListening(this.errorView, 'next');
                    delete this.errorView;
                }
            },
            remove : function () {
                this.deleteAllSubView();
                AppWashModuleView.__super__.remove.call(this);
            },
            reset : function () {
                this.deleteAllSubView();

                this.render();
            },
            events : {
                'click .button-restart' : 'reset'
            }
        });

        var appWashModuleView;

        var factory = _.extend({
            enablePreload : false,
            getInstance : function () {
                if (!appWashModuleView) {
                    appWashModuleView = new AppWashModuleView();
                }
                return appWashModuleView;
            },
            navigate : function () {
                Backbone.trigger('switchModule', {
                    module : 'app-wash',
                    tab : 'app-wash'
                });
            }
        });

        return factory;
    });
}(this));
