/**
 * @fileoverview uibase provide the based property of ui component.
 * @author jingfeng@wandoujia.com
 */
wonder.addModule('uibase', function(W) {
    W.namespace('wonder.ui');

    function UIBase(config) {
        // Init attributes and functions
        this._config = config ? W.mix(config, this._defaults, false) : this._defaults;
    };

    W.mix(UIBase.prototype, W.events);
    // TODO: W.events & W.ui.event is too confusing. just use Backbone.Events instead.

    /**
     *@type {Object} ,
     *@override
     */
    UIBase.prototype._defaults = {
    };
    /**
     * ui root element, it should be overide in subclass
     * @type {Element}
     * @private
     */
    UIBase.prototype._element = null;
    UIBase.prototype._value = null;
    UIBase.prototype._isVisible = true;
    UIBase.prototype._isRendered = false;
    UIBase.prototype._disabled = false;
    UIBase.prototype._uid = '';
    UIBase.prototype.propagation= true;
    
    /**
     * Call this method before ui render.
     * @param {Object} propagation
     */
    UIBase.prototype.setPropagation = function(propagation){
        this.propagation = propagation;
    };
    UIBase.prototype.getPropagation = function(propagation){
        return this.propagation;
    };
    UIBase.prototype.setValue = function(value) {
        this._value = value;
    };
    UIBase.prototype.getValue = function() {
        return this._value;
    };
    UIBase.prototype.isVisible = function() {
        return this._isVisible;
    };
    UIBase.prototype.isRendered = function() {
        return this._isRendered;
    };
    UIBase.prototype.getElement = function() {
        return this._element;
    };
    UIBase.prototype.getUid = function() {
        this._uid = this._uid || W.getUid();
        return this._uid;
    }; 
    UIBase.prototype.setDisabled = function() {
        //TO-DO
    };
    UIBase.prototype.isDisabled = function() {
        return this._disabled;
    };
    UIBase.prototype.focus = function(){
        this._element.focus();
    };
    UIBase.prototype.hasFocus = function(){
        //Implement this in subclass;
    };
    UIBase.prototype.active = function(){
        //Implement this in subclass;
    };
    
    /**
     * @param {String} className , add class to this ui root element.
     */
    UIBase.prototype.addClassName = function(className) {
        $(this._element).addClass(className);
        // QUESTION: what if `this._element === null`?
        return this;
    };
    UIBase.prototype.removeClassName = function(className) {
        $(this._element).removeClass(className);
        // QUESTION: what if `this._element === null`?
        return this;
    };
    /**
     * The template will be used
     * @type {string}
     * @private
     */
    UIBase.prototype._template = null;

    UIBase.prototype.hide = function() {
        this._element.hide();
        this._isVisible = false;
        return this;
    };
    UIBase.prototype.show = function() {
        this._element.show();
        this._isVisible = true;
        return this;
    };
    
    UIBase.prototype.dispose = function() {
        this._disposeInternal();
    };
    
    UIBase.prototype._disposeInternal = function() {
        //Implement this in subclass.
    };
    
    /**
     * @opt_parent {Node}, component container
     * @override
     */
    UIBase.prototype.render = function(opt_parent) {
        // QUESTION: why `opt_parent` is provided but not used at all?
        // Setup template if <code>templatePath</code> is given
        if(this._config.templatePath) {
            this.getTemplate(this._config.templatePath);
        }
    };
    /**
     * Get an external template file use jQeury.ajax()
     *
     * @param {string} path The path of the template file
     * @param {Function} callback The function to callback
     * @return {string} Return the template as string
     */
    UIBase.prototype.getTemplate = function(path) {
        var self = this;
        $.ajax({
            url : path,
            success : function(response) {
                console.log('UI Base - Success to load template file: ' + path, $(response));
                self._template = response;
            },
            error : function() {
                // QUESTION: what would user see if program runs into this place?
                console.error('UI Base - Failed to load template file with given path: ' + path);
            },
            dataType : 'text',
            async : false
        });
    };
    W.ui.UIBase = UIBase;
});
wonder.useModule('uibase');
