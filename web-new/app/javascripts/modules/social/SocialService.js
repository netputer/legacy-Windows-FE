/*global define*/
(function (window) {
    define([
        'underscore',
        'backbone',
        'jquery',
        'social/SocialData',
        'social/views/ShareView',
        'social/views/FacebookShareView',
        'social/views/FacebookOauthView',
        'Environment',
        'Configuration',
        'IOBackendDevice',
        'utilities/StringUtil'
    ], function (
        _,
        Backbone,
        $,
        SocialData,
        ShareView,
        FacebookShareView,
        FacebookOauthView,
        Environment,
        CONFIG,
        IO,
        StringUtil
    ) {
        console.log('SocialService - File loaded. ');

        var SocialService = _.extend({}, Backbone.Events);

        SocialService.show = function (config) {
            if (!!config) {
                this.setContent(config);
            }

            if (Environment.get('locale') === CONFIG.enums.LOCALE_EN_US) {
                var facebookShareView = FacebookShareView.getInstance();
                SocialData.getUserAuthAsync(facebookShareView.showPanel.bind(facebookShareView), function () {
                    FacebookOauthView.getInstance().show();
                });
            } else {
                ShareView.getInstance().showPanel();
            }
        };

        SocialService.setContent = function (config) {
            if (Environment.get('locale') === CONFIG.enums.LOCALE_EN_US) {
                if (config !== undefined) {
                    FacebookShareView.getInstance().setContent(config);
                }
            } else {
                if (config !== undefined) {
                    ShareView.getInstance().setContent(config);
                }
            }
        };

        SocialService.getPreviewContentSize = function () {
            return ShareView.getInstance().getPreviewContentSize();
        };

        SocialService.showFacebookOauth = function () {
            FacebookOauthView.getInstance().show();
        };

        SocialService.sharePhotoAsync = function (path, orientation, type, size) {
            var deferred = $.Deferred();

            var previewContentSize = SocialService.getPreviewContentSize();

            var previewImg = $('<img/>')
                .attr('src', path + ' ?date= ' + new Date().getTime())
                .css({
                    'max-width' : previewContentSize.width,
                    'max-height': previewContentSize.height
                });

            var rotation;
            switch (orientation) {
            case 0:
                rotation = 0;
                break;
            case 3:
            case 90:
                previewImg.addClass('turn-right');
                rotation = 3;
                break;
            case 2:
            case 180:
                previewImg.addClass('turn-down');
                rotation = 2;
                break;
            case 1:
            case 270:
                previewImg.addClass('turn-left');
                rotation = 1;
                break;
            }

            var data = {
                textUrl : StringUtil.format(CONFIG.enums.SOCIAL_TEXT_PREVIEW_URL, type, ''),
                hasPreview : type === CONFIG.enums.SOCIAL_PHOTO,
                previewContent : previewImg,
                shareData : {
                    need_shell : 0,
                    pic : path.replace(/^file:\/\/\//, ''),
                    rotation : rotation
                },
                type : type,
                size : size
            };

            SocialService.show(data);

            return deferred.promise();
        };

        IO.Backend.Device.onmessage({
            'data.channel' : 'social.share_app'
        }, function (data) {
            var previewContentSize = SocialService.getPreviewContentSize();

            var previewImgSrc = StringUtil.format(CONFIG.enums.SOCIAL_APP_BIO_URL, data.app_package_name);
            if (data.app_image) {
                previewImgSrc = data.app_image;
            }

            var previewImg = $('<img/>')
                .attr('src', previewImgSrc)
                .css({'max-width' : previewContentSize.width});

            var shareParameters = {
                textUrl : StringUtil.format(CONFIG.enums.SOCIAL_TEXT_PREVIEW_URL, CONFIG.enums.SOCIAL_APP, data.app_package_name),
                hasPreview : true,
                previewContent : previewImg,
                shareData : {
                    need_shell : 0,
                    pic : previewImgSrc,
                    rotation : 0
                },
                extraData : {
                    app_title : data.app_title,
                    app_package_name : data.app_package_name
                },
                type : CONFIG.enums.SOCIAL_APP
            };

            SocialService.setContent(shareParameters);
            SocialService.show();
        }, this);

        window.socialService = SocialService;

        return SocialService;
    });
}(this));
