/*global define*/
(function (window) {
    define([
        'underscore',
        'backbone',
        'doT',
        'ui/TemplateFactory',
        'IO',
        'Configuration'
    ], function (
        _,
        Backbone,
        doT,
        TemplateFactory,
        IO,
        CONFIG
    ) {
        console.log('ConnectionGuideView - File loaded. ');

        var ConnectionGuideView = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('welcome', 'connection-guide')),
            className : 'w-welcome-connection-guide-ctn hbox',
            render : function () {
                this.$el.html(this.template({}));
                return this;
            },
            clickButtonConnect : function () {
                IO.requestAsync(CONFIG.actions.CONNET_PHONE);
            },
            events : {
                'click .button-connect' : 'clickButtonConnect'
            }
        });

        var factory = _.extend({
            getInstance : function () {
                return new ConnectionGuideView();
            }
        });

        return factory;
    });
}(this));
