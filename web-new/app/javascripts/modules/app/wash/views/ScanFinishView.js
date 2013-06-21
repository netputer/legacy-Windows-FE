/*global define*/
(function (window, undefined) {
    define([
        'backbone',
        'underscore',
        'doT',
        'jquery',
        'ui/TemplateFactory',
        'utilities/StringUtil',
        'Configuration',
        'social/SocialService',
        'Log',
        'app/wash/views/FeedbackWindowView'
    ], function (
        Backbone,
        _,
        doT,
        $,
        TemplateFactory,
        StringUtil,
        CONFIG,
        SocialService,
        log,
        FeedbackWindowView
    ) {
        console.log('ScanFinishView - File loaded.');

        var ScanFinishView = Backbone.View.extend({
            className : 'w-app-wash-finish',
            initialize : function () {
                var original = {
                    pirate : 0,
                    ads : 0
                };

                Object.defineProperties(this, {
                    original : {
                        set : function (value) {
                            original = value;
                        },
                        get : function () {
                            return original;
                        }
                    }
                });
            },
            render : function () {
                this.$el.html(this.template({}));
                return this;
            },
            switchToEmptyView : function () {
                this.template = doT.template(TemplateFactory.get('wash', 'result-empty'));
                this.render();
            },
            switchToFinishView : function (original) {
                this.original = original;
                this.template = doT.template(TemplateFactory.get('wash', 'result-replace-finish'));
                this.render();
            },
            clickButtonShare : function () {
                var data = {
                    textUrl : StringUtil.format(CONFIG.enums.SOCIAL_TEXT_PREVIEW_URL, CONFIG.enums.SOCIAL_WASH, JSON.stringify({
                        mockNum : this.original.pirate,
                        adsNum : this.original.ads
                    })),
                    hasPreview : false,
                    shareData : {
                        need_shell : 0,
                        rotation : 0
                    },
                    extraData : {
                        mockNum : this.original.pirate,
                        adsNum : this.original.ads
                    },
                    type : CONFIG.enums.SOCIAL_WASH
                };

                SocialService.setContent(data);
                SocialService.show();

                this.trigger('next');

                log({
                    'event' : 'ui.click.wash.button_share_finish_view'
                });
            },
            clickButtonFeedback : function () {
                FeedbackWindowView.getInstance().show();

                log({
                    'event' : 'ui.click.wash.button_feedback_finish_view'
                });
            },
            events : {
                'click .button-share' : 'clickButtonShare',
                'click .button-feedback' : 'clickButtonFeedback'
            }
        });

        var factory = _.extend({
            getInstance : function () {
                return new ScanFinishView();
            }
        });

        return factory;
    });
}(this));
