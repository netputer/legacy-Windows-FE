/**
 * @fileoverview Progress monitor
 * @author wangye.zhao@wandoujia.com
 *
 */
wonder.addModule('ui/ProgressMonitor', function(W) {

    /**
     * @constructor
     */
    function ProgressMonitor() {
        this._count = 0;
    }

    W.extend(ProgressMonitor, W.ui.UIBase);
    /**
     * Add a count to list
     */
    ProgressMonitor.prototype.add = function() {
        this._count++;
        if(this._isRendered) {
            this._element.show();
        }
    };
    /**
     * Subduct a count from list
     */
    ProgressMonitor.prototype.remove = function() {
        if(this._count >= 1) {
            this._count--;
        }
        if(this._count === 0 && this._isRendered) {
            this._element.hide();
        }
    };
    /**
     * @implement
     */
    ProgressMonitor.prototype.render = function(opt_parent) {
        if(!this._element) {
            this._element = $('<div>').addClass('w-progress');
            this._element.appendTo(opt_parent || document.body);
            this._isRendered = true;
        }
        return this;
    };
    W.ui.ProgressMonitor = ProgressMonitor;
});
wonder.useModule('ui/ProgressMonitor');
