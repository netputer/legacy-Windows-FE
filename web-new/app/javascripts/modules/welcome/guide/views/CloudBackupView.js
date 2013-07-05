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
        'guide/views/CardView'
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
        CardView
    ) {

        var UserModel = Backbone.Model.extend({
            defaults : {
                userName : '',
                password : '',
                passwordVerify : '',
                nickName : '',
                captcha : ''
            },
            validate : function (attrs) {
                var msg = '';
                if (!validateEmail(attrs.userName)) {
                    msg = 'userName';
                } else if (attrs.password.length < 6) {
                    msg = 'password';
                } else if (attrs.password !== attrs.passwordVerify) {
                    msg = 'passwordVerify';
                } else if (attrs.nickName.trim().length === 0) {
                    msg = 'nickName';
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
                    userName : this.$('.username').val(),
                    password : this.$('.password').val(),
                    passwordVerify : this.$('.password-verify').val(),
                    nickName : this.$('.nickname').val(),
                    captcha : this.$('.captcha').val(),
                    pravicy : this.$('.pravicy').prop('checked')
                });

                this.$('input').removeClass('invalid');
                this.$('.text-warning').hide();

                if (this.userModel.isValid()) {
                    // IO.requestAsync({
                    //     type : 'post',
                    //     url : CONFIG.actions.ACCOUNT_REG
                    // });
                    this.$('.section').css('-webkit-transform', 'translate3d(0, -200%, 0)');
                    setTimeout(function () {
                        this.trigger('next')
                    }.bind(this), 3000);
                } else {
                    switch (this.userModel.validationError) {
                    case 'userName':
                        this.$('.username').addClass('invalid').next().show();
                        break;
                    case 'password':
                        this.$('.password').addClass('invalid').next().show();
                        break;
                    case 'passwordVerify':
                        this.$('.password-verify').addClass('invalid').next().show();
                        break;
                    case 'nickName':
                        this.$('.nickname').addClass('invalid').next().show();
                        break;
                    }
                }
            },
            clickButtonAction : function () {
                if (!Account.get('isLogin')) {
                    this.$('.section').css('-webkit-transform', 'translate3d(0, -100%, 0)');
                }
            },
            clickPavicy : function (evt) {
                this.$('.button-reg').prop('disabled', !evt.originalEvent.srcElement.checked);
            },
            clickButtonLogin : function () {
                Account.loginAsync(i18n.welcome.GUIDE_REG_LOGIN_AND_BACKUP);
            },
            clickCaptchaImage : function () {
                var $img = this.$('.captcha-image');
                $img.attr('src', $img.attr('src'));
            },
            events :  {
                'click .button-reg' : 'clickButtonReg',
                'click .pravicy' : 'clickPavicy',
                'click .button-login' : 'clickButtonLogin',
                'click .captcha-image' : 'clickCaptchaImage'
            }
        });

        var factory = _.extend({
            getInstance : function () {
                return new CloudBackupView({
                    action : i18n.welcome.GUIDE_CLOUD_BACKUP_OPEN
                });
            }
        });

        return factory;
    });
}(this));