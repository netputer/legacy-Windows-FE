/**
 * @fileoverview
 * @ author jingfeng@wandoujia.com
 */

wonder.addModule('ui/window', function (W) {
    W.namespace('wonder.ui');
    var doc = document;
    var win = $(W.host);

    /**
     * @constructor
     */

    function Window (opt_title, opt_content, opt_config) {
        this._title = opt_title;
        this._dragOffset = {
            lastX : 0,
            lastY : 0
        };
        this._content = opt_content;
        this._config = opt_config || {
            className : '',
            mask : true
        };
        this.internalConponent = [];
        this.defaultFocusEl = null;
        _.bindAll(this, '_onKeyUp', '_onKeyDown');
    }


    W.extend(Window, W.ui.UIBase);

    Window.Events = {
        SHOW : 'show',
        HIDE : 'hide'
    };
    Window.prototype._draggable = true;

    Window.prototype._headerEl = null;

    Window.prototype._bodyEl = null;

    Window.prototype._footEl = null;

    Window.prototype._isSupportEsc = true;

    Window.prototype._buildWindow = function () {
        this._headerEl = $('<header/>').addClass('w-window-header');
        this._titleEl = $('<div/>').addClass('w-window-title').text(this._title || '');
        this.closeEl = $('<div/>').addClass('w-window-close');

        this._headerEl.append(this._titleEl).append(this.closeEl);
        this.closeEl.bind('click', $.proxy(this.hide, this));
        this._element.append(this._headerEl)

        this._bodyEl = $('<div/>').addClass('w-window-body');
        this._element.append(this._bodyEl.text(this._content || ''));

        this._footEl = $('<footer/>').addClass('w-window-footer');
        this._element.append(this._footEl);

        this.setDraggable(this._draggable);
    };

    Window.prototype.setSupportEsc = function (isSupportEsc) {
        this._isSupportEsc = isSupportEsc;
    };

    Window.prototype.setDraggable = function (draggable) {
        this._draggable = draggable;
        if (this._isRendered) {
            this._headerEl.unbind('mousedown');
            if (W.isBoolean(draggable) && draggable) {
                this._element.addClass('w-window-draggable');

                this._headerEl.bind('mousedown', $.proxy(this.dragMousedown, this));
            } else {
                this._element.removeClass('w-window-draggable');
            }
        }
    };

    Window.prototype.dragMousedown = function (e) {
        this._dragOffset.lastX = e.pageX;
        this._dragOffset.lastY = e.pageY;
        e.preventDefault();
        $(document).bind('mousemove', $.proxy(this.dragMousemove, this));
        $(document).bind('mouseup', $.proxy(this.dragMouseup, this));
    };

    Window.prototype.dragMousemove = function (e) {
        e.preventDefault();
        var offsetX = e.pageX - this._dragOffset.lastX;
        var offsetY = e.pageY - this._dragOffset.lastY;
        this._dragOffset.lastX = e.pageX;
        this._dragOffset.lastY = e.pageY;
        var curOffset = this._element.offset();
        var windowWidth = win.width();
        var windowHeight = win.height();
        var maxLeft = windowWidth - 45;
        var maxTop = windowHeight - 45;

        var newOffset = {
            left : curOffset.left + offsetX,
            top : curOffset.top + offsetY
        };
        if (newOffset.left <= 0) {
            newOffset.left = 0;
        } else if (newOffset.left >= maxLeft) {
            newOffset.left = maxLeft;
        }
        if (newOffset.top <= 0) {
            newOffset.top = 0;
        } else if (newOffset.top > maxTop) {
            newOffset.top = maxTop;
        }
        this._element.offset(newOffset);
    };

    Window.prototype.dragMouseup = function (e) {
        e.preventDefault();
        $(document).unbind('mousemove', $.proxy(this.dragMousemove, this));
    };

    Window.prototype.setOffset = function (x, y) {
        if (!this._isRendered)
            throw new Error ('This component didn\'t rendered');
        if (x == 'center') {
            x = (this._element.parent().width() - this._element.width()) / 2;
        }

        if (y == 'center') {
            y = (this._element.parent().height() - this._element.height()) / 2;
        }
        this._element.css('left', x).css('top', y);
    };

    Window.prototype.addBodyContent = function (component) {
        component.render(this._bodyEl);
        this.internalConponent.push(component);
    };

    Window.prototype.addFooterContent = function (component) {
        component.render(this._footEl);
        this.internalConponent.push(component);
    };

    Window.prototype.clearBodyContent = function () {
        this._bodyEl.empty();
    };

    Window.prototype.setTitle = function (title) {
        this._titleEl.text(title);
    };

    Window.prototype.show = function () {
        if (!this._isRendered)
            this.render(this._config.parent);
        this._isVisible = true;
        this.removeClassName('w-window-hidden');
        this.addClassName('w-window-visible');
        this.maskEl && this.maskEl.show();
        this.setOffset('center', 'center');
        this.trigger(Window.Events.SHOW);
    };

    Window.prototype.hide = function () {
        this._isVisible = false;
        this.removeClassName('w-window-visible');
        this.addClassName('w-window-hidden');
        this.maskEl && this.maskEl.hide();
        this.trigger(Window.Events.HIDE);
    };

    Window.prototype._onShow = function () {
        doc.addEventListener('keyup', this._onKeyUp);
        doc.addEventListener('keydown', this._onKeyDown);
        this.focus();
    };

    Window.prototype.focus = function () {
        if (this.defaultFocusEl) {
            return $(this.defaultFocusEl).focus().get(0);
        }
        var primaryBtns = this._element.find('.primary:visible');

        if (primaryBtns.length > 0) {
            $(primaryBtns.get(0)).focus();
            return primaryBtns.get(0);
        } else if (this.internalConponent.length > 0) {
            this.internalConponent[0].focus && this.internalConponent[0].focus();
        }
    };

    Window.prototype.hasFocus = function () {
        var primaryBtns = this._element.find(':focus');
        if (primaryBtns.length > 0) {
            return true;
        }
        return false;
    };

    Window.prototype._onHide = function () {
        doc.removeEventListener('keyup', this._onKeyUp);
        doc.removeEventListener('keydown', this._onKeyDown);
        this._element.find('.primary').blur();
    };
    Window.prototype._onKeyDown = function (e) {
        if (!this.isDisabled()) {
            switch(e.keyCode) {
            case 13:
                this.hasFocus() || this.focus();
                break;
            case 9:
                W.delay(this, function () {
                    this.hasFocus() || this.focus();
                }, 5);
                break;
            }
        }
    };
    Window.prototype._onKeyUp = function (e) {
        if (e.keyCode === 27 && !this.isDisabled()) {
            if (this._isSupportEsc) {
                this.hide();
            }
        }
    };

    Window.prototype._disposeInternal = function () {
        if (this._isRendered) {
            this._element.unbind();
            this._element.remove();
        }
    };

    Window.prototype.setDisabled = function (disabled) {
        this._disabled = disabled;
    };

    Window.prototype.render = function (opt_parent) {
        if (!this._isRendered) {
            this._isRendered = true;
            this._element = $('<div/>').addClass('w-window').addClass(this._config.className);
            this._buildWindow();
            if (this._config.mask) {
                this.maskEl = $('<div/>').addClass('w-window-mask-bg');
                this.maskEl.appendTo(opt_parent || doc.body);
            }

            this._element.appendTo(opt_parent || doc.body);
            this.setOffset('center', 'center');

            this.maskEl && this.maskEl.bind('click', function () {
                //TO-DO
            });
            this.bind(Window.Events.SHOW, this._onShow, this);
            this.bind(Window.Events.HIDE, this._onHide, this);
        } else {
            console.log('window conponent rendered.');
        }
    };
    W.ui.Window = Window;

});
wonder.useModule('ui/window');
