/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'Device',
        'ui/TemplateFactory',
        'utilities/FormatDate',
        'Internationalization'
    ], function (
        Backbone,
        _,
        doT,
        Device,
        TemplateFactory,
        formatDate,
        i18n
    ) {
        console.log('ClockView - File loaded. ');

        var ClockView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('welcome', 'clock')),
            className : 'w-welcome-clock hbox',
            initialize : function () {
                setInterval(this.render.bind(this), 1000 * 30);

                this.listenTo(Device, 'change:screenshot', function (Device, screenshot) {
                    this.$el.toggleClass('min', screenshot.rotation === 1 || screenshot.rotation === 3);
                });
            },
            render : function () {
                this.$el.html(this.template({
                    time : formatDate('HH:mm'),
                    date : formatDate(i18n.welcome.CLOCK_DATE_FORMAT),
                    day : formatDate('DD')
                }));

                return this;
            }
        });

        var factory = _.extend({
            getInstance : function () {
                return new ClockView();
            }
        });

        return factory;
    });
}(this));
