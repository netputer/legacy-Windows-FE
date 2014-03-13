/*global define*/
(function (window) {
    define([
        'underscore',
        'jquery',
        'ui/Panel',
        'utilities/QueryString',
        'Internationalization',
        'Configuration',
        'social/SocialData'
    ], function (
        _,
        $,
        Panel,
        QueryString,
        i18n,
        CONFIG,
        SocialData
    ) {
        var facebookOauthURI = CONFIG.enums.FACEBOOK_OAUTH_API + CONFIG.enums.FACEBOOK_REDIRECT_URI + '&state=' + new Date().getTime();

        var FacebookOauthView = Panel.extend({
            render : function () {
                FacebookOauthView.__super__.render.apply(this, arguments);

                var self = this;
                this.$('iframe').on('load', function () {
                    var source = this.contentWindow.location.href;

                    if (/error=access_denied/i.test(source)) {
                        self.close();
                    } else if (/access_token/i.test(source)) {
                        var accessToken = QueryString.get('access_token', source);
                        var expiresIn = QueryString.get('expires_in', source);
                        var data = {
                            access_token : accessToken,
                            expires_in : expiresIn
                        };
                        SocialData.authInfoAsync(data, function (resp) {
                            this.close();
                            this.trigger('social.facebookOauthView.authSuccess');
                        }.bind(self), function () {
                            this.close();
                        }.bind(self));
                    }
                });
            }
        });

        var facebookOauthView = new FacebookOauthView({
            title : i18n.misc.SHARE_TO_FACEBOOK,
            draggable : true,
            width: 660,
            height: 540,
            buttons : [],
            $bodyContent : $('<iframe/>').attr({
                src : facebookOauthURI
            }).css({
                width: 630,
                height: 477
            })
        });

        var factory = _.extend({
            getInstance : function () {
                return facebookOauthView;
            }
        });

        return factory;
    });
}(this));
