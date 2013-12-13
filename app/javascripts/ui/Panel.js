/*global define*/
/**
 * @author wangye.zhao@wandoujia.com
 * @doc http://
 */
(function (window) {
    define([
        'underscore',
        'backbone',
        'doT',
        'jquery',
        'ui/UIHelper',
        'ui/TemplateFactory',
        'ui/behavior/Behaviors',
        'IO',
        'Configuration'
    ], function (
        _,
        Backbone,
        doT,
        $,
        UIHelper,
        TemplateFactory,
        Behaviors,
        IO,
        CONFIG
    ) {
        console.log('Panel - File loaded.');

        var setTimeout = window.setTimeout;

        var EventsMapping = UIHelper.EventsMapping;

        var WindowState = UIHelper.WindowState;

        var Panel = Backbone.View.extend({
            template : doT.template(TemplateFactory.get('ui', 'window')),
            className : 'w-ui-window vbox',
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
                var isShow = false;

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

                            position.left = Math.max(Math.min(left, WindowState.width - this.$el[0].offsetWidth), 0);
                            position.top = Math.max(Math.min(top, WindowState.height - this.$el[0].offsetHeight), 0);

                            this.$el.offset(position);
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
                    },
                    isShow : {
                        set : function (value) {
                            isShow = value;
                        },
                        get : function () {
                            return isShow;
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

                this.on(EventsMapping.SHOW, function (argument) {
                    window.externalCall('', 'navigation', JSON.stringify({
                        canGoBack : false,
                        canGoForward : false,
                        canReload : false
                    }));
                });

                this.on(EventsMapping.HIDE, function (argument) {
                    IO.sendCustomEventsAsync(CONFIG.events.HISTORY_CHANGED);
                });
            },
            render : function () {
                if (this.rendered) {
                    return;
                }

                this.delegateEvents();

                $('body').append(this.$el.html(this.template({})));

                this.title = this.title;

                this.position = this.$el.offset();

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
                this.$el.on('click', 'button', this.buttonClickHandler).removeClass('show');
                this.listenTo(WindowState, 'resize', this.resizeHandler);

                setTimeout(this.center.bind(this), 0);

                this.isShow = true;
                this.trigger(EventsMapping.SHOW);
            },
            hide : function () {
                this.$el.removeClass('show');

                this.$el.off('click', this.buttonClickHandler);

                this.isShow = false;
                this.trigger(EventsMapping.HIDE);
            },
            remove : function () {
                if (this.rendered && this.$el.hasClass('show')) {
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

                this.$el.addClass('show');
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
