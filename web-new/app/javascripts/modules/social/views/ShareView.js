/*global define*/
(function (window, undefined) {
    define([
        'doT',
        'jquery',
        'underscore',
        'ui/UIHelper',
        'ui/TemplateFactory',
        'Configuration',
        'ui/Panel',
        'ui/KeyMapping',
        'ui/AlertWindow',
        'Environment',
        'Internationalization',
        'utilities/StringUtil',
        'Device',
        'FunctionSwitch',
        'social/SocialData',
        'Log',
        'Account',
        'social/views/SocialPlatformSelectorView',
        'IOBackendDevice',
        'music/MusicService'
    ], function (
        doT,
        $,
        _,
        UIHelper,
        TemplateFactory,
        CONFIG,
        Panel,
        KeyMapping,
        AlertWindow,
        Environment,
        i18n,
        StringUtil,
        Device,
        FunctionSwitch,
        SocialData,
        log,
        Account,
        SocialPlatformSelectorView,
        IO,
        MusicService
    ) {
        console.log('Share View loaded');

        var alert = window.alert;

        var shareView;

        var ShareView = Panel.extend({
            className : Panel.prototype.className + ' w-social-share-panel',
            socialPlatformSelectorView : SocialPlatformSelectorView.getInstance(),
            type : CONFIG.enums.SOCIAL_SCREENSHOT,
            render : function () {
                _.extend(this.events, ShareView.__super__.events);
                this.delegateEvents();
                ShareView.__super__.render.call(this);
                if (FunctionSwitch.ENABLE_MY_MUTIL_SOCIAL_PLATFORM) {
                    this.$('.w-ui-window-footer-monitor').prepend(this.socialPlatformSelectorView.render().$el);
                }
            },
            showPanel : function (data) {
                this.$('textarea').html('').val('');
                this.$('.share-preview-content').html('');

                if (this.hasPreview) {
                    $(this.el).removeClass('compact-mode');
                } else {
                    $(this.el).addClass('compact-mode');
                }

                shareView.show();
                this.disableShareBtn(false);
                try {
                    data = JSON.parse(data.value);
                } catch (err) {}

                if (this.defaultText) {
                    this.$('textarea').val(this.defaultText);
                } else if (this.defaultTextUrl) {
                    if (this.defaultTextData) {
                        this.defaultTextData.wdj_auth = Account.get('auth');
                        $.ajax({
                            url : this.defaultTextUrl,
                            type : 'POST',
                            data : this.defaultTextData,
                            success : function (data) {
                                if (data && data.text) {
                                    this.$('textarea').val(data.text);
                                    this.countDown();
                                }
                            }.bind(this)
                        });
                    } else {
                        $.ajax({
                            url : this.defaultTextUrl,
                            type : 'POST',
                            data : {
                                wdj_auth : Account.get('auth')
                            },
                            success : function (data) {
                                if (data && data.text) {
                                    this.$('textarea').val(data.text);
                                    this.countDown();
                                }
                            }.bind(this)
                        });
                    }
                }

                this.countDown();
                this.setPreviewContent();

                log({
                    'event' : 'social.share_' + this.type + '.display',
                    'sns' : 'weibo'
                });
            },
            disableShareBtn : function (isDisable) {
                var shareBtn = this.$('.share-btn');

                if (this.size > CONFIG.enums.SINA_SHARE_PIC_LIMIT_SIZE * 1024 * 1024) {
                    shareBtn.prop({
                        disabled : true
                    });
                    this.$('.pic-size-tip').html(StringUtil.format(i18n.common.SHARE_WIDGET_PIC_LIMIT_SIZE_TIP, CONFIG.enums.SINA_SHARE_PIC_LIMIT_SIZE)).show();
                } else {
                    shareBtn.prop({
                        disabled : !!isDisable
                    });
                    this.$('.pic-size-tip').hide();
                }
            },
            getPreviewContentSize : function () {
                var size = {
                    width : 350,
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
                var loading = this.$('.w-ui-loading').show();
                var viewPicFromPCBtn = this.$('.view-from-pc');

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
                        loading.hide();
                    }.bind(this), 200);
                } else {
                    sharePreview.hide();
                    sharePreviewContent.html('');
                }

                if (this.hasViewPicFromPC) {
                    this.$('.view-from-pc').show();
                } else {
                    this.$('.view-from-pc').hide();
                }
            },
            setContent : function (config) {
                this.defaultText = config.text || '';
                this.defaultTextUrl = config.textUrl || '';
                this.defaultTextData = config.textData;
                this.hasPreview = config.hasPreview || false;
                this.previewContent = config.previewContent || '';
                this.shareData = config.shareData || '';
                this.hasViewPicFromPC = config.hasViewPicFromPC || false;
                this.shareCallback = config.shareCallback || null;
                this.size = parseInt(config.size, 10) || 0;
                if (this.hasPreview) {
                    var sharePreviewContent = this.$('.share-preview-content');
                    sharePreviewContent.html(this.previewContent);
                }
                this.type = config.type || CONFIG.enums.SOCIAL_SCREENSHOT;
                this.extraData = config.extraData || null;
                if (this.type) {
                    this.title = this.generateTitle();
                }

                this.disableShareBtn();
                this.countDown();
            },
            generateTitle : function () {
                var contentType = '';
                switch (this.type) {
                case CONFIG.enums.SOCIAL_SCREENSHOT:
                    contentType = i18n.common.SHARE_CONTENT_TYPE_SCREENSHOT;
                    break;
                case CONFIG.enums.SOCIAL_PHOTO:
                    contentType = i18n.common.SHARE_CONTENT_TYPE_PHOTO;
                    break;
                case CONFIG.enums.SOCIAL_WELCOME:
                    contentType = i18n.common.SHARE_CONTENT_TYPE_WELCOME;
                    break;
                case CONFIG.enums.SOCIAL_APP:
                    if (this.extraData && this.extraData.app_title) {
                        contentType = '「' + this.extraData.app_title + '」';
                    } else {
                        contentType = i18n.common.SHARE_CONTENT_TYPE_APP;
                    }
                    break;
                case CONFIG.enums.SOCIAL_DORAEMON_EXTENSION:
                    if (this.extraData && this.extraData.extension_title) {
                        contentType = '「' + this.extraData.extension_title + '」';
                    } else {
                        contentType = i18n.common.SHARE_CONTENT_TYPE_DORAEMON_EXTENSION;
                    }
                    break;
                case CONFIG.enums.SOCIAL_DORAEMON_CONTENT:
                    if (this.extraData && this.extraData.title) {
                        contentType = '「' + this.extraData.title + '」';
                    }
                    break;
                case CONFIG.enums.SOCIAL_WANDOUJIA_THEME:
                    if (this.extraData && this.extraData.theme_name) {
                        contentType = '「' + this.extraData.theme_name + '」';
                    }
                    break;
                case CONFIG.enums.SOCIAL_SET_RINGTONE:
                case CONFIG.enums.SOCIAL_SET_MUSIC_AS_RINGTONE:
                    if (this.extraData && this.extraData.ringtone_title) {
                        contentType = '「' + this.extraData.ringtone_title + '」';
                    }
                    break;
                case CONFIG.enums.SOCIAL_UNINSTALL_APP:
                    if (this.extraData && this.extraData.app_title) {
                        contentType = StringUtil.format(i18n.common.SHARE_WIDGET_TITLE_2, '「' + this.extraData.app_title + '」');
                    } else {
                        contentType = i18n.common.SHARE_WIDGET_TITLE_2;
                    }
                    return contentType;
                case CONFIG.enums.SOCIAL_ONE_KEY_UPDATE:
                    return i18n.common.SHARE_WIDGET_TITLE_ONE_KEY_UPDATE;
                }
                return StringUtil.format(i18n.common.SHARE_WIDGET_TITLE, contentType);
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
                var $loading = this.$('.send-loading');
                switch (type) {
                case 'sending':
                    $tip.removeClass('error').hide();
                    $loading.addClass('sending');
                    break;
                case 'success':
                case 'count':
                    $tip.removeClass('error').show();
                    $loading.removeClass('sending');
                    break;
                case 'error':
                    $tip.addClass('error').show();
                    $loading.removeClass('sending');
                    break;
                }

                $tip.html(text).show();
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
            shareFailed : function (data) {
                log({
                    'event' : 'social.share_' + this.type + '.failed',
                    'sns' : 'weibo'
                });

                var errorMessage = i18n.common.SHARE_WIDGET_FAILED_TEXT;
                if (data && data.value) {
                    switch (data.value) {
                    case CONFIG.enums.SOCIAL_SHARE_COOKIE_EXPIRED:
                        errorMessage = i18n.common.SHARE_WIDGET_COOKIE_EXPIRED_TEXT;
                        break;
                    }
                }
                this.showShareTip(errorMessage, 'error');
                this.disableShareBtn(false);
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
            countDown : function () {
                var val = this.$('.input-content').val();
                var len = val ? val.length : 0;
                var maxLen = 120;
                var diff = maxLen - len;

                if (diff >= 0) {
                    this.showShareTip(StringUtil.format(i18n.common.SHARE_WIDGET_INPUT_COUNT_TEXT, diff), 'count');
                    this.disableShareBtn(false);
                } else {
                    this.showShareTip(StringUtil.format(i18n.common.SHARE_WIDGET_INPUT_OVER_COUNT_TEXT, len - maxLen), 'error');
                    this.disableShareBtn(true);
                }
            },
            focusInputContent : function () {
                var $input = this.$('.input-content');

                if (!$input.hasClass('focus')) {
                    var countInterval = setInterval(function () {
                        this.countDown();
                    }.bind(this), 100);

                    var blurHandler = function () {
                        clearInterval(countInterval);
                        $input.off('blur', blurHandler).removeClass('focus');
                    }.bind(this);

                    $input.on('blur', blurHandler).addClass('focus');
                }
            },
            keydownInputContent : function (evt) {
                if (evt.ctrlKey && evt.keyCode === KeyMapping.ENTER) {
                    this.trigger('button_share');
                    this.$('.input-content').blur();
                }

                if (evt.keyCode === KeyMapping.ESC) {
                    this.$('.input-content').blur();
                }
            },
            events : {
                'click .view-from-pc' : 'clickViewOriginPicFromPC',
                'focus .input-content' : 'focusInputContent',
                'keydown .input-content' : 'keydownInputContent'
            }
        });

        var buttons = [
            {
                $button : $('<button/>').html(i18n.common.SHARE).addClass('primary share-btn'),
                eventName : 'button_share'
            },
            {
                $button : $('<button/>').html(i18n.common.CANCEL),
                eventName : 'button_no'
            }
        ];

        var factory = _.extend({
            getInstance : function () {
                if (!shareView) {
                    shareView = new ShareView({
                        width : 400,
                        buttons : buttons,
                        $bodyContent : $(doT.template(TemplateFactory.get('social', 'share'))({}))
                    });

                    shareView.on('button_share', function () {
                        if (!this.socialPlatformSelectorView.hasPlatformSelected()) {
                            this.showShareTip(i18n.common.SHARE_WIDGET_ERROR_NEED_SELECT_PLATFORM, 'error');
                            return;
                        }

                        this.automaticClosing = true;
                        this.showShareTip('', 'sending');

                        var shareParameter = {
                            user_comment : this.$('textarea').val(),
                            content_type : this.type,
                            target_platforms : this.socialPlatformSelectorView.getActivePlatformString(),
                            title : ''
                        };

                        switch (this.type) {
                        case CONFIG.enums.SOCIAL_SCREENSHOT:
                            shareParameter.need_shell = this.shareData.need_shell;
                            shareParameter.rotation = this.shareData.rotation;
                            shareParameter.content = this.shareData.pic;
                            break;
                        case CONFIG.enums.SOCIAL_PHOTO:
                        case CONFIG.enums.SOCIAL_SET_WALLPAPER:
                            shareParameter.rotation = this.shareData.rotation;
                            shareParameter.content = this.shareData.pic;
                            break;
                        case CONFIG.enums.SOCIAL_WELCOME:
                            shareParameter.content = this.shareData.pic;
                            break;
                        case CONFIG.enums.SOCIAL_APP:
                            if (this.extraData && this.extraData.app_package_name && this.extraData.app_title) {
                                shareParameter.content = this.extraData.app_package_name;
                            } else {
                                this.showShareTip(i18n.common.SHARE_WIDGET_FAILED_TEXT, 'error');
                                return;
                            }
                            break;
                        case CONFIG.enums.SOCIAL_DORAEMON_EXTENSION:
                            if (this.extraData && this.extraData.extension_id && this.extraData.extension_title) {
                                shareParameter.content = this.extraData.extension_id;
                            } else {
                                this.showShareTip(i18n.common.SHARE_WIDGET_FAILED_TEXT, 'error');
                                return;
                            }
                            break;
                        case CONFIG.enums.SOCIAL_ONE_KEY_UPDATE:
                            if (this.extraData && this.extraData.apps) {
                                shareParameter.content = this.extraData.apps.join();
                            } else {
                                this.showShareTip(i18n.common.SHARE_WIDGET_FAILED_TEXT, 'error');
                                return;
                            }
                            break;
                        case CONFIG.enums.SOCIAL_DORAEMON_CONTENT:
                            if (this.extraData && this.extraData.extension_id) {
                                shareParameter.content = JSON.stringify({
                                    id : this.extraData.extension_id,
                                    title : this.extraData.title,
                                    image : this.extraData.image
                                });
                            } else {
                                this.showShareTip(i18n.common.SHARE_WIDGET_FAILED_TEXT, 'error');
                                return;
                            }
                            break;
                        case CONFIG.enums.SOCIAL_WANDOUJIA_THEME:
                            if (this.extraData && this.extraData.theme_id) {
                                shareParameter.content = this.extraData.theme_id;
                            } else {
                                this.showShareTip(i18n.common.SHARE_WIDGET_FAILED_TEXT, 'error');
                                return;
                            }
                            break;
                        case CONFIG.enums.SOCIAL_SET_RINGTONE:
                            if (this.extraData && this.extraData.ringtone_id && this.extraData.ringtone_title && this.extraData.ringtone_artist) {
                                var self = this;
                                MusicService.loadMusicAsync(this.extraData.ringtone_id).done(function (path) {
                                    shareParameter.content = path;
                                    self.disableShareBtn(true);
                                    Account.shareAsync(shareParameter, self.shareSuccess.bind(self), self.shareFailed.bind(self));
                                });
                            } else {
                                this.showShareTip(i18n.common.SHARE_WIDGET_FAILED_TEXT, 'error');
                                return;
                            }
                            break;
                        case CONFIG.enums.SOCIAL_SET_MUSIC_AS_RINGTONE:
                            if (this.extraData && this.extraData.ringtone_title && this.extraData.ringtone_artist) {
                                shareParameter.content = JSON.stringify({
                                    ringtone_title : this.extraData.ringtone_title,
                                    ringtone_artist : this.extraData.ringtone_artist
                                });
                            } else {
                                this.showShareTip(i18n.common.SHARE_WIDGET_FAILED_TEXT, 'error');
                                return;
                            }
                            break;
                        case CONFIG.enums.SOCIAL_UNINSTALL_APP:
                            if (this.extraData && this.extraData.uninstall_reason && this.extraData.app_title && this.extraData.app_package_name) {
                                shareParameter.content = JSON.stringify({
                                    uninstall_reason : this.extraData.uninstall_reason,
                                    app_title : this.extraData.app_title,
                                    app_package_name : this.extraData.app_package_name
                                });
                            } else {
                                this.showShareTip(i18n.common.SHARE_WIDGET_FAILED_TEXT, 'error');
                                return;
                            }
                            break;
                        case CONFIG.enums.SOCIAL_WASH:
                            if (this.extraData && (this.extraData.mockNum !== undefined || this.extraData.adsNum !== undefined)) {
                                shareParameter.content = JSON.stringify({
                                    mockNum : this.extraData.mockNum || 0,
                                    adsNum : this.extraData.adsNum || 0
                                });
                            } else {
                                this.showShareTip(i18n.common.SHARE_WIDGET_FAILED_TEXT, 'error');
                                return;
                            }
                            break;
                        default:
                            this.showShareTip(i18n.common.SHARE_WIDGET_FAILED_TEXT, 'error');
                            return;
                        }

                        this.disableShareBtn(true);
                        Account.shareAsync(shareParameter, this.shareSuccess.bind(this), this.shareFailed.bind(this));
                    }).on('button_no', function () {
                        log({
                            'event' : 'social.share_' + this.type + '.cancel',
                            'sns' : 'weibo'
                        });
                        shareView.close();
                    }).on('button_cancel', function () {
                        log({
                            'event' : 'social.share_' + this.type + '.cancel',
                            'sns' : 'weibo'
                        });
                    });

                    shareView.on(UIHelper.EventsMapping.BUTTON_CANCEL, function () {
                        this.automaticClosing = false;
                        this.previewContent = '';
                        this.recoveryContent();
                    }.bind(shareView));
                }

                return shareView;
            }
        });

        return factory;
    });
}(this));
