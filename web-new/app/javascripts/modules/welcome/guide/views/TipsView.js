/*global define*/
(function (window) {
    define([
        'jquery',
        'underscore',
        'doT',
        'Internationalization',
        'Log',
        'ui/TemplateFactory',
        'IO',
        'Settings',
        'guide/views/CardView'
    ], function (
        $,
        _,
        doT,
        i18n,
        log,
        TemplateFactory,
        IO,
        Settings,
        CardView
    ) {
        var TipsView = CardView.getClass().extend({
            className : CardView.getClass().prototype.className + ' w-guide-tips',
            template : doT.template(TemplateFactory.get('guide', 'tips')),
            tips : [{
                icon : '../../../../images/guide/contact.png',
                desc : '连接后不能识别设备上的联系人、短信或应用怎么办？',
                url : 'http://help.wandoujia.com/entries/22017678'
            }, {
                icon : '../../../../images/guide/sdcard.png',
                desc : '为什么不能将应用移动至 SD 卡？',
                url : 'http://help.wandoujia.com/entries/20675597-sd#QuestionA'
            }, {
                icon : '../../../../images/guide/sdcard.png',
                desc : '为何无法将应用强制安装到 SD 卡上？',
                url : 'http://help.wandoujia.com/entries/20675597-sd#QuestionC'
            }, {
                icon : '../../../../images/guide/android.png',
                desc : '豌豆荚 Android 版问题汇总',
                url : 'http://help.wandoujia.com/entries/23447078'
            }, {
                icon : '../../../../images/guide/backup.png',
                desc : '使用豌豆荚备份恢复功能常见的问题',
                url : 'http://help.wandoujia.com/entries/21049996'
            }, {
                icon : '../../../../images/guide/game.png',
                desc : '豌豆荚 Android 会消耗手机流量么？',
                url : 'http://help.wandoujia.com/entries/23436447#QuestionB'
            }, {
                icon : '../../../../images/guide/traffic.png',
                desc : '应用下载、安装与管理常见问题汇总',
                url : 'http://help.wandoujia.com/entries/23436447'
            }, {
                icon : '../../../../images/guide/app.png',
                desc : '为什么断开连接后电脑中还存有我手机中的资料？',
                url : 'http://help.wandoujia.com/entries/23424031#QuestionB'
            }, {
                icon : '../../../../images/guide/contact.png',
                desc : '通讯录、短信相关问题汇总',
                url : 'http://help.wandoujia.com/entries/23424031'
            }],
            initialize : function () {
                this.on('next', function () {
                    Settings.set('user_guide_shown_tips', true, true);
                    Settings.set('user_guide_shown', true, true);
                });
            },
            checkAsync : function () {
                var deferred = $.Deferred();

                if (Settings.get('user_guide_shown_tips')) {
                    setTimeout(deferred.reject);
                } else {
                    setTimeout(deferred.resolve);

                    log({
                        'event' : 'debug.guide_tips_show'
                    });
                }

                return deferred.promise();
            },
            render : function () {
                _.extend(this.events, TipsView.__super__.events);
                this.delegateEvents();

                this.$el.html(this.template({
                    action : this.options.action,
                    tips : this.tips
                }));
                return this;
            },
            clickButtonOpen : function (evt) {
                $(evt.currentTarget).parent().addClass('text-thirdly');

                log({
                    'event' : 'ui.click.guide_tips_item'
                });
            },
            clickButtonAction : function () {
                TipsView.__super__.clickButtonAction.call(this);

                log({
                    'event' : 'ui.click.guide_tips_action'
                });
            },
            events : {
                'click .button-open' : 'clickButtonOpen'
            }
        });

        var factory = _.extend({
            getInstance : function () {
                return new TipsView({
                    action : i18n.welcome.GUIDE_TIPS_READ_ALL
                });
            }
        });

        return factory;
    });
}(this));
