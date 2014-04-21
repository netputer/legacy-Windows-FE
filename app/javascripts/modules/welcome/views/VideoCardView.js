/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'Configuration',
        'Device',
        'Internationalization',
        'ui/TemplateFactory',
        'ui/ImageLoader',
        'utilities/StringUtil',
        'welcome/views/FeedCardView',
        'task/TaskService'
    ], function (
        Backbone,
        _,
        doT,
        $,
        CONFIG,
        Device,
        i18n,
        TemplateFactory,
        imageLoader,
        StringUtil,
        FeedCardView,
        TaskService
    ) {

        var url = '258-wdj-extension://__MSG_@@extension_id__/index.html#detail/';

        var VideoCardView = FeedCardView.getClass().extend({
            template : doT.template(TemplateFactory.get('welcome', 'video-card')),
            className : FeedCardView.getClass().prototype.className + ' video',
            initialize : function () {
                Object.defineProperties(this, {
                    url : {
                        get : function () {
                            return url + this.model.id;
                        }
                    }
                });
            },
            render : function () {

                this.$el.html(this.template(this.model.toJSON()));
                imageLoader(this.model.get('cover').l, this.$('.icon'), true);
                return this;
            },
            clickButtonAction : function (evt) {
                this.openDoraemon(this.url);
                this.log({
                    action : 'doraemon'
                }, evt);
            },
            events : {
                'click .button-navigate, .icon, .button-action' : 'clickButtonAction'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new VideoCardView(args);
            }
        });

        return factory;
    });
}(this));
