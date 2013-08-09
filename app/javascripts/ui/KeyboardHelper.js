/*global define*/
(function (window, document) {
    define([
        'underscore',
        'backbone',
        'jquery'
    ], function (
        _,
        Backbone,
        $
    ) {
        var KeybordHelper = _.extend({}, Backbone.Events);

        $(document).on('keydown', function (evt) {
            KeybordHelper.trigger('keydown', evt);
        });

        $(document).on('keyup', function (evt) {
            KeybordHelper.trigger('keyup', evt);
        });

        $(document).on('keypress', function (evt) {
            KeybordHelper.trigger('keypress', evt);
        });

        var KeyMapping = Object.freeze({
            BACKSPACE : 8,
            TAB : 9,
            ENTER : 13,
            ESC : 27,
            LEFT : 37,
            UP : 38,
            RIGHT : 39,
            DOWN : 40,
            END : 35,
            HOME : 36,
            SPACEBAR : 32,
            PAGEUP : 33,
            PAGEDOWN : 34,
            J : 74,
            K : 75
        });

        Object.defineProperty(KeybordHelper, 'Mapping', {
            get : function () {
                return KeyMapping;
            }
        });

        return KeybordHelper;
    });
}(this, this.document));
