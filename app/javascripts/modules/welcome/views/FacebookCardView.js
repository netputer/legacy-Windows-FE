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

        var FacebookCardView = FeedCardView.getClass().extend({
            template : doT.template(TemplateFactory.get('welcome', 'snappea-facebook')),
            className : FeedCardView.getClass().prototype.className + ' snappea-facebook',
            render : function () {
                this.$el.html(this.template({}));
                return this;
            },
            clickButtonAction : function (evt) {

                var url = '382-wdj-extension://__MSG_@@extension_id__/index.html?type=game#game';

                this.openDoraemon(url);

                this.log({
                    action : 'games'
                }, evt);
            },
            events : {
                'click .button-action' : 'clickButtonAction'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new FacebookCardView(args);
            }
        });

        return factory;
    });
}(this));
