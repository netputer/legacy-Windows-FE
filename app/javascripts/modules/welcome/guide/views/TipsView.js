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
                    url : 'http://www.wandoujia.com/help/?do=topic&id=29170747'
                },
                {
                    icon : 'wifi',
                    desc : '如何使用 Wi-Fi  连接手机',
                    url : 'http://www.wandoujia.com/help/?do=topic&id=23873416'
                },
                {
                    icon : 'app',
                    desc : '如何安装本地应用',
                    url : 'http://www.wandoujia.com/help/?do=topic&id=23908343'
                },
                {
                    icon : 'contact',
                    desc : '如何使用豌豆荚管理联系人',
                    url : 'http://www.wandoujia.com/help/?do=topic&id=29691816'
                },
                {
                    icon : 'ringtone',
                    desc : '为什么试听铃声没有声音',
                    url : 'http://www.wandoujia.com/help/?do=topic&id=23916587'
                },
                {
                    icon : 'ringtone',
                    desc : '如何快速设置手机铃声',
                    url : 'http://www.wandoujia.com/help/?do=topic&id=23913916'
                },
                {
                    icon : 'contact',
                    desc : '为什么不能识别设备上的联系人、短信或应用',
                    url : 'http://www.wandoujia.com/help/?do=topic&id=23884968'
                },
                {
                    icon : 'app',
                    desc : '网游充值遇到问题怎么办',
                    url : 'http://www.wandoujia.com/help/?do=topic&id=25006937'
                },
                {
                    icon : 'traffic',
                    desc : '「豌豆荚 Android 版」会消耗手机流量吗',
                    url : 'http://www.wandoujia.com/help/?do=topic&id=23898841'
                },
                {
                    icon : 'contact',
                    desc : '如何导入或导出我的联系人',
                    url : 'http://www.wandoujia.com/help/?do=topic&id=23874953'
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
