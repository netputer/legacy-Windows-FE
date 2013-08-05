/*global console, define*/
(function (window) {
    define([
        'underscore',
        'jquery',
        'ui/UIHelper',
        'Internationalization',
        'ui/TemplateFactory',
        'doT'
    ], function (_, $, UIHelper, i18n, TemplateFactory, doT) {

        var WanXiaoDou = {
            toggleEmptyTip : function (show) {
                var $tipCtn = this.$('.empty-tip');
                if (show !== undefined) {

                    if (this.$('.w-wanxiaodou-img').length === 0) {
                        $tipCtn.addClass('center fix-text');
                        this.$('.text-tip').before(doT.template(TemplateFactory.get('misc', 'wanxiaodou'))({}));
                    }

                    $tipCtn.toggleClass('w-layout-hide', !show);
                } else {
                    $tipCtn.toggleClass('w-layout-hide');
                }
            }
        };

        return {
            mixin : function (that) {

                var originalToggle = that.toggleEmptyTip;
                var showWanXiaoDou = false;
                Object.defineProperties(that, {
                    showWanXiaoDou : {
                        set : function (value) {
                            showWanXiaoDou = value;
                            if (value) {
                                this.toggleEmptyTip = WanXiaoDou.toggleEmptyTip;
                            } else {
                                this.$('.w-wanxiaodou-img').remove();
                                this.$('.empty-tip').removeClass('center fix-text');

                                this.toggleEmptyTip = originalToggle;
                            }
                        },
                        get : function () {
                            return showWanXiaoDou;
                        }
                    }
                });
            }
        };
    });
}(this));

