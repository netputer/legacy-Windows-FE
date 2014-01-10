/*global define*/
(function (window, document) {
    'use strict';

    define([
        'backbone',
        'doT',
        'jquery',
        'underscore',
        'ui/TemplateFactory',
        'ui/Panel',
        'utilities/StringUtil',
        'Internationalization',
        'Device',
        'app/collections/AppsCollection'
    ], function (
        Backbone,
        doT,
        $,
        _,
        TemplateFactory,
        Panel,
        StringUtil,
        i18n,
        Device,
        AppsCollection
    ) {
        console.log('RetryWindowView - File loaded.');

        var appsCollection;

        var BodyView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('app', 'retry-window')),
            className : 'w-app-retry-window-body',
            render : function () {
                this.$el.html(this.template({
                    tip : this.options.tip,
                    failedApps : _.map(this.options.failedApps, function (app) {
                        return appsCollection.get(app.item).get('base_info').name;
                    })
                }));

                return this;
            }
        });

        var RetryWindowView = Panel.extend({
            initialize : function () {
                RetryWindowView.__super__.initialize.apply(this, arguments);

                appsCollection = appsCollection || AppsCollection.getInstance();

                this.title = i18n.ui.TIP;

                this.buttons = [{
                    $button : $('<button>').html(i18n.ui.RETRY).addClass('primary').prop({
                        disabled : this.options.needConnection ? !Device.get('isConnected') : false
                    }),
                    eventName : 'button_retry'
                }, {
                    $button : $('<button>').html(i18n.ui.CANCEL),
                    eventName : 'button_cancel'
                }];

                this.once('show', function () {
                    var bodyView = new BodyView({
                        tip : this.options.tip,
                        failedApps : this.options.failedApps
                    });

                    this.$bodyContent = bodyView.render().$el;
                    this.once('remove', function () {
                        bodyView.remove();
                        this.off();
                    }, this);
                }, this);

                this.once('button_retry', function () {
                    this.close();
                });

                if (this.options.needConnection) {
                    this.listenTo(Device, 'change:isConnected', function (Device, isConnected) {
                        this.buttons[0].$button.prop({
                            disabled : !isConnected
                        });
                    });
                }
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new RetryWindowView(args);
            }
        });

        return factory;
    });
}(this, this.document));

