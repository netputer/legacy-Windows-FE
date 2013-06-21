/*global define*/
/**
 * @author wangye.zhao@wandoujia.com
 * @doc http://
 */
(function (window, undefined) {
    define([
        'underscore',
        'backbone',
        'doT',
        'jquery',
        'ui/UIHelper',
        'ui/TemplateFactory',
        'ui/behavior/Behaviors'
    ], function (
        _,
        Backbone,
        doT,
        $,
        UIHelper,
        TemplateFactory,
        Behaviors
    ) {
        console.log('Panel - File loaded.');

        var setTimeout = window.setTimeout;

        var EventsMapping = UIHelper.EventsMapping;

        var WindowState = UIHelper.WindowState;

        var Panel = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('ui', 'window')),
            className : 'w-ui-window w-layout-hide vbox',
            initialize : function () {
                Behaviors.ModalMixin.mixin(this);
                Behaviors.ButtonSetMixin.mixin(this);
                Behaviors.DisposableMixin.mixin(this);
                Behaviors.DraggableMixin.mixin(this);

                var position = {};
                var title = '';
                var rendered = false;
                var $bodyContent;
                var height;
                var width;

                var buttons = [];
                var buttonClickHandler = function (evt) {
                    _.each(buttons, function (button) {
                        if (evt.target === button.$button[0]) {
                            this.trigger(button.eventName, evt);
                        }
                    }, this);
                }.bind(this);

                var disableX = false;
                var disableFooter = false;

                Object.defineProperties(this, {
                    position : {
                        set : function (value) {
                            var left = value.left !== undefined ? value.left : position.left;
                            var top = value.top !== undefined ? value.top : position.top;

                            var matrix = [0, 0, 0];
                            this.$el[0].style['-webkit-transform'].replace(/[\w\W]*?\(([\w\W]*?)\)/, function (origin, arg1) {
                                var temp = arg1.split(',');
                                _.each(matrix, function (element, index) {
                                    matrix[index] = Number(temp[index].replace('px', ''));
                                });
                            });

                            position.left = Math.max(Math.min(left, WindowState.width - this.$el[0].offsetWidth), 0);
                            position.top = Math.max(Math.min(top, WindowState.height - this.$el[0].offsetHeight), 0);

                            this.$el.css({
                                '-webkit-transform' : 'translate3d(' + Math.floor(position.left) + 'px, '  + Math.floor(position.top) + 'px, 0)'
                            });
                        },
                        get : function () {
                            return _.clone(position);
                        }
                    },
                    title : {
                        set : function (value) {
                            title = value;
                            this.$('.w-ui-window-header-title').html(title);
                        },
                        get : function () {
                            return title;
                        }
                    },
                    rendered : {
                        set : function (value) {
                            rendered = value;
                        },
                        get : function () {
                            return rendered;
                        }
                    },
                    $bodyContent : {
                        set : function (value) {
                            if (typeof value === 'object') {
                                $bodyContent = value;
                            } else if (value !== undefined) {
                                $bodyContent = $('<p>').html(value.toString());
                            }
                            this.$('.w-ui-window-body').empty().append($bodyContent);
                        },
                        get : function () {
                            return $bodyContent;
                        }
                    },
                    height : {
                        set : function (value) {
                            height = parseInt(value, 10);
                            this.$el.height(height);
                        }
                    },
                    width : {
                        set : function (value) {
                            width = parseInt(value, 10);
                            this.$el.width(width);
                        },
                        get : function () {
                            return width;
                        }
                    },
                    buttons : {
                        set : function (value) {
                            if (value instanceof Array) {
                                buttons = value;
                            } else if (value.hasOwnProperty('$button') && value.hasOwnProperty('eventName')) {
                                buttons.push(value);
                            }

                            var $btnCtn = this.$('.w-ui-window-footer-button-ctn').empty();

                            _.each(buttons, function (button) {
                                $btnCtn.append(button.$button);
                            }, this);
                        },
                        get : function () {
                            return buttons;
                        }
                    },
                    disableX : {
                        set : function (value) {
                            disableX = value;
                            this.$('.w-ui-window-header-x')[disableX ? 'hide' : 'show']();
                        },
                        get : function () {
                            return disableX;
                        }
                    },
                    buttonClickHandler : {
                        get : function () {
                            return buttonClickHandler;
                        }
                    },
                    disableFooter : {
                        set : function (value) {
                            disableFooter = value;
                            this.$('.w-ui-window-footer')[disableFooter ? 'hide' : 'show']();
                        },
                        get : function () {
                            return disableFooter;
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
                if (this.rendered) {
                    return;
                }

                this.delegateEvents();

                $('body').append(this.$el.html(this.template({})));

                this.title = this.title;

                this.$bodyContent = this.$bodyContent;

                this.buttons = this.buttons;

                this.disableX = this.disableX;

                this.width = this.width;

                this.disableFooter = this.disableFooter;

                this.rendered = true;

                this.trigger(EventsMapping.RENDERED);
                return this;
            },
            resizeHandler : function () {
                if (this.draggable) {
                    this.position = this.position;
                } else {
                    this.center();
                }
            },
            show : function () {
                if (!this.rendered) {
                    this.render();
                }
                this.$el.on('click', 'button', this.buttonClickHandler);
                this.listenTo(WindowState, 'resize', this.resizeHandler);

                this.$el.addClass('w-layout-hide');

                setTimeout(this.center.bind(this), 0);

                this.trigger(EventsMapping.SHOW);
            },
            hide : function () {
                this.$el.addClass('w-layout-hide');

                this.$el.off('click', this.buttonClickHandler);

                this.trigger(EventsMapping.HIDE);
            },
            remove : function () {
                if (this.rendered && !this.$el.hasClass('w-layout-hide')) {
                    var transitionEndHandler = function () {
                        this.$el.remove();
                        this.stopListening();
                        this.trigger(EventsMapping.REMOVE);
                    }.bind(this);
                    this.$el.one('webkitTransitionEnd', transitionEndHandler);

                    this.hide();

                    this.rendered = false;
                }
            },
            close : function () {
                this.trigger(EventsMapping.BUTTON_CANCEL);
            },
            center : function () {
                var wrapperWidth = this.$el[0].offsetWidth;
                var wrapperHeight = this.$el[0].offsetHeight;

                this.position = {
                    left : WindowState.scrollLeft + Math.max(0, (WindowState.width - wrapperWidth) / 2),
                    top : WindowState.scrollTop + Math.max(0, (WindowState.height - wrapperHeight) / 2)
                };

                this.$el.removeClass('w-layout-hide');
            },
            addButton : function ($button, eventName) {
                this.buttons.push({
                    $button : $button,
                    eventName : eventName
                });
                this.$('.w-ui-window-footer-button-ctn').append($button);
            },
            events : {
                'click .w-ui-window-header-x' : 'close'
            }
        });

        return Panel;
    });
}(this));
