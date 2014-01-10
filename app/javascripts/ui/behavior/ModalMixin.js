/*global define*/
(function (window, document) {
    'use strict';

    define([
        'underscore',
        'jquery',
        'ui/UIHelper',
        'ui/TemplateFactory'
    ], function (
        _,
        $,
        UIHelper,
        TemplateFactory
    ) {
        console.log('ModalMixin - File loaded.');

        var maskTemplate = TemplateFactory.get('ui', 'modal-mask');

        var ModalMixin = {};

        ModalMixin.addMask = function () {
            this.$el.before(this.$modelMask);
        };

        ModalMixin.removeMask = function () {
            this.$modelMask.remove();
        };

        return {
            mixin : function (that) {
                _.extend(that, ModalMixin);

                var $modelMask = $(maskTemplate);
                Object.defineProperties(that, {
                    $modelMask : {
                        get : function () {
                            return $modelMask;
                        }
                    }
                });

                var modal = true;

                var options = that.options || {};
                if (options.hasOwnProperty('modal')) {
                    modal = options.modal;
                }

                if (modal) {
                    that.on(UIHelper.EventsMapping.SHOW, that.addMask);
                    that.on(UIHelper.EventsMapping.REMOVE, that.removeMask);
                    that.on(UIHelper.EventsMapping.HIDE, that.removeMask);
                }
            }
        };
    });
}(this, this.document));

