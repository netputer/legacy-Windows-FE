/*global define, console*/
(function (window) {
    define([
        'underscore',
        'ui/UIHelper'
    ], function (
        _,
        UIHelper
    ) {
        console.log('BlurToHideMixin - File loaded');

        var setTimeout = window.setTimeout;
        var setInterval = window.setInterval;
        var clearInterval = window.clearInterval;

        var MouseState = UIHelper.MouseState;

        var BlurToHideMixin = {};

        BlurToHideMixin.checkMousePosition = function () {
            var currentElement = MouseState.currentElement;
            var $host = this.$host;
            return $host[0].contains(currentElement) ||
                    this.$el[0].contains(currentElement);
        };

        BlurToHideMixin.initBlurToHideMixin = function () {
            if (!this.mouseHoverHandeler) {
                this.mouseHoverHandeler = _.debounce(function () {
                    if (BlurToHideMixin.checkMousePosition.call(this) && this.$host.is(':visible')) {
                        this.show();

                        if (this.ignoreSelf) {
                            this.$el.css({
                                'pointer-events' : 'none'
                            });
                        } else {
                            this.$el.css({
                                'pointer-events' : 'default'
                            });
                        }

                        var delegate = setInterval(function () {
                            if (!BlurToHideMixin.checkMousePosition.call(this)) {
                                setTimeout(function () {
                                    if (!BlurToHideMixin.checkMousePosition.call(this)) {
                                        this.hide();
                                        clearInterval(delegate);
                                    }
                                }.bind(this), this.blurDelay);
                            }
                        }.bind(this), 25);
                    }
                }.bind(this), 300);

                this.$host.on('mouseenter', this.mouseHoverHandeler);
            }
        };

        BlurToHideMixin.destoryBlurToHideMixin = function () {
            this.$host.off('mouseenter', this.mouseHoverHandeler);
            this.mouseHoverHandeler = undefined;
        };

        return {
            mixin : function (that) {
                _.extend(that, BlurToHideMixin);

                var $host;
                var ignoreSelf = false;
                var blurDelay = 0;
                if (!that.hasOwnProperty('$host')) {
                    Object.defineProperties(that, {
                        $host : {
                            set : function (value) {
                                $host = value;
                            },
                            get : function () {
                                return $host;
                            }
                        },
                        ignoreSelf : {
                            set : function (value) {
                                ignoreSelf = value;
                            },
                            get : function () {
                                return ignoreSelf;
                            }
                        },
                        blurDelay : {
                            set : function (value) {
                                blurDelay = value;
                            },
                            get : function () {
                                return blurDelay;
                            }
                        }
                    });
                }

                if (that.options.hasOwnProperty('$host')) {
                    $host = that.options.$host;
                }

                BlurToHideMixin.initBlurToHideMixin.call(that);
            }
        };
    });
}(this));
