/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'ui/TemplateFactory',
        'utilities/FormatDate',
        'Internationalization'
    ], function (
        Backbone,
        _,
        doT,
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
