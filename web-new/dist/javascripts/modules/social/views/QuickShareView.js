/*global define*/
(function (window, undefined) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'ui/TemplateFactory',
        'ui/ToastBox',
        'utilities/StringUtil',
        'Configuration',
        'Internationalization',
        'Log',
        'IO',
        'Settings',
        'social/SocialService'
    ], function (
        Backbone,
        _,
        doT,
        $,
        TemplateFactory,
        ToastBox,
        StringUtil,
        CONFIG,
        i18n,
        log,
        IO,
        Settings,
        SocialService
    ) {
        console.log('QuickShareView - File loaded. ');

        var BodyView = Backbone.View.extend({
            className : 'w-quick-share-ctn hbox',
            template : doT.template(TemplateFactory.get('social', 'uninstall-share')),
            render : function () {
                this.$el.html(this.template({
                    items : [{
                        id : 'uninstall-ads',
                        name : i18n.misc.REVIEW_FOR_UNINSTALL_ADS
                    }, {
                        id : 'uninstall-traffic',
                        name : i18n.misc.REVIEW_FOR_UNINSTALL_TRAFFIC
                    }, {
                        id : 'uninstall-memory',
                        name : i18n.misc.REVIEW_FOR_UNINSTALL_MEMORY
                    }, {
                        id : 'uninstall-other',
                        name : i18n.misc.REVIEW_FOR_UNINSTALL_OTHER
                    }]
                }));

                return this;
            },
            clickItem : function (evt) {
                var id = $(evt.target).data('id');
                var title = this.model.get('base_info').name;
                var packageName = this.model.get('base_info').package_name;

                var data = {
                    textUrl : StringUtil.format(CONFIG.enums.SOCIAL_TEXT_PREVIEW_POST_URL, CONFIG.enums.SOCIAL_UNINSTALL_APP),
                    textData : {
                        content : JSON.stringify({
                            uninstall_reason : id,
                            app_title : title,
                            app_package_name : packageName
                        })
                    },
                    hasPreview : false,
                    shareData : {
                        need_shell : 0,
                        rotation : 0
                    },
                    extraData : {
                        uninstall_reason : id,
                        app_title : title,
                        app_package_name : packageName
                    },
                    type : CONFIG.enums.SOCIAL_UNINSTALL_APP
                };

                SocialService.setContent(data);
                SocialService.show();
            },
            events : {
                'click li' : 'clickItem'
            }
        });

        var QuickShareView = ToastBox.extend({
            initialize : function () {
                QuickShareView.__super__.initialize.apply(this, arguments);

                this.$content = new BodyView({
                    model : this.model
                }).render().$el;
            },
            show : function () {
                QuickShareView.__super__.show.apply(this);

                log({
                    'event' : 'social.show_uninstall_app_toast'
                });
            }
        });

        var factory = _.extend({
            getInstance : function (args) {
                return new QuickShareView(args);
            }
        });

        return factory;
    });
}(this));
