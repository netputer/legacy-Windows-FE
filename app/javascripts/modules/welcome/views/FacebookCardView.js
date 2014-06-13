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

        var url = '382-wdj-extension://__MSG_@@extension_id__/index.html?type=game#game';

        var FacebookCardView = FeedCardView.getClass().extend({
            template : doT.template(TemplateFactory.get('welcome', 'snappea-facebook')),
            className : FeedCardView.getClass().prototype.className + ' snappea-facebook',
            initialize : function () {

                FacebookCardView.__super__.initialize.apply(this, arguments);

                Object.defineProperties(this, {
                    url : {
                        get : function () {
                            return url + this.model.id;
                        }
                    }
                });
            },
            render : function () {
                this.$el.html(this.template({}));
                return this;
            },
            clickButtonAction : function (evt) {

                this.openDoraemon(this.url);

                this.log({
                    action : 'facebook'
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
