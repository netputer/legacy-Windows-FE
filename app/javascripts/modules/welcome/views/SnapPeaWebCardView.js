/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'Configuration',
        'Log',
        'Internationalization',
        'ui/TemplateFactory',
        'welcome/views/FeedCardView'
    ], function (
        Backbone,
        _,
        doT,
        CONFIG,
        log,
        i18n,
        TemplateFactory,
        FeedCardView
    ) {

        var SnapPeaWebCardView = FeedCardView.getClass().extend({
            template : doT.template(TemplateFactory.get('welcome', 'snappea-web')),
            className : FeedCardView.getClass().prototype.className + ' snappea-web',
            render : function () {
                this.$el.html(this.template({}));
                return this;
            },
            clickButtonAction : function (evt) {

                var url = '380-wdj-extension://__MSG_@@extension_id__/index.html?type=app#app';

                this.openDoraemon(url);

                this.log({
                    action : 'apps'
                }, evt);
            },
            events : {
                'click .button-action' : 'clickButtonAction'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new SnapPeaWebCardView(args);
            }
        });

        return factory;
    });
}(this));
