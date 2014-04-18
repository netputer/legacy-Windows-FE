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
        'utilities/ReadableSize',
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
        ReadableSize,
        FeedCardView,
        TaskService
    ) {

        var url = '254-wdj-extension://__MSG_@@extension_id__/index.html#detail/';

        var EBookCardView = FeedCardView.getClass().extend({
            template : doT.template(TemplateFactory.get('welcome', 'ebook-card')),
            className : FeedCardView.getClass().prototype.className + ' ebook',
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
            clickButtonNavigate : function () {
                this.openDoraemon(this.url);
                this.log({
                    action : 'doraemon',
                    element : 'title'
                });
            },
            clickButtonAction : function () {
                this.openDoraemon(this.url);
                this.log({
                    action : 'doraemon',
                    element : 'button'
                });
            },
            clickIcon : function () {
                this.openDoraemon(this.url);
                this.log({
                    action : 'doraemon',
                    element : 'icon'
                });
            },
            events : {
                'click .button-action' : 'clickButtonAction',
                'click .button-navigate' : 'clickButtonNavigate',
                'click .icon' : 'clickIcon'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new EBookCardView(args);
            }
        });

        return factory;
    });
}(this));
