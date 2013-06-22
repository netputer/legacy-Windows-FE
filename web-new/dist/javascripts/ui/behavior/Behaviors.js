/*global define*/
(function (window, undefined) {
    'use strict';

    define([
        'ui/behavior/AutoCloseMixin',
        'ui/behavior/ClickToHideMixin',
        'ui/behavior/ButtonSetMixin',
        'ui/behavior/DraggableMixin',
        'ui/behavior/ModalMixin',
        'ui/behavior/DisposableMixin'
    ], function (
        AutoCloseMixin,
        ClickToHideMixin,
        ButtonSetMixin,
        DraggableMixin,
        ModalMixin,
        DisposableMixin
    ) {
        console.log('Behavios - File loaded.');

        var Behaviors = {
            AutoCloseMixin : AutoCloseMixin,
            ClickToHideMixin : ClickToHideMixin,
            ButtonSetMixin : ButtonSetMixin,
            DraggableMixin : DraggableMixin,
            ModalMixin : ModalMixin,
            DisposableMixin : DisposableMixin
        };

        return Behaviors;
    });
}(this));
