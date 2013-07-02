/*global define, console*/
(function (window, undefined) {
    define([
        'doT',
        'jquery',
        'underscore',
        'ui/UIHelper',
        'ui/TemplateFactory',
        'Internationalization'
    ], function (
        doT,
        $,
        _,
        UIHelper,
        TemplateFactory,
        i18n
    ) {
        console.log('ButtonSetMixin - File loaded.');

        var ButtonSetMixin = {};

        var ButtonSet = Object.freeze({
            YES : doT.template(TemplateFactory.get('ui', 'button-set-yes')),
            CANCEL : doT.template(TemplateFactory.get('ui', 'button-set-cancel')),
            RETRY : doT.template(TemplateFactory.get('ui', 'button-set-retry')),
            YES_NO : doT.template(TemplateFactory.get('ui', 'button-set-yes-no')),
            YES_CANCEL : doT.template(TemplateFactory.get('ui', 'button-set-yes-cancel')),
            RETRY_CANCEL : doT.template(TemplateFactory.get('ui', 'button-set-retry-cancel')),
            YES_NO_CANCEL : doT.template(TemplateFactory.get('ui', 'button-set-yes-no-cancel'))
        });

        ButtonSetMixin.init = function () {
            if (this.buttons.length > 0) {
                return;
            }

            this.$('.w-ui-window-footer-button-ctn').prepend(this.$buttonSet);
            this.$buttonSet.on('click', function (evt) {
                if ($(evt.target).hasClass('button-yes')) {
                    this.trigger(UIHelper.EventsMapping.BUTTON_YES);
                } else if ($(evt.target).hasClass('button-no')) {
                    this.trigger(UIHelper.EventsMapping.BUTTON_NO);
                } else if ($(evt.target).hasClass('button-cancel')) {
                    this.trigger(UIHelper.EventsMapping.BUTTON_CANCEL);
                } else if ($(evt.target).hasClass('button-retry')) {
                    this.trigger(UIHelper.EventsMapping.BUTTON_RETRY);
                }
            }.bind(this));
        };

        return {
            mixin : function (that) {
                _.extend(that, ButtonSetMixin);

                var $buttonSet;
                Object.defineProperties(that, {
                    $buttonSet : {
                        get : function () {
                            return $buttonSet;
                        }
                    }
                });

                var options = that.options || {};
                if (options.hasOwnProperty('buttonSet')) {
                    switch (options.buttonSet) {
                    case this.BUTTON_SET.YES:
                        $buttonSet = $(ButtonSet.YES({}));
                        break;
                    case this.BUTTON_SET.CANCEL:
                        $buttonSet = $(ButtonSet.CANCEL({}));
                        break;
                    case this.BUTTON_SET.RETRY:
                        $buttonSet = $(ButtonSet.RETRY({}));
                        break;
                    case this.BUTTON_SET.YES_NO:
                        $buttonSet = $(ButtonSet.YES_NO({}));
                        break;
                    case this.BUTTON_SET.YES_CANCEL:
                        $buttonSet = $(ButtonSet.YES_CANCEL({}));
                        break;
                    case this.BUTTON_SET.RETRY_CANCEL:
                        $buttonSet = $(ButtonSet.RETRY_CANCEL({}));
                        break;
                    case this.BUTTON_SET.YES_NO_CANCEL:
                        $buttonSet = $(ButtonSet.YES_NO_CANCEL({}));
                        break;
                    default:
                        console.warn('ButtonSetMixin - ButtonSet not supported.');
                    }
                    that.on(UIHelper.EventsMapping.RENDERED, ButtonSetMixin.init, that);
                }

                that.on(UIHelper.EventsMapping.BUTTON_YES, that.remove);
                that.on(UIHelper.EventsMapping.BUTTON_CANCEL, that.remove);
                that.on(UIHelper.EventsMapping.BUTTON_NO, that.remove);
            },
            BUTTON_SET : Object.freeze({
                YES : 'yes',
                CANCEL : 'cancel',
                RETRY : 'retry',
                YES_NO : 'yes_no',
                YES_CANCEL : 'yes_cancel',
                RETRY_CANCEL : 'retry_cancel',
                YES_NO_CANCEL : 'yes_no_cancel'
            })
        };
    });
}(this));
