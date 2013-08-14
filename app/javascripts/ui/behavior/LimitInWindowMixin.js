;/*global define, console*/
(function (window) {
    define(['underscore', 'ui/UIHelper'], function (_, UIHelper) {
        console.log('LimitInWindowMixin - File loaded. ');

        var WindowState = UIHelper.WindowState;
        var MouseState = UIHelper.MouseState;


        var locateWithHost = function () {
            var hostOffset = this.$host.offset();
            var topOffset = 0;
            var leftOffset = 0;

            this.$el.css({
                'max-height' : 'none',
                'width' : 'auto'
            });

            var hostOffsetHeight = this.$host[0].offsetHeight; // 按钮的高度
            var hostOffsetWidth = this.$host[0].offsetWidth; // 按钮的宽度
            var thisOffsetHeight = this.$el[0].offsetHeight; // 菜单的高度
            var thisOffsetWidth = this.$el[0].offsetWidth; // 菜单的宽度

            var calculatedTop = hostOffset.top - thisOffsetHeight; // 向下显示时，菜单顶端到窗口顶端的距离
            var calculatedBottom = WindowState.height - (hostOffset.top + hostOffsetHeight + thisOffsetHeight); // 向下显示时，菜单底端到窗口底端的距离

            if (this.directionDown) {
                if (calculatedBottom < 0) {
                    // 向下溢出时
                    if (calculatedTop >= 0) {
                        // 向下溢出，但向上不溢出，则向上显示
                        topOffset = calculatedTop;
                    } else {
                        // 向下溢出，向上也溢出，需要判断
                        this.$el.width(this.$el.width() + 16);
                        thisOffsetWidth = this.$el[0].offsetWidth;

                        if (calculatedTop < calculatedBottom) {
                            // 向上溢出比向下溢出多，则向下限高显示
                            topOffset = hostOffset.top + hostOffsetHeight;
                            this.$el.css('max-height', WindowState.height - topOffset - 100);
                        } else {
                            // 向下溢出比向上溢出得多，则向上限高显示
                            topOffset = 200;
                            this.$el.css('max-height', hostOffset.top - (thisOffsetHeight - this.$el.height()) - 200);
                        }
                    }
                } else {
                    // 向下不溢出，则向下显示
                    topOffset = hostOffset.top + hostOffsetHeight;
                }
            } else {
                if (calculatedTop > 0) {
                    topOffset = calculatedTop;
                } else {
                    topOffset = hostOffset.top + hostOffsetHeight;
                }
            }

            var rightOverflow;

            if (this.alignToHost) {
                rightOverflow = hostOffset.left + thisOffsetWidth > WindowState.width;
            } else {
                rightOverflow = hostOffset.left + ((hostOffsetWidth + thisOffsetWidth) / 2) > WindowState.width;
            }

            if (rightOverflow) {
                leftOffset = hostOffset.left + hostOffsetWidth - thisOffsetWidth;
            } else {
                if (this.alignToHost) {
                    leftOffset = hostOffset.left;
                } else {
                    leftOffset = hostOffset.left + ((hostOffsetWidth - thisOffsetWidth) / 2);
                }
            }

            this.$el.css({
                '-webkit-transform' : 'translate3d(' + Math.max(0, leftOffset) + 'px, ' + topOffset + 'px, 0)'
            });
        };

        var locateWithHostWithArrow = function () {
            var hostOffset = this.$host.offset();
            var topOffset = 0;
            var leftOffset = 0;

            this.$el.css({
                'max-height' : 'none',
                'width' : 'auto'
            });

            var hostOffsetHeight = this.$host[0].offsetHeight;
            var hostOffsetWidth = this.$host[0].offsetWidth;
            var thisOffsetHeight = this.$el[0].offsetHeight;
            var thisOffsetWidth = this.$el[0].offsetWidth;

            var $arrow = this.$('div.arrow');

            var calculatedTop = hostOffset.top - thisOffsetHeight;

            if (this.directionDown) {
                if (hostOffset.top + hostOffsetHeight + thisOffsetHeight > WindowState.height) {
                    if (calculatedTop >= 0) {
                        topOffset = calculatedTop;

                        topOffset -= 8;
                        $arrow.addClass('bottom');
                    } else {
                        topOffset = hostOffset.top + hostOffsetHeight;
                        this.$el.width(this.$el.width() + 16);
                        thisOffsetWidth = this.$el[0].offsetWidth;
                        this.$el.css('max-height', WindowState.height - topOffset - (thisOffsetHeight - this.$el.height()) - 80);
                    }
                } else {
                    topOffset = hostOffset.top + hostOffsetHeight;

                    topOffset += 8;
                    $arrow.removeClass('bottom');
                }
            } else {
                if (calculatedTop > 0) {
                    topOffset = calculatedTop;

                    topOffset -= 8;
                    $arrow.addClass('bottom');
                } else {
                    topOffset = hostOffset.top + hostOffsetHeight;

                    topOffset += 8;
                    $arrow.removeClass('bottom');
                }
            }

            var rightOverflow;

            if (this.alignToHost) {
                rightOverflow = hostOffset.left + thisOffsetWidth > WindowState.width;
            } else {
                rightOverflow = hostOffset.left + ((hostOffsetWidth + thisOffsetWidth) / 2) > WindowState.width;
            }

            if (rightOverflow) {
                leftOffset = hostOffset.left + hostOffsetWidth - thisOffsetWidth;

                $arrow.css({
                    left : thisOffsetWidth - (hostOffsetWidth / 2) - 5
                });
            } else {
                if (this.alignToHost) {
                    leftOffset = hostOffset.left;

                    $arrow.css({
                        left : hostOffsetWidth / 2 - 5
                    });
                } else {
                    leftOffset = hostOffset.left + ((hostOffsetWidth - thisOffsetWidth) / 2);

                    if (leftOffset <= 0) {
                        var diff = -leftOffset;
                        leftOffset = 0;

                        $arrow.css({
                            left : thisOffsetWidth / 2 - 5 - diff
                        });
                    } else {
                        $arrow.css({
                            left : thisOffsetWidth / 2 - 5
                        });
                    }
                }
            }

            this.$el.css({
                '-webkit-transform' : 'translate3d(' + leftOffset + 'px, ' + topOffset + 'px, 0)'
            });
        };

        var locatWithMouse = function () {
            var topOffset = 0;
            var leftOffset = 0;

            this.$el.css({
                'max-height' : 'none',
                'width' : 'auto'
            });

            var thisOffsetHeight = this.$el[0].offsetHeight;

            if (MouseState.y + thisOffsetHeight > WindowState.height) {
                var calculatedTop = MouseState.y - thisOffsetHeight;
                if (calculatedTop >= 0) {
                    topOffset = calculatedTop;
                } else {
                    topOffset = MouseState.y;
                    this.$el.width(this.$el.width() + 12)
                        .css('max-height', WindowState.height - topOffset - (thisOffsetHeight - this.$el.height()) - 80);
                }
            } else {
                topOffset = MouseState.y;
            }

            if (MouseState.x + this.$el[0].offsetWidth > WindowState.width) {
                leftOffset = MouseState.x - this.$el[0].offsetWidth;
            } else {
                leftOffset = MouseState.x;
            }

            this.$el.css({
                '-webkit-transform' : 'translate3d(' + Math.max(0, leftOffset) + 'px, ' + topOffset + 'px, 0)'
            });
        };

        var LimitInWindowMixin = {};

        LimitInWindowMixin.locate = function () {
            if (this.$host !== undefined) {
                if (this.$('div.arrow').length === 0) {
                    locateWithHost.call(this);
                } else {
                    locateWithHostWithArrow.call(this);
                }
            } else {
                locatWithMouse.call(this);
            }
        };

        return {
            mixin : function (that) {
                _.extend(that, LimitInWindowMixin);

                if (!that.hasOwnProperty('$host')) {
                    var $host;
                    var alignToHost = true;
                    var directionDown = true;
                    Object.defineProperties(that, {
                        $host : {
                            set : function (value) {
                                $host = value;
                            },
                            get : function () {
                                return $host;
                            }
                        },
                        alignToHost : {
                            set : function (value) {
                                alignToHost = value;
                            },
                            get : function () {
                                return alignToHost;
                            }
                        },
                        directionDown : {
                            set : function (value) {
                                directionDown = value;
                            },
                            get : function () {
                                return directionDown;
                            }
                        }
                    });

                    if (that.options.hasOwnProperty('$host')) {
                        $host = that.options.$host;
                    }
                }
            }
        };
    });
}(this));
