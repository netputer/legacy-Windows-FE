/*global define*/
(function (window, undefined) {
    define([
        'underscore',
        'doT',
        'ui/UIHelper',
        'ui/TemplateFactory',
        'ui/Button',
        'ui/Menu'
    ], function (
        _,
        doT,
        UIHelper,
        TemplateFacory,
        Button,
        Menu
    ) {
        console.log('MenuButton - File loaded.');

        var EventsMapping = UIHelper.EventsMapping;
        var document = window.document;

        var MenuButton = Button.extend({
            className : Button.prototype.className + ' w-ui-menubutton',
            template : doT.template(TemplateFacory.get('ui', 'menu-button')),
            initialize : function () {
                MenuButton.__super__.initialize.apply(this, arguments);

                var items = [];
                var menu;
                Object.defineProperties(this, {
                    items : {
                        set : function (value) {
                            if (value instanceof Array) {
                                items = value;
                                if (menu) {
                                    menu.items = items;
                                    menu.render();
                                }
                            } else {
                                console.error('MenuButton - Paramater \'item\' type error!');
                            }
                        },
                        get : function () {
                            return items;
                        }
                    },
                    menu : {
                        set : function (value) {
                            menu = value;
                        },
                        get : function () {
                            return menu;
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

                menu = new Menu({
                    items : this.items,
                    $host : this.$el
                });

                menu.on('select', function (data) {
                    this.trigger('select', data);
                }, this);

                var clickHandler = function (evt) {
                    if (!this.$el[0].contains(evt.target) &&
                            !menu.$el[0].contains(evt.target)) {
                        menu.hide();
                        document.removeEventListener('click', clickHandler);
                    }
                }.bind(this);

                menu.on('show', function () {
                    document.addEventListener('click', clickHandler, true);
                    this.$el.addClass('active');
                }, this);

                menu.on('hide', function () {
                    document.removeEventListener('click', clickHandler);
                    this.$el.removeClass('active');
                }, this);

                this.on('clickButton', this.toggleMenu, this);
            },
            toggleMenu : function (evt) {
                var menu = this.menu;
                if (!menu.$el.hasClass('w-layout-hide')) {
                    menu.hide();
                } else {
                    menu.show();
                }
            },
            remove : function () {
                this.$el.remove();
                this.menu.remove();

                this.trigger(EventsMapping.REMOVE);
            }
        });

        return MenuButton;
    });
}(this));