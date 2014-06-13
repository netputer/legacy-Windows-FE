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

        var url = '380-wdj-extension://__MSG_@@extension_id__/index.html?type=game#game';

        var SnapPeaWebCardView = FeedCardView.getClass().extend({
            template : doT.template(TemplateFactory.get('welcome', 'snappea-web')),
            className : FeedCardView.getClass().prototype.className + ' snappea-web',
            initialize : function () {

                SnapPeaWebCardView.__super__.initialize.apply(this, arguments);

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
                    action : 'web'
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
