/**
 * @fileoverview Toolbar
 * @author wangye.zhao@wandoujia.com
 */
wonder.addModule('ui/toolbar', function(W) {
    /**
     * @constructor Toolbar
     */
    function Toolbar() {
        W.ui.UIBase.call(this);
        this._components = {};
    }
    W.extend(Toolbar, W.ui.UIBase);
    Toolbar.prototype.addComponent = function(name, component) {
        if(this._components[name]){
            console.error('The ' + name + ' component existed.');
        }
        this._components[name] = component;
        component.render(this._element);
        // QUESTION: what if `component` has rendered before? what if a child element needs to move from one parent element to another?
        // TODO: child element should not need to know its parent during and only during render phase.
        // TODO: find a better solution for describing parent/child element relationship.
        return this;
    };
    Toolbar.prototype.getComponent = function(name){
        return this._components[name];
    };
    Toolbar.prototype.render = function(opt_parent) {
        if(!this._isRendered) {
            this._element = $('<div/>').addClass('w-ui-toolbar hbox');
            this._element.appendTo(opt_parent || doc.body);
            this._isRendered = true;
        }
        return this;
    };
    W.ui.Toolbar = Toolbar;
});
wonder.useModule('ui/toolbar');
