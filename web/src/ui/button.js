/**
 *
 * @fileoverview
 * @jingfeng@wandoujia.com
 *
 */
wonder.addModule('ui/button', function(W) {
    var doc = document;
    /**
     * @constructor
     */
    function Button(title) {
        this._title = title;
    }


    W.extend(Button, W.ui.UIBase);
    Button.Actions = {
        CLICK : 'click'
    };
    Button.prototype._textEl = null;
    Button.prototype.setTitle = function(title) {
        if(this._textEl) {
            this._textEl.text(title);
        }
        this._title = title;
    };
    Button.prototype.getTitle = function() {
        return this._title;
    };
    Button.prototype.setDisabled = function(disabled) {
        this._disabled = disabled;
        if(this._isRendered) {
            this._element.prop('disabled', !!disabled);
        }
    };
    Button.prototype.show = function() {
        this._element.show();
    };
    Button.prototype.hide = function() {
        this._element.hide();
    };
    Button.prototype.render = function(opt_parent) {
        if(this._isRendered) {
            throw new Error('component has rendered');
        }
        if(!this._element) {
            this._textEl = $('<text/>').text(this._title || '');
            this._element = $('<button/>').append(this._textEl);
            this._element.appendTo(opt_parent || document.body);
            // QUESTION: why not use a template?
            // TODO: replace DOM creation with template because DOM creation is not fast enough.
            this._element.bind('click', $.proxy(function(e) {
                if(!this.propagation) {
                    e.stopPropagation();
                }
                this.trigger(Button.Actions.CLICK, this);
            }, this));
            this._isRendered = true;
            this.setDisabled(!!this._disabled);
        }
        return this;
    };
    W.ui.Button = Button;

    function ImageButton(title) {
        Button.call(this, title);
        // TODO: subclass should have reference to superclass constructor and avoid knowing its name directly.
    }


    W.extend(ImageButton, Button);
    W.mix(ImageButton.prototype, {
        _iconEl : null,
        addImageClass : function(className) {
            this._iconEl.addClass(className);
            // QUESTION: is it possible to do this with `_element`'s class and the `addClassName` method of superclass?
        },
        render : function(opt_parent) {
            ImageButton._super_.render.call(this, opt_parent);
            this._iconEl = $('<span class="icon"/>');
            this._textEl.before(this._iconEl);
            this._element.addClass('w-icon-btn w-ui-iconbutton')
            return this;
        }
    });
    W.ui.ImageButton = ImageButton;
});
wonder.useModule('ui/button');
