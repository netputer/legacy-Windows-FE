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
                    desc : '如何备份和恢复手机数据',
                    url : 'http://wandoujia.zendesk.com/entries/21895693-or#QuestionB1'
                },
                {
                    icon : 'wifi',
                    desc : '如何使用 Wi-Fi  连接手机',
                    url : 'http://help.wandoujia.com/entries/23485641--%E5%AE%98%E6%96%B9%E5%B8%AE%E5%8A%A9-Wi-Fi-%E8%BF%9E%E6%8E%A5%E5%8A%9F%E8%83%BD%E4%BB%8B%E7%BB%8D'
                },
                {
                    icon : 'app',
                    desc : '如何安装本地应用',
                    url : 'http://help.wandoujia.com/entries/23498103--%e5%ae%98%e6%96%b9%e5%b8%ae%e5%8a%a9-%e5%ba%94%e7%94%a8%e4%b8%8b%e8%bd%bd-%E5%AE%89%E8%A3%85%E4%B8%8E%E7%AE%A1%E7%90%86%E5%B8%AE%E5%8A%A9'
                },
                {
                    icon : 'contact',
                    desc : '如何使用豌豆荚管理联系人',
                    url : 'http://help.wandoujia.com/entries/23499366--%e5%ae%98%e6%96%b9%e5%b8%ae%e5%8a%a9-%e9%80%9a%e8%ae%af%e5%bd%95-%E7%9F%AD%E4%BF%A1%E5%8A%9F%E8%83%BD%E4%BB%8B%E7%BB%8D'
                },
                {
                    icon : 'picture',
                    desc : '如何快速设置壁纸主题',
                    url : 'http://wandoujia.zendesk.com/entries/21701262'
                },
                {
                    icon : 'ringtone',
                    desc : '如何快速设置手机铃声',
                    url : 'http://help.wandoujia.com/entries/23439636--%e5%ae%98%e6%96%b9%e5%b8%ae%e5%8a%a9-%E5%A4%9A%E5%AA%92%E4%BD%93%E6%96%87%E4%BB%B6%E7%AE%A1%E7%90%86%E7%9B%B8%E5%85%B3%E9%97%AE%E9%A2%98%E6%B1%87%E6%80%BB'
                },
                {
                    icon : 'contact',
                    desc : '为什么不能识别设备上的联系人、短信或应用',
                    url : 'http://help.wandoujia.com/entries/22017678'
                },
                {
                    icon : 'app',
                    desc : '如何知道手机对应的游戏数据包',
                    url : 'http://help.wandoujia.com/entries/23436447#QuestionA'
                },
                {
                    icon : 'traffic',
                    desc : '「豌豆荚 Android 版」会消耗手机流量吗',
                    url : 'http://help.wandoujia.com/entries/23436447#QuestionB'
                },
                {
                    icon : 'contact',
                    desc : '如何导入或导出我的联系人',
                    url : 'http://help.wandoujia.com/entries/23424031#QuestionA'
                }
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
