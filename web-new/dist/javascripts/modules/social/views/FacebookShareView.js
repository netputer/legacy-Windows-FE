/*global define*/
(function (window, undefined) {
    define([
        'jquery',
        'underscore',
        'doT',
        'ui/UIHelper',
        'ui/TemplateFactory',
        'ui/AlertWindow',
        'Configuration',
        'ui/Panel',
        'ui/KeyMapping',
        'Environment',
        'Internationalization',
        'utilities/StringUtil',
        'Device',
        'social/SocialData',
        'social/views/FacebookOauthView',
        'Log'
    ], function (
        $,
        _,
        doT,
        UIHelper,
        TemplateFactory,
        AlertWindow,
        CONIFG,
        Panel,
        KeyMapping,
        Environment,
        i18n,
        StringUtil,
        Device,
        SocialData,
        FacebookOauthView,
        log
    ) {
        console.log('Share View loaded');

        var alert = window.alert;

        var FacebookShareView = Panel.extend({
            className : Panel.prototype.className + ' w-social-share-panel',
            render : function () {
                _.extend(this.events, FacebookShareView.__super__.events);
                this.delegateEvents();
                FacebookShareView.__super__.render.call(this);
            },
            showPanel : function (data) {
                this.$('textarea').html('').val('');
                this.$('.share-preview-content').html('');

                this.show();
                this.disableShareBtn(false);
                try {
                    data = JSON.parse(data.value);
                } catch (err) {
                }

                var screenName = data.screen_name || '';
                if (!screenName) {
                    SocialData.getUserAuthAsync(function (data) {
                        data = JSON.parse(data.value);
                        screenName = data.screen_name || data.name;
                        this.$('.nickname').html(screenName);
                    }.bind(this));
                } else {
                    this.$('.nickname').html(screenName);
                }

                this.showShareTip(StringUtil.format(i18n.common.SHARE_WIDGET_INPUT_COUNT_TEXT, 0), 'count');
                this.setPreviewContent();
            },

            disableShareBtn : function (isDisable) {
                var shareBtn = this.$('.share-btn');

                if (this.size > CONIFG.enums.SINA_SHARE_PIC_LIMIT_SIZE * 1024 * 1024) {
                    shareBtn.prop({
                        disabled : true
                    });
                    this.$('.pic-size-tip').html(StringUtil.format(i18n.common.SHARE_WIDGET_PIC_LIMIT_SIZE_TIP, CONIFG.enums.SHARE_WIDGET_PIC_LIMIT_SIZE)).show();
                } else {
                    shareBtn.prop({
                        disabled : !!isDisable
                    });
                    this.$('.pic-size-tip').hide();
                }
            },

            getPreviewContentSize : function () {
                var size = {
                    width : 310,
                    height : 205
                };
                Object.freeze(size);
                return size;
            },
            setPreviewContent : function () {
                var previewWrap = $(doT.template(TemplateFactory.get('social', 'preview'))({}));
                this.$('.w-ui-window-footer-monitor').append(previewWrap);

                var sharePreview = this.$('.share-preview');
                var sharePreviewContent = this.$('.share-preview-content').html('');
                var viewPicFromPCBtn = this.$('.view-from-pc');
                sharePreviewContent.addClass('loading');

                var size = this.getPreviewContentSize();
                var paddingVal = 20;
                sharePreviewContent.css({
                    width : size.width + paddingVal,
                    height: size.height + paddingVal
                });

                if (this.hasPreview) {
                    sharePreview.show();

                    setTimeout(function () {
                        sharePreviewContent.html(this.previewContent);
                        sharePreviewContent.removeClass('loading');
                    }.bind(this), 200);
                } else {
                    sharePreview.hide();
                    sharePreviewContent.html('');
                    sharePreviewContent.removeClass('loading');
                }

                if (this.hasViewPicFromPC) {
                    this.$('.view-from-pc').show();
                } else {
                    this.$('.view-from-pc').hide();
                }
            },
            setContent : function (config) {
                this.defaultText = config.text || '';
                this.hasPreview = config.hasPreview || true;
                this.previewContent = config.previewContent || '';
                this.shareData = config.shareData || '';
                this.hasViewPicFromPC = config.hasViewPicFromPC || false;
                this.shareCallback = config.shareCallback || null;
                this.size = parseInt(config.size, 10) || 0;
                if (this.hasPreview) {
                    var sharePreviewContent = this.$('.share-preview-content');
                    sharePreviewContent.html(this.previewContent);
                }
                this.disableShareBtn();
            },
            recoveryContent : function () {
                var config = {
                    text : '',
                    hasPreview : true,
                    previewContent : '',
                    shareData : '',
                    hasViewPicFromPC : false,
                    shareCallback : null,
                    size : 0
                };
                this.setContent(config);
            },
            showShareTip : function (text, type) {
                var $tip = this.$('.share-tip');
                switch (type) {
                case 'sending':
                    $tip.removeClass('error').addClass('sending');
                    break;
                case 'success':
                case 'count':
                    $tip.removeClass('error sending');
                    break;
                case 'error':
                    $tip.removeClass('sending').addClass('error');
                    break;
                }

                $tip.html(text).show();
            },
            showOauth : function () {
                this.close();
                FacebookOauthView.getInstance().show();
            },
            shareSuccess : function () {
                log({
                    'event' : 'social.share_' + this.type + '.success',
                    'sns' : 'weibo'
                });

                if (this.automaticClosing) {
                    this.showShareTip(i18n.common.SHARE_WIDGET_SENT_TEXT, 'success');
                    var timer = setTimeout(function () {
                        if (this.shareCallback) {
                            this.shareCallback();
                        }
                        this.close();
                        clearTimeout(timer);
                    }.bind(this), 1000);
                }
            },
            shareFail : function (data) {
                log({
                    'event' : 'social.share_' + this.type + '.failed',
                    'sns' : 'weibo'
                });

                var error_code = data.value;
                var errorMessage = i18n.common.SHARE_TO_FACEBOOK_FAILD;
                this.showShareTip(errorMessage, 'error');
                this.disableShareBtn(false);
            },
            clickExitOauth : function () {
                SocialData.getTokenAsync(function (resp) {
                    var source = CONIFG.enums.FACEBOOK_LOGOUT_URI + '?next=' + CONIFG.enums.FACEBOOK_REDIRECT_URI
                                                                         + '&access_token=' + resp.body.value;
                    var logoutFrame = $('<iframe/>').attr('src', source).appendTo(this.$el).hide();

                    logoutFrame.on('load', function () {
                        SocialData.exitAuthAsync(function () {
                            this.close();
                            logoutFrame.remove();
                        }.bind(this));

                    }.bind(this));

                }.bind(this));
            },
            clickViewOriginPicFromPC : function () {
                var data = {
                    file_path : this.shareData.pic
                };
                SocialData.viewOriginPicFromPicAsync(data, this.viewOriginPicFromPCSuccess.bind(this), this.viewOriginPicFromPCFail.bind(this));
            },
            viewOriginPicFromPCSuccess : function () {

            },
            viewOriginPicFromPCFail : function () {
                alert(i18n.common.SHARE_WIDGET_VIEW_FROM_PC_ERROR);
            },
            KeyupTexterea : function (e) {
                var val = this.$('textarea').val(),
                    len = val ? val.length : 0,
                    maxLen = 120,
                    diffLen = maxLen - len;

                if (e.which === KeyMapping.ENTER && e.ctrlKey) {
                    this.trigger('button_share');
                    return;
                }

                if (!e.ctrlKey) {
                    if (diffLen >= 0) {
                        this.showShareTip(StringUtil.format(i18n.common.SHARE_WIDGET_INPUT_COUNT_TEXT, len), 'count');
                        this.disableShareBtn(false);
                    } else {
                        this.showShareTip(StringUtil.format(i18n.common.SHARE_WIDGET_INPUT_OVER_COUNT_TEXT, len - maxLen), 'error');
                        this.disableShareBtn(true);
                    }
                }
            },
            events : {
                'click .exit-oauth' : 'clickExitOauth',
                'click .view-from-pc' : 'clickViewOriginPicFromPC',
                'keyup textarea' : 'KeyupTexterea'
            }
        });

        var buttons = [{
            $button : $('<button/>').html(i18n.common.SHARE).addClass('primary share-btn'),
            eventName : 'button_share'
        }, {
            $button : $('<button/>').html(i18n.common.CANCEL),
            eventName : 'button_no'
        }];

        var facebookShareView;

        var factory = _.extend({
            getInstance : function () {
                if (!facebookShareView) {
                    facebookShareView = new FacebookShareView({
                        title : i18n.common.SHARE_TO_FACEBOOK,
                        width : 400,
                        height : 480,
                        buttons : buttons,
                        $bodyContent : $(doT.template(TemplateFactory.get('social', 'facebook-share'))({}))
                    });

                    facebookShareView.on('button_share', function () {
                        this.automaticClosing = true;
                        this.showShareTip('', 'sending');

                        this.shareData.content = StringUtil.format(i18n.common.WANDOUJIA_TOPIC) + this.$('textarea').val() + StringUtil.format(i18n.common.FACEBOOK_MESSAGE_FROM, Device.get('deviceName'));

                        this.disableShareBtn(true);
                        SocialData.shareAsync(this.shareData,
                                        this.shareSuccess.bind(this),
                                        this.showOauth.bind(this),
                                        this.shareFail.bind(this)
                                        );
                    }).on('button_no', function () {
                        facebookShareView.close();
                    });
                    facebookShareView.on(UIHelper.EventsMapping.BUTTON_CANCEL, function () {
                        this.automaticClosing = false;
                        this.previewContent = '';
                        this.recoveryContent();
                    }.bind(facebookShareView));
                }

                return facebookShareView;
            }
        });

        return factory;
    });
}(this));
