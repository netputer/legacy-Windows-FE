/*global define*/
/**
 * @author wangye.zhao@wandoujia.com
 * @doc https://github.com/wandoulabs/engineering-documents/wiki/%5BClient%5D-Account.js
 */
(function (window) {
    define([
        'backbone',
        'jquery',
        'IOBackendDevice',
        'Configuration'
    ], function (
        Backbone,
        $,
        IO,
        CONFIG
    ) {
        console.log('Account - File loaded.');

        var Account = Backbone.Model.extend({
            SINA : 'sina',
            QZONE : 'qzone',
            RENREN : 'renren',
            TQQ : 'tqq',
            QQ : 'QQ',
            defaults : {
                isLogin : false,
                auth : '',
                uid : '',
                userName : '',
                userMail : '',
                userAvatar : '',
                platforms : {}
            },
            initialize : function () {
                IO.requestAsync(CONFIG.actions.ACCOUNT_INFO).done(function (resp) {
                    if (resp.state_code === 200) {
                        console.log('Account - Init account state success.');
                        this.changeHandler(resp.body);
                    } else {
                        console.error('Account - Init account state failed. Error info: ' + resp.state_line);
                    }
                }.bind(this));
            },
            openRegDialog : function (title, source, platform) {
                var deferred = $.Deferred();

                if (!this.get('isLogin')) {
                    if (platform) {
                        platform = (platform === this.TQQ || platform === this.QZONE) ? this.QQ : platform;
                    }

                    IO.requestAsync({
                        url : CONFIG.actions.ACCOUNT_REGIST,
                        data : {
                            title : title || '',
                            source : source || '',
                            platform : platform || ''
                        },
                        success : function (resp) {
                            if (resp.state_code === 200) {
                                deferred.resolve(resp);
                            } else {
                                deferred.reject(resp);
                            }
                        }
                    });
                } else {
                    deferred.resolve();
                }

                return deferred.promise();
            },
            openLoginDialog : function (title, source, platform) {
                var deferred = $.Deferred();

                if (!this.get('isLogin')) {
                    if (platform) {
                        platform = (platform === this.TQQ || platform === this.QZONE) ? this.QQ : platform;
                    }

                    IO.requestAsync({
                        url : CONFIG.actions.ACCOUNT_LOGIN,
                        data : {
                            title : title || '',
                            source : source || '',
                            platform : platform || ''
                        },
                        success : function (resp) {
                            if (resp.state_code === 200) {
                                deferred.resolve(resp);
                            } else {
                                deferred.reject(resp);
                            }
                        }
                    });
                } else {
                    deferred.resolve();
                }

                return deferred.promise();
            },
            openResetDialog : function () {
                var deferred = $.Deferred();

                IO.requestAsync({
                    url : CONFIG.actions.ACCOUNT_RESET,
                    success : function (resp) {
                        if (resp.state_code === 200) {
                            deferred.resolve(resp);
                        } else {
                            deferred.reject(resp);
                        }
                    }
                });

                return deferred.promise();
            },
            changeHandler : function (accountInfo) {
                if (accountInfo.auth) {
                    var member = accountInfo.member;
                    var platforms = {};
                    platforms[this.SINA] = member.activesina !== undefined && parseInt(member.activesina, 10) !== 0;
                    platforms[this.QZONE] = member.activeqq !== undefined && parseInt(member.activeqq, 10) !== 0;
                    platforms[this.TQQ] = member.activeqq !== undefined && parseInt(member.activeqq, 10) !== 0;
                    platforms[this.RENREN] = member.activerenren !== undefined && parseInt(member.activerenren, 10) !== 0;

                    this.set({
                        auth : accountInfo.auth,
                        uid : member.uid,
                        userName : member.username,
                        userMail : member.email,
                        userAvatar : member.avatar,
                        isLogin : true,
                        platforms : platforms
                    });
                } else {
                    this.set(this.defaults);
                }
            }
        });

        var account = new Account();

        account.on('change:isLogin', function (Account, isLogin) {
            $('body').toggleClass('login', isLogin);
            $('body').toggleClass('unlogin', !isLogin);
        });

        function isWandouHost(url) {
            return (/(\.|^){1}((wandou\.in)|(wandoujia\.com)){1}(\/|$){1}/.test(url));
        }

        function updateFramesUserStatus() {
            var frames = $('iframe');
            var item;
            var i;
            for (i = frames.length; i--; undefined) {
                item = frames[i];
                if (isWandouHost(item.src)) {
                    if (typeof item.contentWindow.updateUserStatus === 'function') {
                        item.contentWindow.updateUserStatus({
                            auth : account.get('auth')
                        });
                    }
                }
            }
        }

        IO.Backend.Device.onmessage({
            'data.channel' : CONFIG.events.ACCOUNT_STATE_CHANGE
        }, function (msg) {
            console.log('Account - Account state change.');
            account.changeHandler(msg);
            updateFramesUserStatus.call();
        });

        window.Account = account;
        return account;
    });
}(this));
