/*global define*/
(function (window) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'Configuration',
        'Device',
        'Log',
        'Internationalization',
        'ui/TemplateFactory',
        'ui/ImageLoader',
        'welcome/views/FeedCardView'
    ], function (
        Backbone,
        _,
        doT,
        $,
        CONFIG,
        Device,
        log,
        i18n,
        TemplateFactory,
        imageLoader,
        FeedCardView
    ) {

        var feedType = {
            'videoFeed' : 'VideoDiversionFeed',
            'wallPaperFeed' : 'WallpaperDiversionFeed',
            'bbsFeed' : 'WandoujiaBBSFeed'
        };

        var DiversionCardView = FeedCardView.getClass().extend({
            template : doT.template(TemplateFactory.get('welcome', 'diversion-card')),
            className : FeedCardView.getClass().prototype.className + ' vbox diversion',
            initialize : function () {
                var $button;
                Object.defineProperties(this, {
                    $button : {
                        get : function () {
                            if (!$button) {
                                $button = this.$('.button-action');
                            }
                            return $button;
                        }
                    }
                });
            },
            render : function () {

                this.$el.html(this.template({
                    title : this.model.get('title'),
                    imageUrls : this.model.get('imageUrls')
                }));

                _.each(this.model.get('imageUrls'), function (url, index){
                    imageLoader(url, this.$('.icon:eq(' + index + ')'), true);
                }, this);

                if (this.model.get('feedName') === feedType.bbsFeed) {
                    this.$button.addClass('bbs');
                } else {
                    this.$button.addClass('doraemon');
                }

                return this;
            },
            clickButtonNavigate : function (evt) {

                var actionName;
                if (this.model.get('feedName') === feedType.bbsFeed) {
                    actionName = 'open_url';
                    this.openUrl(this.model.get('defaultAction').url);
                } else {
                    actionName = 'doraemon';
                    this.redirect();
                }

                this.log({
                    action : actionName
                }, evt);
            },
            clickButtonIgnore : function (evt) {
                this.log({
                    action : 'ignore'
                }, evt);
                this.remove();
            },
            clickButtonBBS : function (evt) {

                this.openUrl(this.model.get('defaultAction').url);
                this.log({
                    action : 'open_url',
                }, evt);
            },
            redirect : function () {
                var index = '258';
                if (this.model.get('feedName') === feedType.wallPaperFeed) {
                    index = '256';
                }

                this.openDoraemon(index + '-wdj-extension://__MSG_@@extension_id__/index.html');
            },
            clickButtonDoraemon : function (evt) {
                this.redirect();
                this.log({
                    action : 'doraemon',
                }, evt);
            },
            events : {
                'click .button-action.doraemon' : 'clickButtonDoraemon',
                'click .button-ignore' : 'clickButtonIgnore',
                'click .button-action.bbs' : 'clickButtonBBS',
                'click .button-navigate, .icon' : 'clickButtonNavigate'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new DiversionCardView(args);
            }
        });

        return factory;
    });
}(this));
