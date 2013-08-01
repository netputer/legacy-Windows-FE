/*global define*/
(function (window, document) {
    'use strict';

    define([
        'underscore',
        'jquery',
        'ui/UIHelper'
    ], function (
        _,
        $,
        UIHelper
    ) {
        console.log('DraggableMixin - File loaded.');

        var $document = $(document);

        var MouseState = UIHelper.MouseState;

        var DraggableMixin = {};

        DraggableMixin.init = function () {
            _.bindAll(this, 'dragStart', 'dragEnd', 'mouseMoveHandler');
            this.$el.on('mousedown', '.drag-handel', this.dragStart)
                        .toggleClass('draggable', this.draggable);
        };

        var mouseOriginX;
        var mouseOriginY;
        var originX;
        var originY;

        DraggableMixin.mouseMoveHandler = function (evt) {
            var left = originX + (MouseState.x - mouseOriginX);
            var top = originY + (MouseState.y - mouseOriginY);

            this.position = {
                left : left,
                top : top
            };
        };

        DraggableMixin.dragEnd = function (evt) {
            evt.preventDefault();

            this.$el.removeClass('dragging');

            $document.off('mousemove', this.mouseMoveHandler)
                        .off('mouseup', this.dragEnd);

            this.$el.on('mousedown', '.drag-handel', this.dragStart);

            this.trigger(UIHelper.EventsMapping.DRAGEND);
        };

        DraggableMixin.dragStart = function (evt) {
            if (!this.draggable || evt.which !== 1) {
                return;
            }

            var offset = this.$el.offset();
            mouseOriginX = evt.clientX;
            mouseOriginY = evt.clientY;
            originX = offset.left;
            originY = offset.top;

            this.$el.addClass('dragging');

            $document.on('mousemove', this.mouseMoveHandler)
                        .on('mouseup', this.dragEnd);

            this.$el.off('mousedown', '.drag-handel', this.dragStart);

            this.trigger(UIHelper.EventsMapping.DRAGSTART);
        };

        return {
            mixin : function (that) {
                _.extend(that, DraggableMixin);

                var draggable = true;
                Object.defineProperties(that, {
                    draggable : {
                        set : function (value) {
                            draggable = Boolean(value);
                        },
                        get : function () {
                            return draggable;
                        }
                    }
                });

                var options = that.options || {};
                if (options.hasOwnProperty('draggable')) {
                    that.draggable = options.draggable;
                }

                that.on(UIHelper.EventsMapping.RENDERED, DraggableMixin.init, that);
            }
        };
    });
}(this, this.document));
