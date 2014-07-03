/*global define*/
(function (window) {
    define([
        'backbone',
        'doT',
        'jquery',
        'underscore',
        'ui/UIHelper',
        'ui/TemplateFactory',
        'ui/PopupTip',
        'utilities/StringUtil',
        'Configuration',
        'Internationalization',
        'IO',
        'Account',
        'social/SocialService'
    ], function (
        Backbone,
        doT,
        $,
        _,
        UIHelper,
        TemplateFactory,
        PopupTip,
        StringUtil,
        CONFIG,
        i18n,
        IO,
        Account,
        SocialService
    ) {
        console.log('CommentaryView - File loaded');

        var setTimeout = window.setTimeout;

        var CommentaryView = Backbone.View.extend({
            className : 'w-app-commentary',
            template : doT.template(TemplateFactory.get('app', 'application-commentary')),
            initialize : function () {
                this.listenTo(Account, 'change:isLogin', this.initState);
                this.listenTo(this.model, 'change:web_info', this.render);
            },
            render : function () {
                this.$el.html(this.template(this.model.toJSON()));

                this.initState(Account);

                _.each(this.$('.button-like, .button-dislike'), function (button) {
                    var tip = new PopupTip({
                        $host : $(button)
                    });
                    tip.zero();
                });

                return this;
            },
            initState : function (Account) {
                this.$('.input-content').prop({
                    disabled : !Account.get('isLogin')
                });

                if (Account.get('isLogin')) {
                    this.model.getCommentaryAsync().done(function (resp) {
                        var like = resp.body.authorFavorite;
                        if (like === 'YES') {
                            this.$('.button-like').addClass('checked primary');
                        } else if (like === 'NO') {
                            this.$('.button-dislike').addClass('checked primary');
                        }

                        var commentaryContent = resp.body.content || '';
                        if (commentaryContent && commentaryContent.trim().length > 0) {
                            this.$('.input-content').val(commentaryContent);
                            this.$('.button-send').html(i18n.app.MODIFY);
                        }
                    }.bind(this));
                } else {
                    this.$('.input-content').val('');
                    this.$('.button-like').removeClass('checked primary');
                    this.$('.button-dislike').removeClass('checked primary');
                }
            },
            sendCommentaryAsync : function (value, verifyCode) {
                var deferred = $.Deferred();

                IO.requestAsync({
                    tyep : 'POST',
                    url : CONFIG.actions.APP_COMMENTARY,
                    data : {
                        package_name : this.model.get('base_info').package_name,
                        content : value,
                        title : this.model.get('base_info').name,
                        share : '',
                        version_code : this.model.get('base_info').version_code,
                        verify_code :  verifyCode || ''
                    },
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            console.log('CommentaryView - Send application commentary success.');
                            deferred.resolve(resp);
                        } else {
                            console.error('CommentaryView - Send application commenrary faild. Error info: ' + resp.state_line);
                            deferred.reject(resp);
                        }
                    }.bind(this)
                });

                return deferred.promise();
            },
            handleCommentaryAsync : function () {
                var deferred = $.Deferred();

                var $textarea = this.$('.input-content');
                var value = $textarea.val().trim();

                if (value.length === 0) {
                    $textarea.focus();
                } else {
                    this.$('.button-send').prop({
                        disabled : true
                    });
                    $textarea.prop({
                        disabled : true
                    });

                    this.sendCommentaryAsync(value, this.$('.code-ctn .input-code').val()).done(function () {
                        this.$('.monitor').html(i18n.app.SEND_SUCCESS);
                        this.$('.button-send').html(i18n.app.MODIFY);

                        this.$('.code-ctn').slideUp();
                        deferred.resolve();
                    }.bind(this)).fail(function (resp) {
                        if (resp.state_code === 744) {
                            this.getVerifyCodeAsync().done(function (resp) {
                                this.$('img').attr({
                                    src : 'data:image/png;base64,' + resp
                                });
                            }.bind(this));

                            this.$('.code-ctn').slideDown();
                        }
                        this.$('.monitor').html(i18n.app.SEND_FAILED);
                    }.bind(this)).always(function () {
                        this.$('.button-send').prop({
                            disabled : false
                        });

                        $textarea.prop({
                            disabled : false
                        });

                        setTimeout(function () {
                            this.$('.monitor').html('');
                        }.bind(this), 3000);

                        deferred.reject();
                    }.bind(this));
                }

                return deferred.promise();
            },
            getVerifyCodeAsync : function () {
                var deferred = $.Deferred();

                $.ajax('http://apps.wandoujia.com/api/v1/comments/base64captcha').done(function (resp) {
                    deferred.resolve(resp);
                }).fail(function () {
                    deferred.reject();
                });

                return deferred.promise();
            },
            clickButtonSend : function () {
                this.handleCommentaryAsync();
            },
            clickButtonLike : function () {
                if (!Account.get('isLogin')) {
                    Account.openLoginDialog('', 'app-commentary');
                } else {
                    var $buttonLike = this.$('.button-like');
                    var $likeCount = this.$('.like-count');
                    var likeCount = parseInt($likeCount.html(), 10);
                    if (!$buttonLike.hasClass('checked')) {
                        this.model.markEnjoyStateAsync('YES').done();
                        $buttonLike.addClass('checked primary');
                        $likeCount.html(++likeCount);
                        this.$('.button-dislike').removeClass('checked primary');
                    } else {
                        this.model.markEnjoyStateAsync('UNKNOW').done();
                        $likeCount.html(Math.max(--likeCount, 0));
                        $buttonLike.removeClass('checked primary');
                    }
                }
            },
            clickButtonDislike : function () {
                if (!Account.get('isLogin')) {
                    Account.openLoginDialog('', 'app-commentary');
                } else {
                    var $buttonDislike = this.$('.button-dislike');
                    if (!$buttonDislike.hasClass('checked')) {
                        this.model.markEnjoyStateAsync('NO').done();
                        $buttonDislike.addClass('checked primary');
                        var $buttonLike = this.$('.button-like');
                        if ($buttonLike.hasClass('checked')) {
                            var $likeCount = this.$('.like-count');
                            var likeCount = parseInt($likeCount.html(), 10);
                            $likeCount.html(Math.max(--likeCount, 0));
                        }
                        $buttonLike.removeClass('checked primary');
                    } else {
                        this.model.markEnjoyStateAsync('UNKNOW').done();
                        $buttonDislike.removeClass('checked primary');
                    }
                }
            },
            clickButtonLogin : function () {
                Account.openLoginDialog('', 'app-commentary');
            },
            keydownInputContent : function (evt) {
                if (evt.ctrlKey && evt.keyCode === UIHelper.KeyMapping.ENTER) {
                    this.handleCommentaryAsync();
                }
            },
            clickButtonShare : function () {
                var baseInfo = this.model.get('base_info');

                var previewContentSize = SocialService.getPreviewContentSize();
                var previewImg = $('<img/>')
                    .attr('src', StringUtil.format(CONFIG.enums.SOCIAL_APP_BIO_URL, baseInfo.package_name))
                    .css({'max-width' : previewContentSize.width});

                var data = {
                    textUrl : StringUtil.format(CONFIG.enums.SOCIAL_TEXT_PREVIEW_URL, CONFIG.enums.SOCIAL_APP, baseInfo.package_name),
                    hasPreview : true,
                    previewContent : previewImg,
                    shareData : {
                        need_shell : 0,
                        pic : StringUtil.format(CONFIG.enums.SOCIAL_APP_BIO_URL, baseInfo.package_name),
                        rotation : 0
                    },
                    extraData : {
                        app_title : baseInfo.name,
                        app_package_name : baseInfo.package_name
                    },
                    type : CONFIG.enums.SOCIAL_APP
                };

                SocialService.setContent(data);
                SocialService.show();
            },
            clickButtonComment : function () {
                if (!Account.get('isLogin')) {
                    Account.openLoginDialog('', 'app-commentary');
                } else {
                    this.$('.input-ctn').slideToggle('fast');
                    this.$('.button-comment').toggleClass('active');
                }
            },
            clickCode : function () {
                this.getVerifyCodeAsync().done(function (resp) {
                    this.$('img').attr({
                        src : 'data:image/png;base64,' + resp
                    });
                }.bind(this));
            },
            events : {
                'click .button-comment' : 'clickButtonComment',
                'click .button-send' : 'clickButtonSend',
                'click .button-like' : 'clickButtonLike',
                'click .button-dislike' : 'clickButtonDislike',
                'click .button-login' : 'clickButtonLogin',
                'click .button-share' : 'clickButtonShare',
                'click .code' : 'clickCode',
                'keydown .input-content' : 'keydownInputContent'
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new CommentaryView(args);
            },
            getClass : function () {
                return CommentaryView;
            }
        });

        return factory;
    });
}(this));
