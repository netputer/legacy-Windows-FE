/**
 *
 * @fileoverview
 * @jingfeng@wandoujia.com
 *
 */
wonder.addModule('ui/menu', function(W) {

    var doc = W.host.document;

    /**
     * @constructor Menu
     */
    function Menu(title) {
        this._items = [];
        W.ui.ImageButton.call(this, title);
    }


    W.extend(Menu, W.ui.ImageButton);

    Menu.Actions = {
        SELECT : 'select'
    };

    Menu.prototype._isOpen = false;

    Menu.prototype._isDiaplaySelectLabel = false;

    Menu.prototype._isCloseOnSelect = true;

    Menu.prototype._itemContainerEl = null;

    Menu.prototype._switchMenu = function(e) {
        if(this._items.length <= 0)
            return;
        this._isOpen ? this.closeMenu() : this.openMenu();
    };

    Menu.prototype.setSelectLabelDisplable = function(dsl) {
        this._isDiaplaySelectLabel = dsl;
    };

    Menu.prototype.setCloseOnSelect = function(isCloseOnSelect) {
        this._isCloseOnSelect = isCloseOnSelect;
    };

    Menu.prototype._handleDocumentMouseDown = function(e) {
        var self = e.data;
        if(!self.containsElement(e.target)) {
            $(doc).unbind('click', self._handleDocumentMouseDown);
            self.closeMenu();
            self = null;
        }
    };

    Menu.prototype.containsElement = function(element) {
        if(this._element[0] === element || this._element.has(element).size() > 0 || this._itemContainerEl[0] === element || this._itemContainerEl.has(element).size() > 0) {
            return true;
        }
        return false;
    }

    Menu.prototype.openMenu = function() {
        this._isOpen = true;
        this._itemContainerEl.show();
        this._setPosition();

        $(doc).bind('mousedown', this, this._handleDocumentMouseDown);
    };

    Menu.prototype.closeMenu = function() {
        this._isOpen = false;
        this._itemContainerEl.hide();
        $(doc).unbind('click', this._handleDocumentMouseDown);
    };

    Menu.prototype.addItem = function(item) {
        var self = this;
        item.setMenuOwner(this);
        item.render(this._itemContainerEl);
        item.bind(Menu.Actions.SELECT, function(e) {
            self.trigger(Menu.Actions.SELECT, e);
            if(self._isCloseOnSelect) {
                self.closeMenu();
            }
            if(self._isDiaplaySelectLabel) {
                self.setTitle(item.getTitle());
            }
        });
        this._items.push(item);
    };

    Menu.prototype.removeAllItems = function() {
        this._itemContainerEl.unbind('');
        this._itemContainerEl.empty();
        this._items = [];
    };

    Menu.prototype.selectItemByIndex = function(index) {
        if(this._items[index]) {
            this._items[index].selectItem();
        }
    };

    Menu.prototype.getItemByIndex = function(index) {
        return this._items[index];
    };

    Menu.prototype.getItems = function() {
        return this._items;
    };

    Menu.prototype._setPosition = function() {
        var offset = this._element.offset();
        var x = offset.left;
        var y = offset.top + this._element[0].offsetHeight + 1;
        var menuWidth = this._itemContainerEl.width();
        var rightGapWidth = $(window).width() - x;
        var bottomGap = $(window).height() - y - this._itemContainerEl.height();

        if((menuWidth - rightGapWidth) > 0) {
            x = x - menuWidth + rightGapWidth - 6;
        }

        if(bottomGap < 0) {
            y = offset.top - this._itemContainerEl.outerHeight();
            y = y > 0 ? y : 0;
        }
        this._itemContainerEl.css({
            left : x,
            top : y
        });
    };

    Menu.prototype.render = function(opt_parent) {
        var self = this;
        if(!this._isRendered) {
            Menu._super_.render.call(this, opt_parent);
            this._element.append('<span class="dropdown"><div class="arrow"></div></span>');
            this._itemContainerEl = $('<menu/>').addClass(Menu.Classes.W_MENU_ITEM_CONTAINER).appendTo(doc.body);
            this.bind('click', function() {
                self._switchMenu();
            });

            $(window).bind('resize', $.proxy(function() {
                W.delay(this, this.closeMenu, 25);
            }, this));
        }
        return this;
    };

    Menu.Classes = {
        W_MENU_ITEM_CONTAINER : 'w-ui-menu-container'
    };

    /**
     * @constructor Menuitem
     *  Menu object invoke add method to add Menuitem
     */
    function MenuItem(title) {
        W.ui.Button.call(this, title);
    };


    W.extend(MenuItem, W.ui.Button);

    MenuItem.prototype._menuOwner = null;

    MenuItem.prototype._outerEl = null;

    MenuItem.prototype._innerEl = null;

    MenuItem.prototype.setMenuOwner = function(owner) {
        this._menuOwner = owner;
    };

    MenuItem.prototype.getMenuOwner = function() {
        return this._menuOwner;
    };

    MenuItem.prototype.selectItem = function() {
        this.trigger(Menu.Actions.SELECT, new W.ui.Event(Menu.Actions.SELECT, this));
    };

    MenuItem.prototype._buildContent = function() {
        this._outerEl = $('<div/>').addClass('hbox outer');
        this._innerEl = $('<a href="#"/>');

        this._element.append(this._outerEl.append(this._innerEl));
        this._innerEl.text(this._title || '');
    };

    MenuItem.prototype.setTitle = function(title) {
        this._innerEl.text(title || '');
        this._title = title;
    };

    MenuItem.prototype.getTitle = function(title) {
        return this._title;
    };

    MenuItem.prototype.setDisabled = function(disable) {
        this._element.unbind('click').addClass('w-menuitem-disabled');
        if(!disable) {
            this._element.bind('click', $.proxy(this.selectItem, this)).removeClass('w-menuitem-disabled');
        }
    };

    MenuItem.prototype.render = function(opt_parent) {
        if(!this._element) {
            this._element = $('<dd/>').addClass(MenuItem.Classes.W_MENUITEM);

            this._buildContent();
            this._element.appendTo(opt_parent);
            this._element.bind('click', $.proxy(this.selectItem, this));
        }
    };

    MenuItem.Classes = {
        W_MENUITEM : 'w-ui-menuitem'
    };

    /**
     * @constructor CheckMenuitem
     *  Menu object invoke add method to add CheckMenuItem
     */
    function CheckMenuItem(title, type) {
        this._type = type || "radio";
        //type: checkbox, radio.
        this.checked = false;
        MenuItem.call(this, title);
    }


    W.extend(CheckMenuItem, MenuItem);
    CheckMenuItem.Type = {
        RADIO : 'radio',
        CHECKBOX : 'checkbox'
    }
    W.mix(CheckMenuItem.prototype, {
        _name : '',
        getChecked : function() {
            //TO-DO: fix bug.
            return this.checked;
        },
        setChecked : function(isChecked) {
            //TO-DO: if type is radio, set checked property to false in other items.
            this.checked = isChecked;
            this.checkboxEl.prop('checked', this.checked);
        },
        setName : function(name) {
            if(this.checkboxEl) {
                this.checkboxEl.attr('name', name);
            }
            this._name = name;
        },
        addClass: function(className) {
            this._element.addClass(className);
        },
        render : function(opt_parent) {
            CheckMenuItem._super_.render.call(this, opt_parent);
            var self = this;
            var menuOwner = this.getMenuOwner();
            var checkboxEl = $('<input/>').attr('type', this._type).attr('name', this._name || menuOwner.getUid());
            this.checkboxEl = checkboxEl;

            this._element.addClass('w-ui-checkbox-menuitem');
            this._outerEl.prepend(checkboxEl);
            this.bind(Menu.Actions.SELECT, function() {
                if(self._type === 'radio') {
                    checkboxEl.prop('checked', true);
                } else if(self._type === 'checkbox') {
                    self.checked = !self.checked;
                    checkboxEl.prop('checked', self.checked);
                }
            });
        }
    });
    /**
     * @constructor CheckMenuitem
     *  Menu object invoke add method to add CheckMenuItem
     */
    function MenuSeparateLine() {
        MenuItem.call(this);
    }


    W.extend(MenuSeparateLine, MenuItem);
    W.mix(MenuSeparateLine.prototype, {
        render : function(opt_parent) {
            if(!this._isRendered) {
                this._element = $('<dd/>').addClass('w-menu-separate');
                this._element.appendTo(opt_parent);
                this._isRendered = true;
            }
        }
    });

    /**
     * @constructor
     */
    function ComboMenu(title) {
        Menu.call(this, title);
    }


    W.extend(ComboMenu, Menu);
    W.mix(ComboMenu.prototype, {
        _setPosition : function() {
            var offset = this._element.offset();
            var x = offset.left + this._element.width() - 25;
            var y = offset.top + this._element[0].offsetHeight + 1;
            var menuWidth = this._itemContainerEl.width();
            var rightGapWidth = $(window).width() - x;
            var bottomGap = $(window).height() - this._itemContainerEl.height() - y;

            if((menuWidth - rightGapWidth) > 0) {
                x = offset.left + this._element.width() - menuWidth;
            }
            if(bottomGap < 0) {
                y = offset.top - this._itemContainerEl.height() - 9;
            }
            this._itemContainerEl.css({
                left : x,
                top : y
            });
        },
        setDisabled : function(disabled) {
            this._disabled = disabled;
            if(this._isRendered) {
                this.actionBtn && this.actionBtn.setDisabled(disabled);
                this.dropBtn && this.dropBtn.setDisabled(disabled);
            }
        },
        setActionDisabled : function(disabled) {
            this.actionBtn.setDisabled(disabled)
        },
        setDropDisabled : function(disabled) {
            this.dropBtn.setDisabled(disabled)
        },
        render : function(opt_parent) {
            if(!this._isRendered) {
                var seprateEl = $('<span/>').addClass('vertical');
                ComboMenu._super_.render.call(this, opt_parent);
                this._element.unbind().remove();
                this._element = $('<div/>').addClass('w-ui-combomenu');
                this._element.appendTo(opt_parent);
                this.actionBtn = new W.ui.Button(this.getTitle());
                this.dropBtn = new W.ui.Menu('');

                this.actionBtn.setPropagation(this.getPropagation());
                this.dropBtn.setPropagation(this.getPropagation());

                this.actionBtn.render(this._element);

                this._element.append(seprateEl);
                this.dropBtn.render(this._element);


                this.unbind(W.ui.Button.Actions.CLICK);
                this.dropBtn.bind(W.ui.Button.Actions.CLICK, function() {
                    this._switchMenu();
                }, this);
                this.actionBtn.bind(W.ui.Button.Actions.CLICK, function(e) {
                    this.trigger(W.ui.Button.Actions.CLICK, e);
                }, this);
            }
        }
    });

    W.ui.Menu = Menu;
    W.ui.MenuItem = MenuItem;
    W.ui.CheckMenuItem = CheckMenuItem;
    W.ui.MenuSeparateLine = MenuSeparateLine;
    W.ui.ComboMenu = ComboMenu;
});

wonder.useModule('ui/menu');
