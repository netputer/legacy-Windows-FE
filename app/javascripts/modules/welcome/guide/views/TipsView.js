/*global define*/
(function (window) {
    define([
        'jquery',
        'underscore',
        'doT',
        'Internationalization',
        'Log',
        'ui/TemplateFactory',
        'Settings',
        'guide/views/CardView'
    ], function (
        $,
        _,
        doT,
        i18n,
        log,
        TemplateFactory,
        Settings,
        CardView
    ) {
        var TipsView = CardView.getClass().extend({
            className : CardView.getClass().prototype.className + ' w-guide-tips',
            template : doT.template(TemplateFactory.get('guide', 'tips')),
            tips : [
                {
                    icon : 'backup',
                    desc : '如何备份和恢复手机数据？',
                    url : 'http://wandoujia.zendesk.com/entries/21895693-or#QuestionB1'
                },
                {
                    icon : 'sdcard',
                    desc : '如何使用 Wi-Fi 连接手机？',
                    url : 'http://help.wandoujia.com/entries/23485641--%E5%AE%98%E6%96%B9%E5%B8%AE%E5%8A%A9-Wi-Fi-%E8%BF%9E%E6%8E%A5%E5%8A%9F%E8%83%BD%E4%BB%8B%E7%BB%8D'
                },
                {
                    icon : 'app',
                    desc : '如何安装本地应用？',
                    url : 'http://help.wandoujia.com/entries/23498103--%E5%AE%98%E6%96%B9%E5%B8%AE%E5%8A%A9-%E5%BA%94%E7%94%A8%E4%B8%8B%E8%BD%BD-%E5%AE%89%E8%A3%85%E4%B8%8E%E7%AE%A1%E7%90%86%E5%B8%AE%E5%8A%A9'
                },
                {
                    icon : 'contact',
                    desc : '如何使用豌豆荚管理联系人？',
                    url : 'http://help.wandoujia.com/entries/23499366--%E5%AE%98%E6%96%B9%E5%B8%AE%E5%8A%A9-%E9%80%9A%E8%AE%AF%E5%BD%95-%E7%9F%AD%E4%BF%A1%E5%8A%9F%E8%83%BD%E4%BB%8B%E7%BB%8D'
                },

                {
                    icon : 'contact',
                    desc : '连接后不能识别设备上的联系人、短信或应用怎么办？',
                    url : 'http://help.wandoujia.com/entries/22017678'
                },
                {
                    icon : 'sdcard',
                    desc : '为什么不能将应用移动至 SD 卡？',
                    url : 'http://help.wandoujia.com/entries/20675597-sd#QuestionA'
                },
                {
                    icon : 'sdcard',
                    desc : '为何无法将应用强制安装到 SD 卡上？',
                    url : 'http://help.wandoujia.com/entries/20675597-sd#QuestionC'
                },
                {
                    icon : 'android',
                    desc : '豌豆荚 Android 版问题汇总',
                    url : 'http://help.wandoujia.com/entries/23447078'
                },
                {
                    icon : 'backup',
                    desc : '使用豌豆荚备份恢复功能常见的问题',
                    url : 'http://help.wandoujia.com/entries/21049996'
                }
                // {
                //     icon : 'game',
                //     desc : '豌豆荚 Android 会消耗手机流量么？',
                //     url : 'http://help.wandoujia.com/entries/23436447#QuestionB'
                // },
                // {
                //     icon : 'traffic',
                //     desc : '应用下载、安装与管理常见问题汇总',
                //     url : 'http://help.wandoujia.com/entries/23436447'
                // },
                // {
                //     icon : 'app',
                //     desc : '为什么断开连接后电脑中还存有我手机中的资料？',
                //     url : 'http://help.wandoujia.com/entries/23424031#QuestionB'
                // },
                // {
                //     icon : 'contact',
                //     desc : '通讯录、短信相关问题汇总',
                //     url : 'http://help.wandoujia.com/entries/23424031'
                // }
            ],
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
