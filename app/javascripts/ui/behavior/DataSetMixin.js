/*global define*/
(function (window) {
    define(['underscore'], function (_) {
        console.log('DataSetMixin - File loaded.');

        var DataSetMixin = {};

        DataSetMixin.switchSet = function (name, getter) {
            var targetSet = _.find(this.dataSet, function (set) {
                return set.name === name;
            });

            var oldSet = this.currentSet;

            if (targetSet === undefined) {
                var set = {
                    name : name,
                    getter : getter
                };

                this.dataSet.push(set);
                this.currentSet = set;
            } else {
                if (this.currentSet.name === name) {
                    if (getter) {
                        this.currentSet.getter = getter;
                    }
                } else {
                    this.lastSelect = undefined;
                    this.currentSet = targetSet;

                    if (getter) {
                        this.currentSet.getter = getter;
                    }
                }
            }

            this.trigger('switchSet', this.currentSet);

            var currentModels = this.currentModels;
            this.toggleEmptyTip(currentModels.length === 0);

            this.switchComparator();

            if (currentModels.length === 0 || (this.currentSet.name != oldSet.name)) {
                this.clearList();
                this.init();
                return;
            }

            this.calculateSettings();

            var scrollTop = this.$scrollContainer.scrollTop();
            var scrollHeight = currentModels.length * this.itemHeight;
            if (scrollTop >= scrollHeight) {
                scrollTop = Math.max(0, scrollHeight - this.containerHeight);
            }
            this.scrollHeight = scrollHeight;
            this.offsetY = -scrollTop;
            this.$scrollContainer.scrollTop(scrollTop).show();

            this.createItemView();

            this.build(true);

        };

        DataSetMixin.clearSet = function () {
            this.dataSet.length = 0;
            delete this.currentSet.name;
            delete this.currentSet.getter;
        };

        return {
            mixin : function (that) {
                _.extend(that, DataSetMixin);
                var dataSet = [];
                var currentSet = {
                    name : '',
                    getter : function () {
                        return [];
                    }
                };

                Object.defineProperties(that, {
                    dataSet : {
                        set : function (value) {
                            if (value instanceof Array) {
                                var i;
                                var length = value.length;
                                for (i = 0, length = value.length; i < length; i++) {
                                    dataSet.push(value[i]);
                                    if (value[i].name === 'default') {
                                        currentSet = value[i];
                                    }
                                }
                            } else {
                                console.error('SmartList - DataSet type error.');
                            }
                        },
                        get : function () {
                            return dataSet;
                        }
                    },
                    currentSet : {
                        set : function (value) {
                            if (value.hasOwnProperty('name') && value.hasOwnProperty('getter')) {
                                currentSet = value;
                            } else {
                                console.error('SmartList - CurrentSet type error.');
                            }
                        },
                        get : function () {
                            return currentSet;
                        }
                    },
                    currentModels : {
                        get : function () {
                            return currentSet.getter.call(this.listenToCollection || this.options.listenToCollection);
                        }
                    }
                });
            }
        };
    });
}(this));
