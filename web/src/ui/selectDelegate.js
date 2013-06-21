/**
 * @fileoverview Select Delegate
 * @author wangye.zhao@wandoujia.com
 */
wonder.addModule('SelectDelegate', function(W) {
    W.namespace('wonder.ui');

    /**
     * Select Delegate
     *
     * @constructor
     * @extends {wonder.ui.UIBase}
     * @param {Object|null} config An object contains user defined
     * configurations.
     */
    var SelectDelegate = Backbone.View.extend({
        _isRendered : false,
        /**
         * @override
         */
        initialize : function() {
            var self = this;
            this.selectedItems = [];
            this.$el = $('<input>').prop('type', 'checkbox');
            this.$el.bind('click', $.proxy(this.clickCheckbox, this));
            // Events binding
            this.bind('unchecked', function() {
                self.setChecked(false);
            });
        },
        /**
         * @override
         */
        render : function(target) {
            if(!this._isRendered) {
                $(target).append(this.$el);
                this._isRendered = true;
            }
            return this;
        },
        setChecked : function(checked) {
            this.$el.prop('checked', checked);
        },
        setDisabled : function(disabled){
            this.$el.prop('disabled', disabled);
        },
        /**
         * Click checkbox
         *
         * @param {object} evt Click event object
         */
        clickCheckbox : function(evt) {
            if(this.$el.prop('checked')) {
                this.trigger('checked');
            } else {
                this.trigger('unchecked');
            }
        },
        /**
         * Events binding
         */
        events : {
            'click' : 'clickCheckbox'
        },
        /**
         * Add an item
         *
         * @param {object} item Item to be added
         */
        add : function(item) {
            var self = this;
            if(item && W.isObject(item) && item.get && item.get('id') && !$.isArray(item)) {
                var isExisted = false;
                _.each(this.selectedItems, function(itemExisted) {
                    if(itemExisted.get('id') === item.get('id')) {
                        isExisted = true;
                        return;
                    }
                });
                if(isExisted) {
                    return;
                }

            } else if($.isArray(item)){
                
                    if(!self.selectedItems.length){
                        self.setSelectedItems(item); 
                    }else{
                        _.each(item, function(newItem){
                            if(self.selectedItems.indexOf(newItem) === -1){
                                self.selectedItems.push(newItem);
                            }
                        });
                    }
            
                this.trigger('add', item);
                return;
            } else {
                if(this.selectedItems.indexOf(item) !== -1) {
                    return;
                }
            }
            this.selectedItems.push(item);
            this.trigger('add', item);
        },
        /**
         * Remove an item
         *
         * @param {object} item Item to be removed
         */
        remove : function(item) {
            var self = this;
            if(item && W.isObject(item) && item.get && item.get('id') && !$.isArray(item)) {
                var tempItem = null;
                _.each(this.selectedItems, function(itemExisted) {
                    if(itemExisted.get('id') === item.get('id')) {
                        tempItem = itemExisted;
                        return;
                    }
                });
                if(tempItem) {
                    this.selectedItems.splice(this.selectedItems.indexOf(tempItem), 1);
                }
            } else if($.isArray(item)){
                var index;
                _.each(item, function(willBeRemovedItem){
                    index = self.selectedItems.indexOf(willBeRemovedItem);
                    if(index !== -1){
                        self.selectedItems.splice(index, 1);
                    }
                })
            } else {
                this.selectedItems.splice(this.selectedItems.indexOf(item), 1);
            }
            this.trigger('remove', item);
            if(this.selectedItems.length === 0) {
                this.trigger('empty');
            }
        },
        /**
        * Set setSelectedItems
        */
        setSelectedItems : function(selectedItems){
            this.selectedItems = selectedItems;
        },
        /**
         * Reset this delegate
         */
        reset : function() {
            this.selectedItems = [];
            this.setChecked(false);
            this.trigger('empty');
        },
        /**
         * Get all items in delegate pool
         */
        getList : function() {
            return this.selectedItems;
        },
        /**
         * Get the size of delegate pool
         */
        size : function() {
            return this.selectedItems.length;
        },
        /**
         * Show component
         */
        show : function() {
            this.$el.show();
            this.trigger('show');
        },
        /**
         * Hide component
         */
        hide : function() {
            this.$el.hide();
            this.trigger('hide');
        },
        /**
         * Return true if delegate is empty
         *
         * @return {boolean} True if delegate is empty
         */
        isEmpty : function() {
            return this.selectedItems.length === 0;
        },
        /**
         * Return true if delegate is checked
         */
        isChecked : function() {
            return this.$el.prop('checked');
        }
    });
    W.ui.SelectDelegate = SelectDelegate;
});
wonder.useModule('SelectDelegate');
