/**
 * Dialog window
 *
 * @author jingfeng@wandoujia.com, wangye.zhao@wandoujia.com
 */

wonder.addModule('ui/dialog', function(W) {
    wonder.namespace('wonder.ui');
    var locale = i18n.ui;

    /**
     * Dialog window
     *
     * @constructor
     * @param {String} title Window title
     * @param {String} content Body content
     */
    function Dialog(title, content) {
        this._content = content;
        W.ui.Window.call(this, title, content);
    }


    W.extend(Dialog, W.ui.Window);

    W.mix(Dialog.prototype, {
        _buttonKey : null,
        _addButtonSet : function() {
            var okBtn = new W.ui.Button(locale.CONFIRM);
            var yesBtn = new W.ui.Button(locale.YES);
            var noBtn = new W.ui.Button(locale.NO);
            var cancelBtn = new W.ui.Button(locale.CANCEL);
            var retryBtn = new W.ui.Button(locale.RETRY);

            this._footEl.empty();
            switch(this._buttonKey) {
                case  Dialog.ButtonSet.OK :
                    this.addFooterContent(okBtn);
                    break;
                case  Dialog.ButtonSet.YES_NO :
                    this.addFooterContent(yesBtn);
                    this.addFooterContent(noBtn);
                    break;
                case  Dialog.ButtonSet.OK_CANCEL :
                    this.addFooterContent(okBtn);
                    this.addFooterContent(cancelBtn);
                    break;
                case Dialog.ButtonSet.YES_NO_CANCEL :
                    this.addFooterContent(yesBtn);
                    this.addFooterContent(noBtn);
                    this.addFooterContent(cancelBtn);
                    break;
                case Dialog.ButtonSet.RETRY_CANCEL:
                    this.addFooterContent(retryBtn);
                    this.addFooterContent(cancelBtn);
                    break;
                default:
                    break;
            }

            okBtn.bind('click', function() {
                this.trigger(Dialog.Events.SELECT, 'ok');
                this.hide();
            }, this);
            okBtn.addClassName('primary');
            yesBtn.bind('click', function() {
                this.trigger(Dialog.Events.SELECT, 'yes');
                this.hide();
            }, this);
            yesBtn.addClassName('primary');
            noBtn.bind('click', function() {
                this.trigger(Dialog.Events.SELECT, 'no');
                this.hide();
            }, this);
            cancelBtn.bind('click', function() {
                this.trigger(Dialog.Events.SELECT, 'cancel');
                this.hide();
            }, this);
            retryBtn.addClassName('primary');
            retryBtn.bind('click', function() {
                this.trigger(Dialog.Events.SELECT, 'retry');
                this.hide();
            }, this);
        },
        setButtonSet : function(buttonKey) {
            this._buttonKey = buttonKey;
            if(this._isRendered) {
                this._addButtonSet();
            }
            return this;
        },
        setContent : function(content) {
            this._content = content;
            if(this._isRendered) {
                this._bodyEl.html(content);
            }
            return this;
        },
        render : function(opt_parent) {
            Dialog._super_.render.call(this, opt_parent);
            this._addButtonSet();
            this.setContent(this._content ? this._content : '');
            this._element.addClass('w-ui-dialog');
            return this;
        }
    });

    Dialog.ButtonSet = {
        OK : 'yes',
        YES_NO : 'yes_no',
        OK_CANCEL : 'ok_cancel',
        YES_NO_CANCEL : 'yes_no_cancel',
        RETRY_CANCEL : 'retry_cancel'
    };

    Dialog.Events = {
        SELECT : 'select'
    };

    W.ui.Dialog = Dialog;
});
wonder.useModule('ui/dialog');
