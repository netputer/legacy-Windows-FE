/*global define*/
(function (window, document) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'ui/TemplateFactory',
        'utilities/StringUtil',
        'Device',
        'Log',
        'Internationalization',
        'app/AppService',
        'app/wash/views/FeedbackWindowView',
        'app/wash/views/ResultItemView'
    ], function (
        Backbone,
        _,
        doT,
        $,
        TemplateFactory,
        StringUtil,
        Device,
        log,
        i18n,
        AppService,
        FeedbackWindowView,
        ResultItemView
    ) {
        console.log('ScanResultView - File loaded. ');

        var ScanResultView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('wash', 'wash-scan-result')),
            className : 'w-app-wash-result',
            directToPopAdsView : function () {
                this.$('.summary h1').html(i18n.app.DIRECT_ADS_TITLE);
                this.$('.summary .desc').html(StringUtil.format(i18n.app.DIRECT_ADS_DESC, this.collection.getUninstallableAdsApps().length));
            },
            switchToPopAdsView : function () {
                var popAdsApps = this.collection.getUninstallableAdsApps();
                this.$('.summary').remove();

                var $summary = $(doT.template(TemplateFactory.get('wash', 'summary-pop-ads'))({}));
                $summary.find('.desc').html(StringUtil.format(i18n.app.RESULT_SUMMARY_POP_ADS_TIP, popAdsApps.length));
                $summary.find('.button-uninstall-all').prop({
                    disabled : !Device.get('isConnected')
                });

                this.listenTo(Device, 'change:isConnected', function (Device, isConnected) {
                    $summary.find('.button-uninstall-all').prop({
                        disabled : !isConnected
                    });
                });

                this.$el.append($summary);
            },
            remove : function () {
                ScanResultView.__super__.remove.call(this);
                if (this.collection) {
                    this.collection.remove(this.collection.models);
                    delete this.collection;
                }
            },
            updateCount : function (adsApps, pirateApps, adsUninstallApps) {
                var $summary = this.$('.summary');

                if (adsApps.length > 0) {
                    $summary.find('.ads .count').html(adsApps.length);
                } else {
                    $summary.find('.ads').remove();
                }

                if (pirateApps.length > 0) {
                    $summary.find('.pirate .count').html(pirateApps.length);
                } else {
                    $summary.find('.pirate').remove();
                }

                if (adsUninstallApps.length > 0) {
                    $summary.find('.ads-uninstall .count').html(adsUninstallApps.length);
                } else {
                    $summary.find('.ads-uninstall').remove();
                }
            },
            renderItems : function (resultCollection) {
                this.render();
                this.collection = resultCollection;
                this.listenTo(this.collection, 'remove', function (app) {
                    var popAdsApps = this.collection.getUninstallableAdsApps();
                    var adsApps = this.collection.getUpdatableAdsApps();
                    var pirateApps = this.collection.getPirateApps();
                    if (!!app.get('candidateApks')) {
                        if (adsApps.length === 0 &&
                                pirateApps.length === 0 &&
                                popAdsApps.length > 0) {
                            this.switchToPopAdsView();
                        } else {
                            if (adsApps.length === 0 &&
                                    pirateApps.length === 0 &&
                                    popAdsApps.length === 0) {
                                this.trigger('next', this.collection.original);
                                this.remove();
                            }
                        }
                    } else {
                        if (adsApps.length === 0 &&
                                pirateApps.length === 0 &&
                                popAdsApps.length === 0) {
                            this.trigger('next', this.collection.original);
                            this.remove();
                        }
                    }

                    this.updateCount(adsApps, pirateApps, popAdsApps);
                });

                var popAdsApps = this.collection.getUninstallableAdsApps();
                var adsApps = this.collection.getUpdatableAdsApps();
                var pirateApps = this.collection.getPirateApps();

                this.updateCount(adsApps, pirateApps, popAdsApps);

                var fragment = document.createDocumentFragment();
                _.each(pirateApps.concat(adsApps).concat(this.collection.getUninstallableAdsApps()), function (app) {
                    var resultItem = ResultItemView.getInstance({
                        model : app
                    });
                    fragment.appendChild(resultItem.render().$el[0]);
                }, this);

                this.$('.result').append(fragment);

                if (this.collection.getUpdatableAdsApps().length === 0 &&
                        this.collection.getPirateApps().length === 0) {
                    this.switchToPopAdsView();
                    this.directToPopAdsView();
                }

                setTimeout(function () {
                    this.$('.result').css('margin-top', this.$('.summary')[0].offsetHeight);
                }.bind(this));
            },
            render : function () {
                this.delegateEvents();
                this.$el.html(this.template({}));
                return this;
            },
            clickButtonUninstallAll : function () {
                var popAdsApps = this.collection.filter(function (item) {
                    return !item.get('candidateApks') && (item.get('function').type === 'AD');
                });

                var ids = _.map(popAdsApps, function (item) {
                    this.collection.remove(item);
                    return item.get('sourceApk').packageName;
                }, this);

                AppService.batchUninstallAsync(ids).done(this.remove);

                log({
                    'event' : 'ui.click.wash.button.uninstall.all',
                    'count' : ids.length
                });
            },
            clickButtonFeedback : function () {
                FeedbackWindowView.getInstance({
                    ids : this.collection.map(function (app) {
                        return app.get('sourceApk').packageName;
                    })
                }).show();

                log({
                    'event' : 'ui.click.wash.button_feedback_result_view'
                });
            },
            events : {
                'click .button-feedback' : 'clickButtonFeedback',
                'click .button-uninstall-all' : 'clickButtonUninstallAll'
            }
        });

        var factory = _.extend({
            getInstance : function () {
                return new ScanResultView();
            }
        });

        return factory;
    });
}(this, this.document));
