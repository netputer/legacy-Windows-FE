/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'Configuration',
        'Internationalization',
        'ui/TemplateFactory',
        'welcome/views/FeedCardView'
    ], function (
        Backbone,
        _,
        doT,
        CONFIG,
        i18n,
        TemplateFactory,
        FeedCardView
    ) {
        var BackupCardView = FeedCardView.getClass().extend({
            template : doT.template(TemplateFactory.get('welcome', 'backup')),
            className : FeedCardView.getClass().prototype.className + ' backup',
            render : function () {
                this.$el.html(this.template({}));
                return this;
            },
            clickButtonAction : function () {
            },
            clickButtonIgnore : function () {
            },
            events : {
                'click .button-action' : 'clickButtonAction',
                'click .button-ignore' : 'clickButtonIgnore'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new BackupCardView(args);
            }
        });

        return factory;
    });
}(this));
