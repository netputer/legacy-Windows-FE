/**
 * Notification Component use HTML5 Desktop Notification API
 *
 * @author wangye.zhao@wandoujia.com
 */
wonder.addModule('Notification', function(W) {
    W.namespace('wonder.ui');

    var doc = W.host.document;

    /**
     * @constructor LightTip
     */
    function LightTip() {
        W.ui.UIBase.call(this);
    }

    W.extend(LightTip, W.ui.UIBase);
    W.mix(LightTip.prototype, {
        _attachTarget : null,
        attach : function(target) {
            this._attachTarget = target;
        },
        setContent : function(content) {
            this._element.html(content);
            this.setPosition();
        },
        show : function(opt_parent, opt_position) {
            if(!this._isRendered) {
                this.render(opt_parent);
            }
            LightTip._super_.show.call(this);
            this.setPosition(opt_position);
        },
        setPosition: function(opt_position){
            if(opt_position){
                this._element.css(opt_position);
            }else if(this._attachTarget) {
                var target = $(this._attachTarget);
                var targetOffset = target.offset();
                var offsetLeft = targetOffset.left + target.width();
                var selfWidth = this._element.width();
                
                if(!this._attachTarget.is(':visible'))return;
                
                if((offsetLeft + selfWidth) >= $(window).width()){
                    offsetLeft = $(window).width() - selfWidth - 10;
                }
                this._element.css({
                    left : offsetLeft,
                    top : targetOffset.top - this._element.height()
                });
            }
            
        },
        render : function(opt_parent) {
            if(!this._isRendered) {
                this._element = $('<div/>').addClass('w-ui-lighttip');
                this._element.appendTo(opt_parent || doc.body);
                this._isRendered = true;
            }
        }
    });
    W.ui.LightTip = LightTip;
});
wonder.useModule('Notification');
