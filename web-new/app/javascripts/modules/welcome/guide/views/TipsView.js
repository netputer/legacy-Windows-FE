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
        'guide/views/CardView'
    ], function (
        $,
        _,
        doT,
        i18n,
        log,
        TemplateFactory,
        IO,
        CardView
    ) {
        var TipsView = CardView.getClass().extend({
            className : CardView.getClass().prototype.className + ' w-guide-tips',
            template : doT.template(TemplateFactory.get('guide', 'tips')),
            tips : [{
                icon : '',
                desc : '保存自己的应用数据',
                url : ''
            }, {
                icon : '',
                desc : '保存自己的应用数据',
                url : ''
            }, {
                icon : '',
                desc : '保存自己的应用数据',
                url : ''
            }, {
                icon : '',
                desc : '保存自己的应用数据',
                url : ''
            }, {
                icon : '',
                desc : '保存自己的应用数据',
                url : ''
            }, {
                icon : '',
                desc : '保存自己的应用数据',
                url : ''
            }, {
                icon : '',
                desc : '保存自己的应用数据',
                url : ''
            }, {
                icon : '',
                desc : '保存自己的应用数据',
                url : ''
            }, {
                icon : '',
                desc : '保存自己的应用数据',
                url : ''
            }],
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
