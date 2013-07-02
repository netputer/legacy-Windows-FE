/*global define*/
(function (window, undefined) {
    define([
        'underscore',
        'backbone',
        'doT',
        'jquery',
        'Account',
        'Configuration',
        'Internationalization',
        'ui/TemplateFactory'
    ], function (
        _,
        Backbone,
        doT,
        $,
        Account,
        CONFIG,
        i18n,
        TemplateFactory
    ) {
        console.log('SocialPlatformSelectorView - File loaded. ');

        var SocialPlatformSelectorView = Backbone.View.extend({
            className : 'w-social-platform-selector',
            initialize : function () {
                Account.on('change:platforms', this.refreshState, this);
            },
            render : function () {
                this.delegateEvents();

                this.$el.html(doT.template(TemplateFactory.get('social', this.options.templateID)));

                this.refreshState(Account);

                console.log('SocialPlatformSelectorView - SocialPlatformSelectorView rendered.');
                return this;
            },
            refreshState : function (Account) {
                if (Account.get('isLogin')) {
                    this.$('.social-platform[data-type="sina"], .social-platform-big[data-type="sina"]').prop({
                        checked : Account.isActive(Account.SINA)
                    });
                    this.$('span[data-type="sina"]').text(Account.isActive(Account.SINA) ? i18n.common.SHARE_BINDED : i18n.common.SHARE_TO_SINA);

                    this.$('.social-platform[data-type="qzone"], .social-platform-big[data-type="qzone"]').prop({
                        checked : Account.isActive(Account.QZONE)
                    });
                    this.$('span[data-type="qzone"]').text(Account.isActive(Account.QZONE) ? i18n.common.SHARE_BINDED : i18n.common.SHARE_TO_QZONE);

                    this.$('.social-platform[data-type="tqq"], .social-platform-big[data-type="tqq"]').prop({
                        checked : Account.isActive(Account.TQQ)
                    });
                    this.$('span[data-type="tqq"]').text(Account.isActive(Account.TQQ) ? i18n.common.SHARE_BINDED : i18n.common.SHARE_TO_QQ);

                    this.$('.social-platform[data-type="renren"], .social-platform-big[data-type="renren"]').prop({
                        checked : Account.isActive(Account.RENREN)
                    });
                    this.$('span[data-type="renren"]').text(Account.isActive(Account.RENREN) ? i18n.common.SHARE_BINDED : i18n.common.SHARE_TO_RENREN);
                } else {
                    this.$('.social-platform').prop({
                        checked : false
                    });
                }
            },
            getActivePlatformString : function () {
                var $activePlatformElements = this.$('.social-platform:checked');

                var activePlatforms = _.map($activePlatformElements, function (platform) {
                    return $(platform).data('type');
                });

                return activePlatforms.join(',');
            },
            hasPlatformSelected : function () {
                return this.$('.social-platform:checked').length > 0;
            },
            selectPlatformCallback : function (event) {
                var $checkbox = $(event.target);
                var type = $checkbox.data('type');

                if (Account.get('isLogin')) {
                    if ($checkbox[0].checked && !Account.isActive(type)) {
                        $($checkbox[0]).prop({
                            checked : false
                        });

                        Account.bindAsync(type);
                    }
                } else {
                    if ($checkbox[0].checked) {
                        $($checkbox[0]).prop({
                            checked : false
                        });

                        Account.loginAsync('', 'social_share', type);
                    }
                }
            },
            selectPlatformCallbackBig : function (event) {
                if (!Account.get('isLogin')) {
                    return;
                }

                var $checkbox = $(event.target);
                var type = $checkbox.data('type');
                if (Account.isActive(type)) {
                    $($checkbox[0]).prop({
                        checked : true
                    });
                    return;
                }

                this.refreshState(Account);
                Account.bindAsync(type);
            },
            events : {
                'click .social-platform' : 'selectPlatformCallback',
                'click .social-platform-big' : 'selectPlatformCallbackBig'
            }
        });

        var factory = _.extend(function () {}, {
            getInstance : function (args) {
                return new SocialPlatformSelectorView({
                    templateID : args ? 'social-platform-selector-big' : 'social-platform-selector'
                });
            }
        });

        return factory;
    });
}(this));
