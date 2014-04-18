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

                setTimeout(function () {
                    if (this.model.get('feedName') === feedType.bbsFeed) {
                        this.$button.addClass('bbs');
                    } else {
                        this.$button.addClass('doraemon');
                    }
                }.bind(this), 0);

                return this;
            },
            clickIcon : function () {
                var actionName = this.DoAction();
                this.log({
                    action : actionName,
                    element : 'icon'
                });
            },
            doAction : function () {
                var action;
                if (this.model.get('feedName') === feedType.bbsFeed) {
                    action = 'open_url';
                    this.openUrl(this.model.get('defaultAction').url);
                } else {
                    action = 'doraemon';
                    this.redirect();
                }

                return action;
            },
            clickButtonNavigate : function () {

                var actionName = this.DoAction();

                this.log({
                    action : actionName,
                    element : 'title'
                });
            },
            clickButtonIgnore : function () {
                this.log({
                    action : 'ignore'
                });
                this.remove();
            },
            clickButtonBBS : function () {

                this.openUrl(this.model.get('defaultAction').url);
                this.log({
                    action : 'open_url',
                    element : 'button'
                });
            },
            redirect : function () {
                var index = '258';
                if (this.model.get('feedName') === feedType.wallPaperFeed) {
                    index = '256';
                }

                this.openDoraemon(index + '-wdj-extension://__MSG_@@extension_id__/index.html');
            },
            clickButtonDoraemon : function () {
                this.redirect();
                this.log({
                    action : 'doraemon',
                    element : 'button'
                });
            },
            events : {
                'click .button-action.doraemon' : 'clickButtonDoraemon',
                'click .button-ignore' : 'clickButtonIgnore',
                'click .button-action.bbs' : 'clickButtonBBS',
                'click .button-navigate' : 'clickButtonNavigate',
                'click .icon' : 'clickIcon'
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
