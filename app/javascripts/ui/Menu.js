/*global define, console*/
(function (window) {
    define([
        'underscore',
        'backbone',
        'doT',
        'jquery',
        'ui/UIHelper',
        'ui/TemplateFactory',
        'ui/behavior/LimitInWindowMixin',
        'ui/WindowState'
    ], function (
        _,
        Backbone,
        doT,
        $,
        UIHelper,
        TemplateFactory,
        LimitInWindowMixin,
        WindowState
    ) {
        console.log('Menu - File loaded.');

        var EventsMapping = UIHelper.EventsMapping;

        var ItemBaseView = Backbone.View.extend({
            tagName : 'li',
            className : 'hbox',
            initialize : function () {
                var name = '';
                var label = '';
                var value;
                var disabled = false;
                Object.defineProperties(this, {
                    name : {
                        set : function (value) {
                            name = value.toString();
                        },
                        get : function () {
                            return name;
                        }
                    },
                    label : {
                        set : function (value) {
                            label = value.toString();
                        },
                        get : function () {
                            return label;
                        }
                    },
                    value : {
                        set : function (input) {
                            value = input.toString();
                        },
                        get : function () {
                            return value;
                        }
                    },
                    data : {
                        get : function () {
                            return {
                                name : name,
                                value : value,
                                label : label
                            };
                        }
                    },
                    disabled : {
                        set : function (value) {
                            disabled = value;
                        },
                        get : function () {
                            return disabled;
                        }
                    }
                });

                var options = this.options || {};
                var key;
                for (key in options) {
                    if (options.hasOwnProperty(key)) {
                        this[key] = options[key];
                    }
                }
            },
            render : function () {
                this.$el.html(this.template({
                    name : this.name,
                    label : this.label,
                    value : this.value
                })).attr({
                    disabled : this.disabled
                });
                return this;
            },
            clickItem : function (evt) {
                if (!this.$el.attr('disabled')) {
                    this.trigger('clickItem', this.data);
                }
            },
            events : {
                'click input' : 'clickItem'
            }
        });

        var ItemRadioView = ItemBaseView.extend({
            template : doT.template(TemplateFactory.get('ui', 'menu-item-radio')),
            initialize : function () {
                ItemRadioView.__super__.initialize.apply(this, arguments);
                var checked = false;
                Object.defineProperties(this, {
                    checked : {
                        set : function (value) {
                            checked = value;
                        },
                        get : function () {
                            return checked;
                        }
                    }
                });

                var options = this.options || {};
                var key;
                for (key in options) {
                    if (options.hasOwnProperty(key)) {
                        this[key] = options[key];
                    }
                }
            },
            render : function () {
                this.$el.html(this.template({
                    name : this.name,
                    label : this.label,
                    value : this.value
                }));
                this.$('input[type="radio"]').prop('checked', this.checked);
                return this;
            }
        });

        var ItemNormalView = ItemBaseView.extend({
            template : doT.template(TemplateFactory.get('ui', 'menu-item-normal')),
            events : {
                'click div.normal' : 'clickItem'
            }
        });

        var ItemGroupView = ItemBaseView.extend({
            template : doT.template(TemplateFactory.get('ui', 'menu-item-group'))
        });

        var ItemCheckboxView = ItemBaseView.extend({
            template : doT.template(TemplateFactory.get('ui', 'menu-item-checkbox')),
            initialize : function () {
                ItemCheckboxView.__super__.initialize.apply(this, arguments);
                var checked = false;
                Object.defineProperties(this, {
                    checked : {
                        set : function (value) {
                            checked = value;
                        },
                        get : function () {
                            return checked;
                        }
                    }
                });

                var options = this.options || {};
                var key;
                for (key in options) {
                    if (options.hasOwnProperty(key)) {
                        this[key] = options[key];
                    }
                }
            },
            render : function () {
                this.$el.html(this.template({
                    name : this.name,
                    label : this.label,
                    value : this.value
                }));
                this.$('input[type="checkbox"]').prop('checked', this.checked);
                return this;
            }
        });

        var ItemHrView = ItemBaseView.extend({
            className : 'hr',
            render : function () {
                this.$el.html();
                return this;
            }
        });

        var ItemLinkView = ItemBaseView.extend({
            template : doT.template(TemplateFactory.get('ui', 'menu-item-link')),
            initialize : function () {
                ItemLinkView.__super__.initialize.apply(this, arguments);
                var action;
                Object.defineProperties(this, {
                    action : {
                        set : function (value) {
                            if (value instanceof Function) {
                                action = value;
                            }
                        },
                        get : function () {
                            return action;
                        }
                    }
                });

                var options = this.options || {};
                var key;
                for (key in options) {
                    if (options.hasOwnProperty(key)) {
                        this[key] = options[key];
                    }
                }
            },
            clickItem : function () {
                ItemLinkView.__super__.clickItem.apply(this, arguments);
                this.action.call();
            },
            events : {
                'click div.link' : 'clickItem'
            }
        });

        var Menu = Backbone.View.extend({
            tagName : 'menu',
            className : 'w-ui-menu w-layout-hide',
            initialize : function () {
                LimitInWindowMixin.mixin(this);

                var rendered = false;
                var items = [];
                var transitionEndHandler = function (evt) {
                    if (evt.originalEvent.propertyName === 'opacity') {
                        if (this.$el.css('opacity') === '0') {
                            this.$el.detach();
                            this.trigger(EventsMapping.HIDE);
                        } else if (this.$el.css('opacity') === '1') {
                            this.trigger(EventsMapping.SHOW);
                        }
                    }
                }.bind(this);

                Object.defineProperties(this, {
                    rendered : {
                        set : function (value) {
                            rendered = value;
                        },
                        get : function () {
                            return rendered;
                        }
                    },
                    items : {
                        set : function (value) {
                            if (value instanceof Array) {
                                items = value;
                            } else {
                                console.error('MenuButton - Paramater \'item\' type error!');
                            }
                        },
                        get : function () {
                            return items;
                        }
                    },
                    transitionEndHandler : {
                        get : function () {
                            return transitionEndHandler;
                        }
                    }
                });

                var options = this.options || {};
                var key;
                for (key in options) {
                    if (options.hasOwnProperty(key)) {
                        this[key] = options[key];
                    }
                }
            },
            render : function () {
                this.$el.empty();

                var itemView;
                _.each(this.items, function (item) {
                    switch (item.type) {
                    case 'radio':
                        itemView = new ItemRadioView({
                            name : item.name,
                            label : item.label,
                            value : item.value,
                            checked : item.checked
                        });
                        this.$el.append(itemView.render().$el);
                        itemView.on('clickItem', function (data) {
                            this.trigger('select', data);
                            this.hide();
                        }, this);
                        break;
                    case 'normal':
                        itemView = new ItemNormalView({
                            name : item.name,
                            label : item.label,
                            value : item.value,
                            disabled : item.disabled
                        });
                        this.$el.append(itemView.render().$el);
                        itemView.on('clickItem', function (data) {
                            this.trigger('select', data);
                            this.hide();
                        }, this);
                        break;
                    case 'group':
                        itemView = new ItemGroupView({
                            name : item.name,
                            label : item.label
                        });
                        this.$el.append(itemView.render().$el.addClass('disabled'));
                        break;
                    case 'hr':
                        itemView = new ItemHrView();
                        this.$el.append(itemView.render().$el);
                        break;
                    case 'link':
                        itemView = new ItemLinkView({
                            label : item.label,
                            action : item.action
                        });
                        itemView.on('clickItem', function () {
                            this.hide();
                        }, this);
                        this.$el.append(itemView.render().$el);
                        break;
                    case 'checkbox':
                        itemView = new ItemCheckboxView({
                            name : item.name,
                            label : item.label,
                            value : item.value,
                            checked : item.checked
                        });
                        itemView.on('clickItem', function (data) {
                            this.trigger('select', data);
                            this.hide();
                        }, this);
                        this.$el.append(itemView.render().$el);
                        break;
                    }
                }, this);

                this.$el.off('webkitTransitionEnd', this.transitionEndHandler);
                this.$el.on('webkitTransitionEnd', this.transitionEndHandler);

                this.rendered = true;

                this.trigger(EventsMapping.RENDERED);
                return this;
            },
            show : function () {
                if (!this.rendered) {
                    this.render();
                }

                this.$el.css({
                    top : 0,
                    left : 0
                });

                $('body').append(this.$el);

                this.locate();
                this.$el.removeClass('w-layout-hide');
                this.listenTo(WindowState, 'resize', this.hide);
            },
            hide : function () {
                this.$el.addClass('w-layout-hide');
            },
            remove : function () {
                if (this.rendered) {
                    this.hide();
                    this.$el.remove();
                    this.stopListening();
                    this.rendered = false;
                    this.trigger(EventsMapping.REMOVE);
                }
            }
        });

        return Menu;
    });
}(this));
