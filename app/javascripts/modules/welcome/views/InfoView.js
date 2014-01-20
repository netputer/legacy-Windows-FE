/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'Device',
        'welcome/views/AccountView',
        'welcome/views/ClockView'
    ], function (
        Backbone,
        _,
        Device,
        AccountView,
        ClockView
    ) {
        console.log('InfoView - File loaded. ');

        var clockView;
        var accountView;

        var InfoView = Backbone.View.extend({
            className : 'w-welcome-info vbox',
            initialize : function () {
                clockView = ClockView.getInstance();
                accountView = AccountView.getInstance();

                this.listenTo(Device, 'change:screenshot', function (Device, screenshot) {
                    this.$el.toggleClass('min', screenshot.rotation === 1 || screenshot.rotation === 3);
                });
            },
            render : function () {
                this.$el.append(accountView.render().$el)
                        .append(clockView.render().$el);

                return this;
            }
        });

        var factory = _.extend({
            getInstance : function () {
                return new InfoView();
            }
        });

        return factory;
    });
}(this));
