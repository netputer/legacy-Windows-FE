/*global define, console*/
(function (window) {
    define(['underscore'], function (_) {
        console.log('SelectDelegateMixin - File loaded.');

        var SelectDelegateMixin = {};

        SelectDelegateMixin.mixin = function (that) {
            _.extend(that, SelectDelegateMixin);
            var selected = [];
            var selectedSet = {};
            var keepSelect = false;
            var currentSetName;
            Object.defineProperties(that, {
                selected : {
                    set : function (value) {
                        if (value instanceof Array) {
                            selected = value;
                        } else {
                            console.error('SelectDelegateMixin - Seleted type error.');
                        }
                    },
                    get : function () {
                        return selected;
                    }
                },
                selectedSet : {
                    get : function () {
                        return selectedSet;
                    }
                },
                keepSelect : {
                    set : function (value) {
                        keepSelect = value;
                    },
                    get : function () {
                        return keepSelect;
                    }
                },
                currentSetName : {
                    get : function () {
                        return currentSetName;
                    }
                }
            });

            that.on('switchSet', function (dataSet) {
                if (currentSetName) {
                    selectedSet[currentSetName] = selected.concat();
                }

                var originalSetName = currentSetName;

                currentSetName = dataSet.name;

                var originalSelected = selected.concat();

                var targetSet;
                if (selectedSet[currentSetName]) {
                    targetSet = selectedSet[currentSetName];
                } else {
                    targetSet = selectedSet[currentSetName] = [];
                }

                var currentIds = _.pluck(dataSet.getter.call(this.listenToCollection), 'id');
                if (keepSelect) {
                    var intersection = _.intersection(currentIds, this.getAllSelected());
                    selected = _.uniq(targetSet.concat(intersection));
                } else {
                    selected = _.intersection(currentIds, targetSet.concat());
                }

                selectedSet[currentSetName] = selected;

                if (selected.length !== 0 && selected.length === this.currentModels.length) {
                    this.trigger('select:all');
                } else if (selected === 0) {
                    this.trigger('empty');
                } else {
                    this.trigger('select:partial');
                }

                if (!_.isEqual(originalSelected, selected) || originalSetName !== currentSetName) {
                    this.trigger('select:change', selected);
                }
            }, that);

            that.on('select:add select:remove', function () {
                that.trigger('select:change', selected);
            }, that);

            that.on('build', that.highlightSelected, that);
        };

        SelectDelegateMixin.highlightSelected = function () {
            var allSelected = this.getAllSelected();

            _.each(this.active, function (item) {
                item.toggleSelect(allSelected.indexOf(item.model.get('id')) >= 0);
            }, this);
        };

        SelectDelegateMixin.getAllSelected = function () {
            var result = [];
            if (this.keepSelect) {
                var selected = [];
                var key;
                for (key in this.selectedSet) {
                    if (this.selectedSet.hasOwnProperty(key)) {
                        selected = selected.concat(this.selectedSet[key]);
                    }
                }

                result = _.uniq(selected);
            } else {
                result = this.selected;
            }
            return result;
        };

        SelectDelegateMixin.addSelect = function (item, options) {
            if (item instanceof Array && item.length === 1) {
                item = item[0];
            }

            options = options || {};

            var added;

            var selected = this.selected;

            if (item instanceof Array) {
                added = _.difference(item, _.intersection(selected, item));

                selected = _.uniq(selected.concat(item));
            } else {
                if (selected.indexOf(item) < 0) {
                    added = item;

                    selected.push(item);
                }
            }

            this.selectedSet[this.currentSet.name] = this.selected = selected.concat();

            if (added instanceof Array) {
                _.each(this.active, function (itemView) {
                    if (added.indexOf(itemView.model.id) >= 0) {
                        itemView.toggleSelect(true);
                    }
                }, this);
            } else {
                _.each(this.active, function (itemView) {
                    if (itemView.model.id === added) {
                        itemView.toggleSelect(true);
                    }
                }, this);
            }

            if (!options.silent && (added instanceof Array ? added.length > 0 : added)) {
                this.trigger('select:add', added);
                if (selected.length === this.currentModels.length) {
                    this.trigger('select:all');
                }
            }
        };

        SelectDelegateMixin.removeSelect = function (item, options) {
            if (item instanceof Array && item.length === 1) {
                item = item[0];
            }

            options = options || {};

            var selected = this.keepSelect ? this.getAllSelected() : this.selected;

            var removed;
            var index;

            if (item instanceof Array) {
                removed = _.intersection(selected, item);

                selected = _.difference(selected, removed);
            } else {
                index = selected.indexOf(item);
                if (index >= 0) {
                    removed = item;
                    selected.splice(index, 1);
                }
            }

            if (this.keepSelect) {
                var selectedSet = this.selectedSet;
                var key;
                var items;
                for (key in selectedSet) {
                    if (selectedSet.hasOwnProperty(key)) {
                        if (key !== this.currentSetName) {
                            items = selectedSet[key];
                            if (item instanceof Array) {
                                this.selectedSet[key] = _.difference(items, item);
                            } else {
                                index = items.indexOf(item);
                                if (index >= 0) {
                                    items.splice(index, 1);
                                    this.selectedSet[key] = items;
                                }
                            }
                        }
                    }
                }
            }

            this.selectedSet[this.currentSet.name] = this.selected = selected.concat();

            if (removed instanceof Array) {
                _.each(this.active, function (itemView) {
                    if (removed.indexOf(itemView.model.id) >= 0) {
                        itemView.toggleSelect(false);
                    }
                }, this);
            } else {
                _.each(this.active, function (itemView) {
                    if (itemView.model.id === removed) {
                        itemView.toggleSelect(false);
                    }
                }, this);
            }

            if (!options.silent && (removed instanceof Array ? removed.length > 0 : removed)) {
                this.trigger('select:remove', item);
                this.trigger('select:partial');

                if (selected.length === 0) {
                    this.trigger('select:empty', item);
                }
            }
        };

        SelectDelegateMixin.deselectAll = function (options) {
            options = options || {};
            this.removeSelect(this.selected.concat(), {
                silent : options.silent
            });
        };

        SelectDelegateMixin.erase = function (options) {
            options = options || {};
            this.removeSelect(this.getAllSelected().concat(), {
                silent : options.silent
            });
        };

        SelectDelegateMixin.selectAll = function () {
            var models = _.filter(this.currentModels, function (model) {
                return !model.get('updateCategory');
            });

            this.addSelect(_.pluck(models, 'id'));
        };

        return SelectDelegateMixin;
    });
}(this));
