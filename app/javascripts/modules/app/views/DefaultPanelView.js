/*global console, define*/
(function (window) {
    define([
        'backbone',
        'doT',
        'underscore',
        'Log',
        'Internationalization',
        'Device',
        'Account',
        'FunctionSwitch',
        'ui/TemplateFactory',
        'ui/AlertWindow',
        'utilities/StringUtil',
        'app/collections/AppsCollection',
        'app/views/RecommendView',
        'app/views/OneKeyUpdateWindowView',
        'app/views/OneKeyMoveWindowView',
        'app/views/HotCateView'
    ], function (
        Backbone,
        doT,
        _,
        log,
        i18n,
        Device,
        Account,
        FunctionSwitch,
        TemplateFactory,
        AlertWindow,
        StringUtil,
        AppsCollection,
        RecommendView,
        OneKeyUpdateWindowView,
        OneKeyMoveWindowView,
        HotCateView
    ) {
        console.log('DefaultPanelView - File loaded.');

        var setTimeout = window.setTimeout;

        var appsCollection;

        var DefaultPanelView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('app', 'default-panel')),
            className : 'w-app-default-panel',
            initialize: function () {
                appsCollection = AppsCollection.getInstance();
                appsCollection.on('refresh', this.renderButtons, this);

                FunctionSwitch.on('change', this.renderButtons, this);
                Device.on('change', this.setButtonState, this);
            },
            setButtonState : function (Device) {
                this.$('.button-transfer-all').prop({
                    disabled : !Device.get('hasSDCard') ||
                                Device.get('isMounted') ||
                                Device.get('hasEmulatedSD') ||
                                !Device.get('isConnected')
                });
            },
            renderButtons : function () {
                // udpate all
                var $updateAll = this.$('.update-all');
                var updatableCount = FunctionSwitch.ENABLE_APP_UPGRADE ? appsCollection.getUpdatableAppsWithoutIllegal().length : 0;
                if (updatableCount > 0 &&
                        FunctionSwitch.ENABLE_APP_UPGRADE) {
                    $updateAll.find('button .label').html(StringUtil.format(i18n.app.ONE_KEY_UPDATE, updatableCount));
                    $updateAll.find('.des').html(StringUtil.format(i18n.app.ONE_KEY_UPDATE_DES, updatableCount));
                    $updateAll.show();
                } else {
                    $updateAll.hide();
                }

                // transfer all
                var $transferAll = this.$('.transfer-all');
                var suggestMoveCount = appsCollection.getSuggestMoveApps().length;
                if (suggestMoveCount > 0) {
                    $transferAll.find('button').html(StringUtil.format(i18n.app.ONE_KEY_TRANSFER, suggestMoveCount));
                    $transferAll.show();
                } else {
                    $transferAll.hide();
                }

                if (!FunctionSwitch.ENABLE_APP_WASH) {
                    if (suggestMoveCount === 0) {
                        this.$('.notifier-ctn').hide();
                    } else {
                        this.$('.notifier-ctn').show();
                    }
                }
            },
            render : function () {
                this.$el.html(this.template({}));

                if (FunctionSwitch.ENABLE_APP_RECOMMEND) {
                    if (false) {
                        this.$el.append(HotCateView.getInstance().render().$el);
                    }
                    this.$el.append(RecommendView.getInstance().render().$el);
                }

                if (!FunctionSwitch.ENABLE_APP_WASH) {
                    this.$('.wash').remove();
                }

                this.renderButtons(appsCollection);

                this.setButtonState(Device);

                return this;
            },
            clickButtonTransferAll : function () {
                var oneKeyMoveWindow = OneKeyMoveWindowView.getInstance();
                oneKeyMoveWindow.show();

                var yesHandler = function () {
                    if (oneKeyMoveWindow.selected.length > 0) {
                        this.$('.button-transfer-all').text(i18n.app.APPS_TRANSFER_PROCESSING_TEXT);
                        setTimeout(function () {
                            this.renderButtons(appsCollection);
                        }.bind(this), 3000);
                    }
                };

                oneKeyMoveWindow.once('button_yes', yesHandler, this);

                log({
                    'event' : 'ui.click.app.move.all'
                });
            },
            clickButtonUpdateAll : function () {
                var oneKeyUpdateWindow = OneKeyUpdateWindowView.getInstance();
                oneKeyUpdateWindow.show();

                var yesHandler = function () {
                    if (oneKeyUpdateWindow.selected.length > 0) {
                        this.$('.button-update-all .label').text(i18n.app.UPDATEING_ALL);
                        setTimeout(function () {
                            this.renderButtons(appsCollection);
                        }.bind(this), 3000);
                    }
                };

                oneKeyUpdateWindow.once('button_yes', yesHandler, this);

                log({
                    'event' : 'ui.click.app.update.all'
                });
            },
            clickButtonWash : function () {
                Backbone.trigger('switchModule', {
                    module : 'app-wash',
                    tab : 'app-wash'
                });
            },
            events : {
                'click .button-transfer-all' : 'clickButtonTransferAll',
                'click .button-update-all' : 'clickButtonUpdateAll',
                'click .button-wash' : 'clickButtonWash'
            }
        });

        var defaultPanelView;

        var factory = _.extend({
            getInstance : function () {
                if (!defaultPanelView) {
                    defaultPanelView = new DefaultPanelView();
                }
                return defaultPanelView;
            }
        });

        return factory;
    });
}(this));
