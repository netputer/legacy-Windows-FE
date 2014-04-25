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

                EBookCardView.__super__.initialize.apply(this, arguments);

                Object.defineProperties(this, {
                    url : {
                        get : function () {
                            return url + this.model.id;
                        }
                    }
                });
            },
            downloadAsync : function (){
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.action.EBOOK_DOWNLOAD,
                    data : {
                        url : 'http://ebooks.wandoujia.com/api/v1/offlineRead?ebookId=' + this.model.get('id') + '&source=windows2x',
                        name : this.model.get('title'),
                        icon : this.model.get('cover').s || '',
                        pos : 'startPage'
                    }
                });

                return deferred.promise();
            },
            render : function () {
                this.$el.html(this.template(this.model.toJSON()));
                imageLoader(this.model.get('cover').l, this.$('.icon'), true);
                return this;
            },
            clickButtonNavigate : function (evt) {
                this.openDoraemon(this.url);
                this.log({
                    action : 'doraemon',
                }, evt);
            },
            clickButtonAction : function (evt) {

                var $btnAction = this.$('.button-action');
                this.downloadAsync().done(function (){
                    $btnAction.html(i18n.welcome.CARD_VIDEO_ALREADY_OFFLINE).prop('disabled', true);
                    setTimeout(function (){
                        $btnAction.html(i18n.welcome.CARD_VIDEO_OFFLINE).prop('disabled', false);
                    }, 3000);
                });

                this.log({
                    action : 'download',
                }, evt);
            },
            events : {
                'click .button-navigate, .icon' : 'clickButtonNavigate',
                'click .button-action' : 'clickButtonAction'
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
