/*global define*/
(function (window) {
    define([
        'jquery',
        'underscore',
        'backbone',
        'ui/WindowState',
        'ui/MouseState',
        'ui/EventsMapping'
    ], function (
        $,
        _,
        Backbone,
        WindowState,
        MouseState,
        EventsMapping
    ) {
        console.log('ToastBox - File loaded. ');

        var setTimeout = window.setTimeout;
        var setInterval = window.setInterval;
        var clearInterval = window.clearInterval;

        var ToastBox = Backbone.View.extend({
            className : 'w-ui-toast-box w-layout-hide',
            initialize : function () {
                var $content;
                Object.defineProperties(this, {
                    $content : {
                        set : function (value) {
                            if (typeof value === 'object') {
                                $content = value;
                            } else {
                                $content = $('<div>').html(value);
                            }
                        },
                        get : function () {
                            return $content;
                        }
                    }
                });

                var options = this.options || {};
                var key;
                for (key in options) {
                    if (options.hasOwnProperty(key) &&
                            this.hasOwnProperty(key)) {
                        this[key] = options[key];
                    }
                }
            },
            render : function () {
                this.$el.append(this.$content);

                $('body').append(this.$el);
            },
            show : function () {
                this.render();

                this.center();

                this.countDown();

                this.listenTo(WindowState, 'resize', this.center);
            },
            center : function () {
                var wrapperWidth = this.$el[0].offsetWidth;
                var left = WindowState.scrollLeft + Math.max(0, (WindowState.width - wrapperWidth) / 2);

                left = Math.max(Math.min(left, WindowState.width - this.$el[0].offsetWidth), 0);

                this.$el.offset({
                    left : left
                });

                this.$el.removeClass('w-layout-hide');
            },
            countDown : function () {
                setTimeout(function () {
                    if (!this.$el[0].contains(MouseState.currentElement)) {
                        this.remove();
                    } else {
                        var handler = setInterval(function () {
                            if (!this.$el[0].contains(MouseState.currentElement)) {
                                this.remove();
                                clearInterval(handler);
                            }
                        }.bind(this), 50);
                    }
                }.bind(this), 5000);
            },
            remove : function () {
                if (!this.$el.hasClass('w-layout-hide')) {
                    this.$el.addClass('w-layout-hide');

                    var transitionEndHandler = function () {
                        ToastBox.__super__.remove.call(this);
                        this.trigger(EventsMapping.REMOVE);
                    }.bind(this);
                    this.$el.one('webkitTransitionEnd', transitionEndHandler);
                }
            }
        });

        return ToastBox;
    });
}(this));
