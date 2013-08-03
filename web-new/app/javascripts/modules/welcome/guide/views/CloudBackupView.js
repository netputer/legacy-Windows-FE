/*global define*/
(function (window) {
    define([
        'jquery',
        'backbone',
        'underscore',
        'doT',
        'Configuration',
        'Internationalization',
        'IO',
        'Log',
        'Account',
        'ui/TemplateFactory',
        'utilities/ValidateEmail',
        'guide/views/CardView',
        'backuprestore/BackupRestoreService'
    ], function (
        $,
        Backbone,
        _,
        doT,
        CONFIG,
        i18n,
        IO,
        log,
        Account,
        TemplateFactory,
        validateEmail,
        CardView,
        BackupRestoreService
    ) {

        var UserModel = Backbone.Model.extend({
            defaults : {
                username : '',
                password : '',
                passwordVerify : '',
                nick : '',
                seccode : ''
            },
            validate : function (attrs) {
                var msg = '';
                if (!validateEmail(attrs.username)) {
                    msg = 'username';
                } else if (attrs.password.length < 6) {
                    msg = 'password';
                } else if (attrs.password !== attrs.passwordVerify) {
                    msg = 'passwordVerify';
                } else if (attrs.nick.trim().length === 0) {
                    msg = 'nick';
                }

                return msg;
            }
        });

        var CloudBackupView = CardView.getClass().extend({
            className : CardView.getClass().prototype.className + ' w-guide-cloud-backup',
            template : doT.template(TemplateFactory.get('guide', 'cloud-backup')),
            userModel : new UserModel(),
            render : function () {
                _.extend(this.events, CloudBackupView.__super__.events);
                this.delegateEvents();
                return CloudBackupView.__super__.render.call(this);
            },
            checkAsync : function () {
                var deferred = $.Deferred();

                IO.requestAsync(CONFIG.actions.SYNC_IS_SWITCH_ON).done(function (resp) {
                    if (!resp.body.value) {
                        deferred.resolve(resp);
                    } else {
                        deferred.reject(resp);
                    }
                });

                setTimeout(deferred.resolve);

                return deferred.promise();
            },
            clickButtonReg : function () {
                this.userModel.set({
                    username : this.$('.username').val(),
                    password : this.$('.password').val(),
                    passwordVerify : this.$('.password-verify').val(),
                    nick : this.$('.nickname').val(),
                    seccode : this.$('.captcha').val(),
                    privacy : this.$('.privacy').prop('checked')
                });

                this.$('input').removeClass('invalid');
                this.$('.text-warning').hide();

                if (this.userModel.isValid()) {
                    IO.requestAsync({
                        type : 'post',
                        url : CONFIG.actions.CLOUD_REG,
                        data : this.userModel.toJSON()
                    }).done(function (resp, textStatus, xhr) {
                        if (resp.error === 0) {
                            this.$('.section').css('-webkit-transform', 'translate3d(0, -200%, 0)');
                            setTimeout(function () {
                                this.trigger('next');
                            }.bind(this), 3000);
                            // dont login?
                        } else {
                            alert(resp.msg);
                            // where to show?
                        }
                    }.bind(this));
                } else {
                    switch (this.userModel.validationError) {
                    case 'username':
                        this.$('.username').addClass('invalid').next().show();
                        break;
                    case 'password':
                        this.$('.password').addClass('invalid').next().show();
                        break;
                    case 'passwordVerify':
                        this.$('.password-verify').addClass('invalid').next().show();
                        break;
                    case 'nick':
                        this.$('.nickname').addClass('invalid').next().show();
                        break;
                    }
                }
            },
            cloudBackupSuccess : function () {
                console.log(this);

                this.$('.section').css('-webkit-transform', 'translate3d(0, -100%, 0)');
                setTimeout(function () {
                    this.trigger('next');
                }.bind(this), 3000);

                // 作用域问题！
            }.bind(this),
            clickButtonAction : function () {
                if (!Account.get('isLogin')) {
                    Account.regAsync(i18n.welcome.GUIDE_REG_LOGIN_AND_BACKUP).done(function () {
                        var handler = IO.Backend.onmessage({
                            'data.channel' : CONFIG.events.ACCOUNT_STATE_CHANGE
                        }, function (data) {
                            IO.Backend.offmessage(handler);
                            BackupRestoreService.setRemoteAutoBackupSwitchAsync().done(this.cloudBackupSuccess);
                        }, this);
                    });
                } else {
                    BackupRestoreService.setRemoteAutoBackupSwitchAsync().done(this.cloudBackupSuccess);
                }
            },
            clickPrivacy : function (evt) {
                this.$('.button-reg').prop('disabled', !evt.originalEvent.srcElement.checked);
            },
            clickButtonLogin : function () {
                Account.loginAsync(i18n.welcome.GUIDE_REG_LOGIN_AND_BACKUP);
            },
            clickCaptchaImage : function () {
                var $img = this.$('.captcha-image');

                var xhr = new XMLHttpRequest();
                xhr.open('GET', CONFIG.actions.CLOUD_SECCODE, true);
                xhr.responseType = 'blob';

                xhr.onload = function (e) {
                    var blob = new window.Blob([this.response]);
                    $img.attr('src', window.URL.createObjectURL(blob));
                };

                xhr.send();
            },
            events :  {
                // 'click .button-reg' : 'clickButtonReg',
                // 'click .privacy' : 'clickPrivacy',
                // 'click .button-login' : 'clickButtonLogin',
                // 'click .captcha-image' : 'clickCaptchaImage'
            }
        });

        var factory = _.extend({
            getInstance : function () {
                return new CloudBackupView({
                    action : i18n.misc.CLOUD_BACKUP_OPEN
                });
            }
        });

        return factory;
    });
}(this));
