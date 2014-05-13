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
        FeedCardView,
        TaskService
    ) {

        var url = '258-wdj-extension://__MSG_@@extension_id__/index.html#detail/';

        var VideoCardView = FeedCardView.getClass().extend({
            template : doT.template(TemplateFactory.get('welcome', 'video-card')),
            className : FeedCardView.getClass().prototype.className + ' video',
            initialize : function () {

                VideoCardView.__super__.initialize.apply(this, arguments);

                Object.defineProperties(this, {
                    url : {
                        get : function () {
                            return url + this.model.id;
                        }
                    }
                });
            },
            downloadAsync : function () {
                var downloadUrl = this.model.get('videoEpisodes')[0].downloadUrls[0];
                var url;
                if (downloadUrl.accelUrl) {
                    url = downloadUrl.accelUrl;
                } else {
                    url = downloadUrl.url;
                }

                var deferred = $.Deferred();
                IO.requestAsync({
                    url : CONFIG.actions.VIDEO_DOWNLOAD,
                    data : {
                        url : url + '&source=windows2x',
                        name : this.model.get('title'),
                        icon : this.model.get('cover').s || '',
                        pos : 'oscar-dora-ext',
                        dservice : true
                    },
                    success : function (resp){
                        if(resp.state_code === 200) {
                            console.log('download video - Search success');
                            deferred.resolve(resp);
                        } else {
                            console.log('download video - Search fail');
                            deferred.reject(resp);
                        }
                    }
                });

                return deferred.promise();
            },
            render : function () {
                this.$el.html(this.template(this.model.toJSON()));
                this.$('.icon').css('backgroundImage', 'url(' + this.model.get('cover').l + ')');
                return this;
            },
            clickButtonNavigate : function (evt) {
                this.openDoraemon(this.url);
                this.log({
                    action : 'doraemon'
                }, evt);
            },
            clickButtonAction : function (evt) {

                var $btnAction = this.$('.button-action');
                if (this.model.get('type') === 'MOVIE') {

                    this.downloadAsync().done(function (){
                        $btnAction.html(i18n.welcome.CARD_VIDEO_ALREADY_OFFLINE).prop('disabled', true);
                        setTimeout(function (){
                            $btnAction.html(i18n.welcome.CARD_VIDEO_OFFLINE).prop('disabled', false);
                        }, 3000);
                    });

                    this.log({
                        action : 'download'
                    }, evt);

                    return;
                }

                this.clickButtonNavigate(evt);
            },
            events : {
                'click .button-navigate, .icon' : 'clickButtonNavigate',
                'click .button-action' : 'clickButtonAction'
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
