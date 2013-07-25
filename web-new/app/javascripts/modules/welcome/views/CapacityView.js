/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'Device',
        'utilities/StringUtil',
        'ui/MouseState',
        'ui/TemplateFactory',
        'ui/PopupTip',
        'ui/PopupPanel',
        'app/collections/AppsCollection',
        'app/views/OneKeyMoveWindowView'
    ], function (
        Backbone,
        _,
        doT,
        $,
        Device,
        StringUtil,
        MouseState,
        TemplateFactory,
        PopupTip,
        PopupPanel,
        AppsCollection,
        OneKeyMoveWindowView
    ) {
        console.log('CapacityView - File loaded.');

        var setTimeout = window.setTimeout;
        var setInterval = window.setInterval;
        var clearInterval = window.clearInterval;

        var CapacityView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('welcome', 'capacity')),
            className : 'w-welcome-capacity hbox',
            initialize : function () {
                Device.on('change', this.render, this);

                Backbone.on('switchModule', function (data) {
                    if (data.module === 'welcome') {
                        this.render();
                    }
                }, this);
            },
            fillData : function (Device) {
                this.$el.html(this.template({
                    internalCapacity : Device.get('internalCapacity'),
                    externalCapacity : Device.get('externalCapacity'),
                    internalFreeCapacity : Device.get('internalFreeCapacity'),
                    externalFreeCapacity : Device.get('externalFreeCapacity')
                }));

                this.$('.phone-capacity').show();
                this.$('.external-capacity').toggle(!(Device.get('externalCapacity') === 0 &&
                                                        Device.get('externalFreeCapacity') === 0) &&
                                                        Device.get('hasSDCard'));

                _.each(this.$('[data-title]'), function (ele) {
                    var tip = new PopupTip({
                        $host : $(ele)
                    });
                    tip.zero();
                });

                var panel;
                if (!(!Device.get('hasSDCard') ||
                        Device.get('isMounted') ||
                        Device.get('hasEmulatedSD') ||
                        !Device.get('isConnected') ||
                        AppsCollection.getInstance().getSuggestMoveApps().length === 0)) {
                    var $phoneCapacity = this.$('.phone-capacity.outofspace');
                    if ($phoneCapacity.length > 0) {
                        panel = new PopupPanel({
                            $content : $(doT.template(TemplateFactory.get('welcome', 'one-key-move-tip'))({})),
                            $host : $phoneCapacity
                        });

                        panel.on('show', function () {
                            panel.$el.on('click', '.button-one-key-move', this.clickButtonOneKeyMove);
                        }, this);
                    }
                }

                var $externalCapacity = this.$('.external-capacity.outofspace');
                if ($externalCapacity.length > 0) {
                    panel = new PopupPanel({
                        $content : $(doT.template(TemplateFactory.get('welcome', 'open-sd-tip'))({})),
                        $host : $externalCapacity
                    });

                    panel.on('show', function () {
                        panel.$el.on('click', '.button-open-sd-card', this.clickButtonOpenSDCard);
                    }, this);
                }
            },
            render : function () {
                if (Device.get('isConnected')) {
                    this.$el.css('display', '-webkit-box');
                    Device.getDeviceCapacityAsync().done(function () {
                        this.fillData(Device);
                    }.bind(this));
                    Device.getSDCapacityAsync().done(function () {
                        this.fillData(Device);
                    }.bind(this));
                } else {
                    this.$el.hide();
                }

                _.each(this.$('[data-title]'), function (ele) {
                    var tip = new PopupTip({
                        $host : $(ele)
                    });
                    tip.zero();
                });

                return this;
            },
            showDeviceTip : function () {
                var showTip = function () {
                    var $tip = this.$('.phone-capacity .w-ui-popup-panel').show();
                    var $alert = this.$('.phone-capacity .alert');

                    var delegate = setInterval(function () {
                        if (!$tip[0].contains(MouseState.currentElement) &&
                                !$alert[0].contains(MouseState.currentElement)) {
                            $tip.hide();
                            clearInterval(delegate);
                        }
                    }, 100);
                }.bind(this);

                var appsCollection = AppsCollection.getInstance();
                if (appsCollection.loading) {
                    var refreshHandler = function (appsCollection) {
                        if (appsCollection.getSuggestMoveApps().length > 0) {
                            showTip();
                        }
                        appsCollection.off('refresh', refreshHandler);
                    };

                    appsCollection.on('refresh', refreshHandler, this);
                } else {
                    if (appsCollection.getSuggestMoveApps().length > 0) {
                        showTip();
                    }
                }
            },
            showExternalTip : function () {
                var $tip = this.$('.external-capacity .w-ui-popup-panel').show();
                var $alert = this.$('.external-capacity .alert');

                var delegate = setInterval(function () {
                    if (!$tip[0].contains(MouseState.currentElement) &&
                            !$alert[0].contains(MouseState.currentElement)) {
                        $tip.hide();
                        clearInterval(delegate);
                    }
                }, 100);
            },
            clickButtonOneKeyMove : function (evt) {
                var $button = $(evt.target);
                $button.prop({
                    disabled : true
                });

                setTimeout(function () {
                    $button.prop({
                        disabled : false
                    });
                }, 2000);

                OneKeyMoveWindowView.getInstance().show();
            },
            clickButtonOpenSDCard : function (evt) {
                var $button = $(evt.target);
                $button.prop({
                    disabled : true
                });

                setTimeout(function () {
                    $button.prop({
                        disabled : false
                    });
                }, 2000);

                Device.manageSDCardAsync();
            },
            events : {
                'mouseenter .phone-capacity .alert' : 'showDeviceTip',
                'mouseenter .external-capacity .alert' : 'showExternalTip'
            }
        });

        var capacityView;

        var factory = _.extend({
            getInstance : function () {
                if (!capacityView) {
                    capacityView = new CapacityView();
                }
                return capacityView;
            }
        });

        return factory;
    });
}(this));
